import { NextResponse } from "next/server";
import {
  getInterviews,
  scheduleInterview,
  updateInterviewFeedback,
  getInterviewQuestions,
  saveInterviewQuestions,
  updateInterviewQuestion,
  deleteInterviewQuestion,
  getApplicationById,
  getCandidateById,
  getJobById,
  updateApplicationStage,
} from "@/lib/db";
import { InterviewSchedule } from "@/types";
import { generateInterviewQuestions } from "@/lib/ai";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");

    const interviews = getInterviews();
    if (applicationId) {
      const filtered = interviews.filter((i) => i.applicationId === applicationId);
      let questions = getInterviewQuestions(applicationId);

      // Auto-generate if empty
      if (questions.length === 0) {
        const app = getApplicationById(applicationId);
        if (app) {
          const cand = getCandidateById(app.candidateId);
          const job = getJobById(app.jobId);
          if (cand && job) {
            questions = await generateInterviewQuestions(cand, job);
            saveInterviewQuestions(applicationId, questions);
          }
        }
      }

      return NextResponse.json({ success: true, interviews: filtered, questions });
    }

    return NextResponse.json({ success: true, interviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Submit Interview Feedback
    if (action === "feedback") {
      const { interviewId, feedback } = body;
      const updated = updateInterviewFeedback(interviewId, feedback);
      return NextResponse.json({ success: true, interview: updated });
    }

    // 2. Edit Question (Requirement 3.7)
    if (action === "edit_question") {
      const { applicationId, question } = body;
      const updatedQuestions = updateInterviewQuestion(applicationId, question);
      return NextResponse.json({ success: true, questions: updatedQuestions });
    }

    // 3. Delete Question (Requirement 3.7)
    if (action === "delete_question") {
      const { applicationId, questionId } = body;
      const updatedQuestions = deleteInterviewQuestion(applicationId, questionId);
      return NextResponse.json({ success: true, questions: updatedQuestions });
    }

    // 4. Regenerate Questions (Requirement 3.7)
    if (action === "regenerate_questions") {
      const { applicationId } = body;
      const app = getApplicationById(applicationId);
      if (!app) {
        return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
      }
      const cand = getCandidateById(app.candidateId);
      const job = getJobById(app.jobId);
      if (!cand || !job) {
        return NextResponse.json({ success: false, error: "Candidate or Job not found" }, { status: 404 });
      }
      const newQuestions = await generateInterviewQuestions(cand, job);
      saveInterviewQuestions(applicationId, newQuestions);
      return NextResponse.json({ success: true, questions: newQuestions });
    }

    // 5. Schedule Interview with Conflict Detection (Requirement 3.8)
    const existingInterviews = getInterviews();
    const schedDate = body.scheduledDate || new Date().toISOString().slice(0, 10);
    const schedTime = body.scheduledTime || "14:00";

    const hasConflict = existingInterviews.some(
      (i) => i.scheduledDate === schedDate && i.scheduledTime === schedTime && i.status === "SCHEDULED"
    );

    if (hasConflict && !body.allowConflict) {
      return NextResponse.json({
        success: false,
        conflictDetected: true,
        message: `Conflict Detected: An interview is already scheduled for ${schedDate} at ${schedTime}. Please choose another slot or select force schedule.`,
      });
    }

    // Resolve candidateId and jobId from application if missing
    let candidateId = body.candidateId;
    let jobId = body.jobId;
    if (body.applicationId && (!candidateId || !jobId)) {
      const app = getApplicationById(body.applicationId);
      if (app) {
        candidateId = candidateId || app.candidateId;
        jobId = jobId || app.jobId;
      }
    }

    const newInterview: InterviewSchedule = {
      id: `int_${Date.now()}`,
      applicationId: body.applicationId,
      candidateId: candidateId || "cand_alex_rivera",
      jobId: jobId || "job_backend_1",
      scheduledDate: schedDate,
      scheduledTime: schedTime,
      interviewerName: body.interviewerName || "Sarah Chen",
      interviewerEmail: body.interviewerEmail || "sarah.chen@nexacorp.io",
      interviewType: body.interviewType || "TECHNICAL",
      meetingLink: body.meetingLink || `https://meet.nexacorp.io/interview-${Date.now().toString().slice(-4)}`,
      hasConflict,
      status: "SCHEDULED",
    };

    scheduleInterview(newInterview);

    // Progress application status to INTERVIEW if applicable
    if (body.applicationId) {
      updateApplicationStage(
        body.applicationId,
        "INTERVIEW",
        newInterview.interviewerName || "Recruiter",
        "RECRUITER",
        `Technical interview scheduled for ${schedDate} at ${schedTime}`
      );
    }

    return NextResponse.json({ success: true, interview: newInterview, conflictDetected: hasConflict });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
