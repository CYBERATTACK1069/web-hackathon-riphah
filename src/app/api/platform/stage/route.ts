import { NextResponse } from "next/server";
import { updateApplicationStage } from "@/lib/store";
import { ApplicationStage, UserRole } from "@/types/platform";

export async function POST(request: Request) {
  try {
    const { applicationId, newStage, actor, notes } = await request.json();

    if (!applicationId || !newStage) {
      return NextResponse.json(
        { success: false, error: "Missing applicationId or newStage" },
        { status: 400 }
      );
    }

    const updatedApp = await updateApplicationStage(
      applicationId,
      newStage as ApplicationStage,
      actor || { id: "usr-recruiter-01", name: "Elena Vance", role: "recruiter" as UserRole },
      notes
    );

    if (!updatedApp) {
      return NextResponse.json(
        { success: false, error: "Application record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, application: updatedApp });
  } catch (error) {
    console.error("Failed to update application stage:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

