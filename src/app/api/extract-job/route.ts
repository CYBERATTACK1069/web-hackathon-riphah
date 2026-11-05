import { NextResponse } from "next/server";
import { extractJobRequirementsFromText } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const description = body.description || body.text || "";

    if (!description.trim()) {
      return NextResponse.json(
        { success: false, error: "Job description text is required" },
        { status: 400 }
      );
    }

    const extracted = await extractJobRequirementsFromText(description);

    return NextResponse.json({
      success: true,
      requirements: {
        skills: extracted.requiredSkills,
        minExperienceYears: extracted.minExperienceYears,
        qualifications: extracted.qualifications,
        preferredSkills: extracted.preferredSkills,
      },
      extracted,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
