import { NextResponse } from "next/server";
import { getJobs, createJob, updateJob, updateJobStatus } from "@/lib/db";
import { extractJobRequirementsFromText } from "@/lib/ai";

export async function GET() {
  try {
    const jobs = getJobs();
    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // AI Extraction action
    if (action === "extract" && body.description) {
      const extracted = await extractJobRequirementsFromText(body.description);
      return NextResponse.json({ success: true, extracted });
    }

    // Status transition action (Close / Reopen / Open)
    if (action === "update_status" && body.id && body.status) {
      const updated = updateJobStatus(body.id, body.status);
      return NextResponse.json({ success: true, job: updated });
    }

    // Full vacancy edit action
    if ((action === "update" || action === "edit") && body.id) {
      const { id, ...updates } = body;
      const updated = updateJob(id, updates);
      return NextResponse.json({ success: true, job: updated });
    }

    // Create new vacancy
    const job = createJob(body);
    return NextResponse.json({ success: true, job });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
