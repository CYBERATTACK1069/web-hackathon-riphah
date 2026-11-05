import { NextResponse } from "next/server";
import { getCandidateById, saveCandidateProfile, updateCandidateCorrections, getJobs, saveEvaluation } from "@/lib/db";
import { extractTextFromPdfBuffer, parseResumeContent } from "@/lib/pdf";
import { evaluateCandidateMatch } from "@/lib/ai";
import { CandidateProfile } from "@/types";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let rawText = "";
    let candidateId = "";
    let customFullName = "";
    let customEmail = "";

    // 1. Handle Multipart / File Upload (PDF, TXT)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      candidateId = (formData.get("candidateId") as string) || "";
      customFullName = (formData.get("fullName") as string) || "";
      customEmail = (formData.get("email") as string) || "";

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file was uploaded. Please attach a resume document." },
          { status: 400 }
        );
      }

      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith(".pdf") && !fileName.endsWith(".txt") && !fileName.endsWith(".docx")) {
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported document format for "${file.name}". Please upload a standard PDF (.pdf) or text (.txt) file.`,
          },
          { status: 400 }
        );
      }

      if (file.size === 0) {
        return NextResponse.json(
          { success: false, error: "The uploaded file is empty (0 bytes). Please upload a valid resume." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (fileName.endsWith(".pdf")) {
        rawText = extractTextFromPdfBuffer(buffer);
      } else {
        rawText = buffer.toString("utf-8");
      }

      if (!rawText.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "Could not extract readable text from the document. The document might be image-based, corrupted, or blank.",
          },
          { status: 400 }
        );
      }
    } else {
      // 2. Handle JSON Payload
      const body = await request.json();
      candidateId = body.candidateId || "";
      customFullName = body.fullName || "";
      customEmail = body.email || "";

      // Candidate correction UI action
      if (body.action === "update_skills" && candidateId) {
        const updated = updateCandidateCorrections(candidateId, { skills: body.skills });
        return NextResponse.json({
          success: true,
          candidate: updated,
          message: "Candidate skill corrections saved successfully",
        });
      }

      rawText = body.rawText || "";
      if (!rawText.trim()) {
        return NextResponse.json(
          { success: false, error: "Resume text is empty. Please paste resume content or upload a document." },
          { status: 400 }
        );
      }
    }

    // 3. Structured parsing of resume content
    const parsed = parseResumeContent(rawText, customFullName, customEmail);

    const candId = candidateId || `cand_${Date.now()}`;
    const existing = getCandidateById(candId);

    const profile: CandidateProfile = {
      id: candId,
      userId: existing?.userId || `usr_${Date.now()}`,
      fullName: parsed.fullName || existing?.fullName || "Candidate",
      email: parsed.email || existing?.email || "candidate@devmail.org",
      location: parsed.location || existing?.location || "Remote",
      summary: parsed.summary || existing?.summary || "Experienced software engineer.",
      skills: parsed.skills.length > 0 ? parsed.skills : existing?.skills || [],
      experience: parsed.experience.length > 0 ? parsed.experience : existing?.experience || [],
      projects: parsed.projects.length > 0 ? parsed.projects : existing?.projects || [],
      education: parsed.education.length > 0
        ? parsed.education.map((e, idx) => ({
            id: `edu_${Date.now()}_${idx}`,
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.fieldOfStudy,
            graduationYear: e.graduationYear,
          }))
        : existing?.education || [],
      rawResumeText: rawText,
      parsedAt: new Date().toISOString(),
      hasCandidateCorrections: false,
    };

    saveCandidateProfile(profile);

    // 4. Automatically re-evaluate candidate against top active job
    const jobs = getJobs();
    const activeJob = jobs[0];
    let evaluation = null;
    if (activeJob) {
      evaluation = await evaluateCandidateMatch(profile, activeJob, `app_${candId}`);
      saveEvaluation(evaluation);
    }

    return NextResponse.json({
      success: true,
      profile,
      evaluation,
      extractedSkills: profile.skills,
      extractedCount: profile.skills.length,
      message: `Successfully extracted ${profile.skills.length} normalized skills, work history, and education from resume!`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
