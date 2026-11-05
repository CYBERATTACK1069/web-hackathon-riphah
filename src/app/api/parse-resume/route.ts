/**
 * /api/parse-resume
 * Hardened Resume Upload, Extraction, & Interactive Candidate Edit Route (Requirement 3.3)
 *
 * Supports:
 * - POST: Multipart PDF/Text upload or JSON raw text parsing with strict 415/422/413 error guards,
 *   canonical normalization, and deterministic hallucination verification.
 * - PUT: Interactive candidate correction & edit handler to update extracted fields before saving to store.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  parseResumeText,
  extractTextFromPdf,
} from "@/lib/ai/resume-parser";
import { verifyAllClaims } from "@/lib/ai/verifier";
import { normalizeSkillName, toResumeSkillCategory } from "@/lib/ai/normalizer";
import { evaluateCandidateMatch } from "@/lib/ai/evaluator";
import {
  saveResume,
  getResumeById,
  saveEvaluation,
  saveApplication,
  saveInterviewQuestion,
} from "@/lib/store";
import { SEED_JOB_BACKEND } from "@/lib/seed-data";
import type { ParsedResume, ApplicationRecord } from "@/types/platform";

export const dynamic = "force-dynamic";

// 10 MB maximum file size limit
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * POST /api/parse-resume
 * Handles file uploads (PDF / Text) and JSON payload parsing.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const contentType = request.headers.get("content-type") || "";
    let rawText = "";
    let fileName = "resume_document.pdf";
    let fileSizeKB = 0;
    let mimeType = "application/pdf";
    let saveToStore = false;

    // 1. Multipart Form-Data (Direct File Upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      const saveParam = formData.get("saveToStore");
      if (saveParam === "true" || saveParam === "1") {
        saveToStore = true;
      }

      if (!file || !(file instanceof Blob)) {
        return NextResponse.json(
          {
            success: false,
            error: "No resume file attached in the 'file' form field.",
            code: "MISSING_FILE",
          },
          { status: 400 }
        );
      }

      // 413: Check file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: `File size (${Math.round(file.size / (1024 * 1024))}MB) exceeds maximum allowed limit of 10MB.`,
            code: "FILE_TOO_LARGE",
          },
          { status: 413 }
        );
      }

      // 422: Empty file
      if (file.size === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Uploaded file is 0 bytes (empty file).",
            code: "CORRUPTED_OR_EMPTY_FILE",
          },
          { status: 422 }
        );
      }

      fileName = (file as File).name || "uploaded_resume.pdf";
      fileSizeKB = Math.round(file.size / 1024);
      mimeType = file.type || "application/pdf";

      // 415: Validate supported MIME type and extension
      const lowerName = fileName.toLowerCase();
      const isPdf = mimeType.includes("pdf") || lowerName.endsWith(".pdf");
      const isText =
        mimeType.includes("text/plain") ||
        mimeType.includes("text/markdown") ||
        lowerName.endsWith(".txt") ||
        lowerName.endsWith(".md");

      if (!isPdf && !isText) {
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported file format '${mimeType || fileName}'. Only PDF (.pdf) and plain text (.txt) files are supported.`,
            code: "UNSUPPORTED_MEDIA_TYPE",
          },
          { status: 415 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (isPdf) {
        try {
          rawText = await extractTextFromPdf(buffer);
        } catch (pdfErr: unknown) {
          const msg = pdfErr instanceof Error ? pdfErr.message : String(pdfErr);
          console.warn("[POST /api/parse-resume] PDF extraction failed:", msg);
          return NextResponse.json(
            {
              success: false,
              error: `The uploaded PDF is empty, password-protected, or corrupted: ${msg}`,
              code: "CORRUPTED_OR_EMPTY_FILE",
            },
            { status: 422 }
          );
        }
      } else {
        // Plain text file
        rawText = buffer.toString("utf-8").trim();
      }
    } else if (contentType.includes("application/json")) {
      // 2. Direct JSON body with rawText or base64 file
      const body = await request.json();
      saveToStore = Boolean(body.saveToStore);

      if (body.base64Pdf) {
        try {
          const buffer = Buffer.from(body.base64Pdf, "base64");
          if (buffer.length > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
              {
                success: false,
                error: "Base64 payload exceeds 10MB limit.",
                code: "FILE_TOO_LARGE",
              },
              { status: 413 }
            );
          }
          rawText = await extractTextFromPdf(buffer);
          fileName = body.fileName || "base64_resume.pdf";
          fileSizeKB = Math.round(buffer.length / 1024);
        } catch (err: unknown) {
          return NextResponse.json(
            {
              success: false,
              error: `Failed to decode or parse PDF buffer: ${err instanceof Error ? err.message : String(err)}`,
              code: "CORRUPTED_OR_EMPTY_FILE",
            },
            { status: 422 }
          );
        }
      } else if (typeof body.rawText === "string") {
        rawText = body.rawText.trim();
        fileName = body.fileName || "raw_text_resume.txt";
        mimeType = "text/plain";
        fileSizeKB = Math.round(rawText.length / 1024) || 1;
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "JSON request must provide either 'rawText' or 'base64Pdf'.",
            code: "INVALID_REQUEST_BODY",
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported Content-Type. Please use multipart/form-data or application/json.",
          code: "UNSUPPORTED_MEDIA_TYPE",
        },
        { status: 415 }
      );
    }

    // 422: Validate text length
    if (!rawText || rawText.length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: "Document contains insufficient readable text (fewer than 20 characters). The file may be empty or contain non-OCR scanned images.",
          code: "CORRUPTED_OR_EMPTY_FILE",
        },
        { status: 422 }
      );
    }

    // 3. Execute Structured AI Parsing Pipeline
    const parseResult = await parseResumeText(rawText, {
      fileName,
      fileSizeKB,
      mimeType,
    });

    // 4. Calculate Dynamic Match Evaluation (50/25/15/10) against Job Requisition
    const { evaluation, dynamicQuestions } = evaluateCandidateMatch(
      parseResult.resume,
      SEED_JOB_BACKEND,
      parseResult.verificationReport
    );

    let saved = false;
    if (saveToStore) {
      await saveResume(parseResult.resume);
      await saveEvaluation(evaluation);

      const candidateId = parseResult.resume.candidateId || `cand-${Date.now().toString(36)}`;
      const newAppId = `app-${candidateId}`;

      const application: ApplicationRecord = {
        id: newAppId,
        candidateId,
        jobId: SEED_JOB_BACKEND.id,
        resumeId: parseResult.resume.id || `res-${candidateId}`,
        evaluationId: evaluation.id,
        appliedDate: new Date().toISOString(),
        currentStage:
          evaluation.verdict === "strong_match"
            ? "interview_scheduled"
            : "ai_evaluated",
        lastUpdated: new Date().toISOString(),
        candidateProfile: {
          fullName: parseResult.resume.contactInfo?.fullName || "Candidate",
          email: parseResult.resume.contactInfo?.email || "",
          phone: parseResult.resume.contactInfo?.phone,
          location: parseResult.resume.contactInfo?.location || "",
          headline:
            parseResult.resume.workExperience?.[0]?.title ||
            parseResult.resume.summary?.slice(0, 60) ||
            "Backend Engineer",
        },
        auditTrail: [
          {
            id: `aud-sub-${Date.now().toString(36)}`,
            timestamp: new Date().toISOString(),
            action: "Application Submitted & Resume Ingested",
            previousStage: undefined,
            newStage: "applied",
            actor: {
              id: candidateId,
              name: parseResult.resume.contactInfo?.fullName || "Candidate",
              role: "candidate",
            },
            notes: `Uploaded ${fileName} (${fileSizeKB}KB). Raw text extracted (${parseResult.rawText.length} chars).`,
          },
          {
            id: `aud-eval-${Date.now().toString(36)}`,
            timestamp: new Date().toISOString(),
            action: "AI Evaluation & Citation Mapping Completed",
            previousStage: "applied",
            newStage: "ai_evaluated",
            actor: {
              id: "sys-evaluator",
              name: "Swiss-Grid AI Talent Engine",
              role: "system",
            },
            notes: `Calculated ${evaluation.scoreBreakdown.compositeScore}% composite score. Verdict: ${evaluation.verdict}.`,
          },
        ],
        tags: [
          evaluation.verdict === "strong_match" ? "Shortlist Target" : "Under Review",
          evaluation.isHallucinationFlagged ? "Hallucination Alert" : "Verified Credentials",
        ],
      };

      await saveApplication(application);
      for (const q of dynamicQuestions) {
        await saveInterviewQuestion(q);
      }
      saved = true;
    }

    const executionTimeMs = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        data: {
          resume: parseResult.resume,
          verification: parseResult.verificationReport,
          evaluation,
          dynamicQuestions,
          modelUsed: parseResult.modelUsed,
          isFallback: parseResult.isFallback,
          savedToStore: saved,
        },
        meta: {
          executionTimeMs,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal processing error";
    console.error("[POST /api/parse-resume] Unhandled pipeline error:", error);

    return NextResponse.json(
      {
        success: false,
        error: `Resume parsing pipeline failed: ${errorMsg}`,
        code: "PARSING_FAILED",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/parse-resume
 * Candidate interactive editing handler.
 * Allows candidates to edit, add, or correct any extracted skill or field before persisting to store.
 */
export async function PUT(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Content-Type. Expected application/json.",
          code: "INVALID_CONTENT_TYPE",
        },
        { status: 415 }
      );
    }

    const body = await request.json();
    const incomingResume = (body.resume || body) as ParsedResume;

    if (!incomingResume || !incomingResume.id || !incomingResume.contactInfo) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payload: 'resume' object with 'id' and 'contactInfo' is required.",
          code: "INVALID_RESUME_PAYLOAD",
        },
        { status: 400 }
      );
    }

    // Re-normalize all skills to guarantee canonical naming consistency
    if (Array.isArray(incomingResume.normalizedSkills)) {
      incomingResume.normalizedSkills = incomingResume.normalizedSkills.map((skill) => {
        const norm = normalizeSkillName(skill.name || skill.normalizedName);
        return {
          ...skill,
          name: norm.canonicalName,
          normalizedName: norm.canonicalName,
          category: toResumeSkillCategory(norm.category),
        };
      });
    }

    // If rawText exists, execute full multi-section verification pass
    let verificationReport = null;
    if (incomingResume.rawText) {
      const claims: Array<{
        targetField: "skill" | "work_experience" | "project" | "education" | "certification";
        identifier: string;
        sourceExcerpt?: string;
        claimedYears?: number;
        startDate?: string;
        endDate?: string;
      }> = [];

      // Skills claims
      (incomingResume.normalizedSkills || []).forEach((s) => {
        claims.push({
          targetField: "skill",
          identifier: s.name,
          sourceExcerpt: s.name,
          claimedYears: s.claimedYears,
        });
      });

      // Work experience claims
      (incomingResume.workExperience || []).forEach((w) => {
        claims.push({
          targetField: "work_experience",
          identifier: `${w.title} at ${w.company}`,
          sourceExcerpt: w.bulletPoints?.[0] || `${w.title} ${w.company}`,
          startDate: w.startDate,
          endDate: w.endDate,
        });
      });

      // Project claims
      (incomingResume.projects || []).forEach((p) => {
        claims.push({
          targetField: "project",
          identifier: p.title,
          sourceExcerpt: p.summary || p.title,
        });
      });

      // Education claims
      (incomingResume.education || []).forEach((e) => {
        claims.push({
          targetField: "education",
          identifier: `${e.degree} - ${e.institution}`,
          sourceExcerpt: e.institution,
        });
      });

      // Certification claims
      (incomingResume.certifications || []).forEach((c) => {
        claims.push({
          targetField: "certification",
          identifier: c.title,
          sourceExcerpt: c.title,
        });
      });

      const report = verifyAllClaims(
        incomingResume.rawText,
        claims,
        incomingResume.workExperience || []
      );
      verificationReport = report;

      // Index citations by targetField:identifier
      const citationLookup = new Map<string, string[]>();
      for (const cit of report.citations) {
        const key = `${cit.targetField}:${cit.associatedIdentifier}`;
        const list = citationLookup.get(key) || [];
        list.push(cit.id);
        citationLookup.set(key, list);
      }

      // Update citationIds on skills
      incomingResume.normalizedSkills = (incomingResume.normalizedSkills || []).map((s) => ({
        ...s,
        citationIds: citationLookup.get(`skill:${s.name}`) || [],
      }));

      // Update citationIds on work experience
      incomingResume.workExperience = (incomingResume.workExperience || []).map((w) => ({
        ...w,
        citationIds: citationLookup.get(`work_experience:${w.title} at ${w.company}`) || [],
      }));

      // Update citationIds on projects
      incomingResume.projects = (incomingResume.projects || []).map((p) => ({
        ...p,
        citationIds: citationLookup.get(`project:${p.title}`) || [],
      }));

      // Update citationIds on education
      incomingResume.education = (incomingResume.education || []).map((e) => ({
        ...e,
        citationIds: citationLookup.get(`education:${e.degree} - ${e.institution}`) || [],
      }));

      incomingResume.excerptMapping = report.citations;
      incomingResume.parsingConfidence = parseFloat(
        (0.85 + report.verificationRatio * 0.14).toFixed(2)
      );
    }

    // Persist edited resume to platform store
    await saveResume(incomingResume);

    return NextResponse.json(
      {
        success: true,
        data: incomingResume,
        verification: verificationReport,
        message: "Resume successfully updated, re-verified, and saved to platform store.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Update failed";
    console.error("[PUT /api/parse-resume] Error updating resume:", error);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to update candidate resume: ${errorMsg}`,
        code: "UPDATE_FAILED",
      },
      { status: 500 }
    );
  }
}
