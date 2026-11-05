import { NextResponse } from "next/server";
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplicationStage,
  addRecruiterNote,
  getCandidateById,
  getEvaluationByApplicationId,
  saveEvaluation,
  overrideEvaluationScore,
  getJobs,
} from "@/lib/db";
import { PipelineStage, UserRole } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId") || undefined;
    const rawApps = getApplications(jobId);

    // Join candidate and evaluation data
    const enriched = rawApps.map((app) => {
      const candidate = getCandidateById(app.candidateId);
      const evaluation = getEvaluationByApplicationId(app.id);
      return {
        ...app,
        candidate,
        evaluation,
      };
    });

    return NextResponse.json({ success: true, applications: enriched });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, applicationId } = body;

    if (action === "update_stage") {
      const { toStage, actionBy, role, note } = body;
      const updated = updateApplicationStage(
        applicationId,
        toStage as PipelineStage,
        actionBy || "Sarah Chen",
        (role as UserRole) || "RECRUITER",
        note
      );
      if (!updated) {
        return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, application: updated });
    }

    if (action === "add_note") {
      const { authorId, authorName, content } = body;
      const updated = addRecruiterNote(applicationId, authorId || "usr_recruiter_1", authorName || "Sarah Chen", content);
      return NextResponse.json({ success: true, application: updated });
    }

    if (action === "apply" || action === "create") {
      const { candidateId, jobId } = body;
      if (!candidateId || !jobId) {
        return NextResponse.json({ success: false, error: "candidateId and jobId are required to apply" }, { status: 400 });
      }
      const newApp = createApplication(candidateId, jobId, "SUBMITTED");
      const cand = getCandidateById(candidateId);
      const jobs = getJobs();
      const targetJob = jobs.find((j) => j.id === jobId) || jobs[0];
      let evaluation = null;
      if (cand && targetJob) {
        const { evaluateCandidateMatch } = await import("@/lib/ai");
        evaluation = await evaluateCandidateMatch(cand, targetJob, newApp.id);
        saveEvaluation(evaluation);
      }
      return NextResponse.json({ success: true, application: newApp, evaluation });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
