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
    const description = typeof body.description === "string" ? body.description.trim() : "";

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

    let saved = false;
    if (body.saveToStore === true) {
      await saveJob(extractionResult.vacancy);
      saved = true;
    }

    const executionTimeMs = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
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
