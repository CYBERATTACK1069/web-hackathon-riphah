import { NextResponse } from "next/server";
import { getInterviewSchedules, saveInterviewSchedule, updateInterviewFeedback, getDatabase } from "@/lib/store";
import { InterviewSchedule, InterviewStatus } from "@/types/platform";

export async function GET() {
  try {
    const schedules = await getInterviewSchedules();
    return NextResponse.json({ success: true, schedules });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Submit Interview Feedback
    if (action === "feedback") {
      const { scheduleId, feedback } = body;
      if (!scheduleId || !feedback) {
        return NextResponse.json({ success: false, error: "Missing scheduleId or feedback" }, { status: 400 });
      }
      const updated = await updateInterviewFeedback(scheduleId, feedback);
      return NextResponse.json({ success: true, schedule: updated });
    }

    // 2. Schedule New Interview (with Conflict Detection)
    if (action === "schedule" || !action) {
      const {
        applicationId,
        jobId,
        candidateId,
        interviewType,
        title,
        scheduledAt,
        durationMinutes,
        meetingLink,
        interviewer,
        prepNotesForInterviewer,
      } = body;

      const existingSchedules = await getInterviewSchedules();

      // Check conflict: same scheduledAt timestamp or within same 45-min window for same interviewer
      const scheduledTime = new Date(scheduledAt).getTime();
      const hasConflict = existingSchedules.some((s) => {
        if (s.status === "cancelled") return false;
        const sTime = new Date(s.scheduledAt).getTime();
        const diffMinutes = Math.abs(scheduledTime - sTime) / (1000 * 60);
        return diffMinutes < 45 && s.interviewer?.email === (interviewer?.email || "elena.vance@talentswiss.io");
      });

      if (hasConflict && !body.allowConflict) {
        return NextResponse.json({
          success: false,
          conflictDetected: true,
          conflictMessage: "Schedule Conflict Detected: The interviewer already has a booking within 45 minutes of this time slot. Please select another slot or choose to override.",
        });
      }

      const newSchedule: InterviewSchedule = {
        id: `sch-${Date.now().toString(36)}`,
        applicationId: applicationId || "app-backend-001",
        jobId: jobId || "job-backend-001",
        candidateId: candidateId || "usr-candidate-01",
        interviewType: interviewType || "technical_deep_dive",
        title: title || "Technical Systems Architecture Interview",
        scheduledAt: scheduledAt || new Date(Date.now() + 86400000 * 2).toISOString(),
        durationMinutes: durationMinutes || 60,
        meetingLink: meetingLink || "https://meet.talentswiss.io/ch-tech-deepdive",
        interviewer: interviewer || {
          id: "usr-recruiter-01",
          name: "Elena Vance",
          email: "elena.vance@talentswiss.io",
          title: "Lead Technical Talent Partner",
        },
        status: "scheduled",
        prepNotesForInterviewer: prepNotesForInterviewer || [
          "Focus on high-concurrency PostgreSQL connection pooling and cache invalidation.",
          "Verify unmentioned Docker containerization claims.",
        ],
        questionIds: ["q-backend-01", "q-backend-02", "q-backend-03"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveInterviewSchedule(newSchedule);

      return NextResponse.json({
        success: true,
        schedule: newSchedule,
        conflictDetected: hasConflict,
        conflictMessage: hasConflict
          ? "Warning: Scheduled with conflict override."
          : null,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
