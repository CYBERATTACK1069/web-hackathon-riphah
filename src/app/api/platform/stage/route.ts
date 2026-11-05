import { NextResponse } from "next/server";
import { updateApplicationStage, updateApplicationNotes } from "@/lib/store";
import { ApplicationStage, UserRole } from "@/types/platform";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, applicationId, newStage, actor, notes, note } = body;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "Missing applicationId" },
        { status: 400 }
      );
    }

    // 1. Recruiter Note Action
    if (action === "add_note" || action === "update_note" || (!newStage && (note || notes))) {
      const noteContent = note || notes;
      const updatedApp = await updateApplicationNotes(
        applicationId,
        noteContent,
        actor || { id: "usr-recruiter-01", name: "Elena Vance", role: "recruiter" as UserRole }
      );
      if (!updatedApp) {
        return NextResponse.json(
          { success: false, error: "Application record not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, application: updatedApp });
    }

    // 2. Stage Transition Action
    if (!newStage) {
      return NextResponse.json(
        { success: false, error: "Missing newStage" },
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
    console.error("Failed to update application stage or notes:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
