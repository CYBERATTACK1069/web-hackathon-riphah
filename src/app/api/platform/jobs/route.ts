import { NextResponse } from "next/server";
import { getJobs, saveJob, updateJobStatus } from "@/lib/store";
import { extractJobRequirementsFromText } from "@/lib/ai";
import { JobVacancy, JobVacancyStatus, WeightedSkillRequirement } from "@/types/platform";

export async function GET() {
  try {
    const jobs = await getJobs();
    return NextResponse.json({ success: true, jobs });
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

    // 1. AI Requirement Extraction from free-text
    if (action === "extract" && body.description) {
      const extracted = await extractJobRequirementsFromText(body.description);
      return NextResponse.json({
        success: true,
        extracted: {
          title: body.title || "Senior Software Engineer",
          department: "Engineering",
          location: "Remote / Hybrid",
          skillWeights: extracted.requiredSkills.map((s, idx) => ({
            skillId: `skl-${idx + 1}`,
            name: s.name,
            category: s.category?.toLowerCase() || "framework",
            importance: s.importance >= 5 ? "critical" : s.importance >= 4 ? "important" : "nice_to_have",
            weight: Number((1 / extracted.requiredSkills.length).toFixed(2)),
            minimumYearsRequired: s.minYearsRequired || 3,
            description: `Core requirement extracted via AI (${s.importance}/5)`,
          })),
          minExperienceYears: extracted.minExperienceYears,
          qualifications: extracted.qualifications,
        },
      });
    }

    // 2. Status update (Close / Reopen)
    if (action === "update_status") {
      const { jobId, newStatus, changedBy, reason } = body;
      const updated = await updateJobStatus(jobId, newStatus as JobVacancyStatus, changedBy || "Elena Vance", reason);
      return NextResponse.json({ success: true, job: updated });
    }

    // 3. Create new job vacancy
    if (action === "create" || !action) {
      const {
        title,
        department,
        location,
        workplaceType,
        employmentType,
        experienceLevel,
        salaryRange,
        summary,
        description,
        responsibilities,
        qualifications,
        skillWeights,
      } = body;

      const newJob: JobVacancy = {
        id: `job-${Date.now().toString(36)}`,
        title: title || "Senior Platform Engineer",
        department: department || "Platform Engineering",
        location: location || "Zurich, Switzerland (Hybrid)",
        workplaceType: workplaceType || "hybrid",
        employmentType: employmentType || "full_time",
        experienceLevel: experienceLevel || "senior",
        salaryRange: salaryRange || { currency: "CHF", min: 140000, max: 175000, period: "annual" },
        summary: summary || description?.slice(0, 200) || "Critical engineering role.",
        description: description || "Lead engineering requisition.",
        responsibilities: responsibilities || [
          "Architect resilient microservices and distributed data pipelines.",
          "Lead design reviews and technical mentorship.",
        ],
        qualifications: qualifications || [
          "5+ years building distributed backend systems.",
          "Bachelor's or Master's in Computer Science or related quantitative field.",
        ],
        skillWeights: skillWeights || [
          { skillId: "skl-1", name: "Python", category: "language", importance: "critical", weight: 0.35, minimumYearsRequired: 5 },
          { skillId: "skl-2", name: "PostgreSQL", category: "database", importance: "important", weight: 0.25, minimumYearsRequired: 3 },
          { skillId: "skl-3", name: "Docker", category: "devops", importance: "important", weight: 0.20, minimumYearsRequired: 3 },
          { skillId: "skl-4", name: "Django", category: "framework", importance: "important", weight: 0.20, minimumYearsRequired: 4 },
        ],
        status: "open",
        statusHistory: [
          {
            status: "open",
            changedAt: new Date().toISOString(),
            changedBy: "Elena Vance",
            reason: "Initial vacancy published",
          },
        ],
        recruiterId: "usr-recruiter-01",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveJob(newJob);
      return NextResponse.json({ success: true, job: newJob });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
