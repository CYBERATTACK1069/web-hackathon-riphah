/**
 * POST /api/extract-job
 * AI Job Requirement Extractor Endpoint (Requirement 3.2)
 *
 * Accepts free-text job description, normalizes skills, distributes weights,
 * and extracts fully structured JobVacancy schema.
 */

import { NextRequest, NextResponse } from "next/server";
import { extractJobRequirements } from "@/lib/ai/job-extractor";
import { saveJob } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

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
    const rawDescription = body.description || body.text || "";
    const description = typeof rawDescription === "string" ? rawDescription.trim() : "";

    if (!description) {
      return NextResponse.json(
        {
          success: false,
          error: "Job description is required and cannot be empty.",
          code: "EMPTY_DESCRIPTION",
        },
        { status: 400 }
      );
    }

    if (description.length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: "Job description is too brief. Please provide at least 20 characters.",
          code: "DESCRIPTION_TOO_SHORT",
        },
        { status: 422 }
      );
    }

    // Run extractor pipeline
    const extractionResult = await extractJobRequirements({
      description,
      titleHint: body.title,
      departmentHint: body.department,
      locationHint: body.location,
    });

    // Ensure saveToStore defaults to false unless explicitly passed as true
    let saved = false;
    if (body.saveToStore === true) {
      await saveJob(extractionResult.vacancy);
      saved = true;
    }

    const executionTimeMs = Date.now() - startTime;

    const minExperienceYears =
      (extractionResult.vacancy as { minExperienceYears?: number }).minExperienceYears ??
      (extractionResult.vacancy.experienceLevel === "principal"
        ? 8
        : extractionResult.vacancy.experienceLevel === "lead"
        ? 7
        : extractionResult.vacancy.experienceLevel === "senior"
        ? 5
        : extractionResult.vacancy.experienceLevel === "mid"
        ? 3
        : 1);

    // Map required skills to { name, importance: 1-5, minYearsRequired, category } for native recruiter consume
    const mappedSkills = extractionResult.requiredSkills.map((s) => {
      const n = (s.name || "").toLowerCase();
      const c = (s.category || "").toLowerCase();
      let category: "FRONTEND" | "BACKEND" | "DEVOPS" | "AI_ML" | "DATABASE" | "GENERAL" = "BACKEND";
      if (c === "database" || /postgres|sql|mongo|redis|dynamo|database/i.test(n)) category = "DATABASE";
      else if (c === "devops" || /docker|kubernetes|k8s|aws|gcp|azure|ci\/cd|terraform/i.test(n)) category = "DEVOPS";
      else if (c === "frontend" || /react|vue|angular|html|css|tailwind|next\.?js|frontend/i.test(n)) category = "FRONTEND";
      else if (c === "ai_ml" || /machine learning|deep learning|pytorch|tensorflow|nlp|ai/i.test(n)) category = "AI_ML";
      else if (c === "language" || c === "framework" || c === "backend" || c === "architecture") category = "BACKEND";
      else category = "GENERAL";

      let importance = 3;
      if (s.importance === "critical") importance = 5;
      else if (s.importance === "important") importance = 4;
      else if (s.importance === "nice_to_have") importance = 2;
      else if (typeof s.weight === "number" && s.weight > 0) importance = Math.min(5, Math.max(1, Math.round(s.weight * 5)));

      return {
        name: s.name,
        importance,
        minYearsRequired: s.minimumYearsRequired || minExperienceYears || 2,
        category,
      };
    });

    const qualifications = extractionResult.vacancy?.qualifications || [];

    return NextResponse.json(
      {
        success: true,
        skills: mappedSkills,
        experienceYears: minExperienceYears,
        qualifications,
        data: {
          vacancy: extractionResult.vacancy,
          requiredSkills: extractionResult.requiredSkills,
          preferredSkills: extractionResult.preferredSkills,
          allSkillWeights: extractionResult.allSkillWeights,
          normalizationMap: extractionResult.normalizationMap,
          confidenceScore: extractionResult.confidenceScore,
          extractionModel: extractionResult.extractionModel,
          isFallback: extractionResult.isFallback,
          savedToStore: saved,
        },
        requirements: {
          skills: mappedSkills,
          requiredSkills: extractionResult.requiredSkills,
          minExperienceYears,
          qualifications,
          preferredSkills: extractionResult.preferredSkills,
        },
        extracted: extractionResult.vacancy,
        meta: {
          executionTimeMs,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown extraction error";
    console.error("[POST /api/extract-job] Error processing job extraction:", error);

    return NextResponse.json(
      {
        success: false,
        error: `Job extraction pipeline failed: ${errorMessage}`,
        code: "EXTRACTION_FAILED",
      },
      { status: 500 }
    );
  }
}
