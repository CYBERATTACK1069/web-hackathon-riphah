import fs from "fs";
import path from "path";
import defaultSeedData from "@/data/db.json";
import {
  DatabaseSchema,
  Job,
  CandidateProfile,
  Application,
  MatchEvaluation,
  InterviewSchedule,
  InterviewQuestion,
  PipelineStage,
  User,
  UserRole,
} from "@/types";

// DB file path
const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "db.json");

// In-Memory cache singleton for 0ms latency and sandboxed environments
let inMemoryDb: DatabaseSchema = JSON.parse(JSON.stringify(defaultSeedData));

/**
 * Loads the database state from disk or in-memory cache
 */
export function getDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
      inMemoryDb = JSON.parse(content);
      return inMemoryDb;
    }
  } catch (error) {
    console.warn("Using in-memory database fallback:", error);
  }
  return inMemoryDb;
}

/**
 * Saves database state to disk and updates in-memory cache
 */
export function saveDb(data: DatabaseSchema): void {
  inMemoryDb = data;
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.warn("Failed to persist to disk, updated in-memory state:", error);
  }
}

/**
 * Resets database back to default pre-seeded demo state (Judge Reset Feature)
 */
export function resetDatabaseToSeed(): DatabaseSchema {
  const freshSeed: DatabaseSchema = JSON.parse(JSON.stringify(defaultSeedData));
  saveDb(freshSeed);
  return freshSeed;
}

// ==========================================
// User Operations
// ==========================================
export function getUsers(): User[] {
  return getDb().users;
}

export function getUserById(id: string): User | undefined {
  return getDb().users.find((u) => u.id === id);
}

// ==========================================
// Job Operations
// ==========================================
export function getJobs(): Job[] {
  return getDb().jobs;
}

export function getJobById(id: string): Job | undefined {
  return getDb().jobs.find((j) => j.id === id);
}

export function createJob(jobData: Omit<Job, "id" | "createdAt" | "updatedAt" | "applicantCount">): Job {
  const db = getDb();
  const newJob: Job = {
    ...jobData,
    id: `job_${Date.now()}`,
    applicantCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.jobs.unshift(newJob);
  db.analytics.activeJobsCount = db.jobs.filter((j) => j.status === "OPEN").length;
  saveDb(db);
  return newJob;
}

export function updateJobStatus(id: string, status: "OPEN" | "CLOSED"): Job | undefined {
  const db = getDb();
  const job = db.jobs.find((j) => j.id === id);
  if (!job) return undefined;

  job.status = status;
  job.updatedAt = new Date().toISOString();
  db.analytics.activeJobsCount = db.jobs.filter((j) => j.status === "OPEN").length;
  saveDb(db);
  return job;
}

export function updateJob(
  jobId: string,
  updates: Partial<Job>
): Job | undefined {
  const db = getDb();
  const job = db.jobs.find((j) => j.id === jobId);
  if (!job) return undefined;

  Object.assign(job, updates, { updatedAt: new Date().toISOString() });
  saveDb(db);
  return job;
}

// ==========================================
// Candidate & Resume Operations
// ==========================================
export function getCandidates(): CandidateProfile[] {
  return getDb().candidates;
}

export function getCandidateById(id: string): CandidateProfile | undefined {
  const db = getDb();
  let cand = db.candidates.find((c) => c.id === id);
  if (!cand) {
    if (id === "cand_david_vance" || id === "cand_alex_rivera") {
      cand = db.candidates.find((c) => c.id === "cand_alex_rivera" || c.id === "cand_david_vance");
    } else if (id === "cand_elena_rostova" || id === "cand_maya_lin") {
      cand = db.candidates.find((c) => c.id === "cand_maya_lin" || c.id === "cand_elena_rostova");
    } else if (id === "cand_liam_oconnor" || id === "cand_tariq_mahmood") {
      cand = db.candidates.find((c) => c.id === "cand_tariq_mahmood" || c.id === "cand_liam_oconnor");
    }
  }
  return cand;
}

export function saveCandidateProfile(candidate: CandidateProfile): CandidateProfile {
  const db = getDb();
  const existingIdx = db.candidates.findIndex((c) => c.id === candidate.id);
  if (existingIdx >= 0) {
    db.candidates[existingIdx] = candidate;
  } else {
    db.candidates.push(candidate);
  }
  saveDb(db);
  return candidate;
}

export function updateCandidateCorrections(
  candidateId: string,
  updates: Partial<CandidateProfile>
): CandidateProfile | undefined {
  const db = getDb();
  const cand = db.candidates.find((c) => c.id === candidateId);
  if (!cand) return undefined;

  Object.assign(cand, updates, { hasCandidateCorrections: true });
  saveDb(db);
  return cand;
}

// ==========================================
// Application & Pipeline Operations
// ==========================================
export function getApplications(jobId?: string): Application[] {
  const db = getDb();
  if (jobId) {
    return db.applications.filter((a) => a.jobId === jobId);
  }
  return db.applications;
}

export function getApplicationById(id: string): Application | undefined {
  return getDb().applications.find((a) => a.id === id);
}

export function createApplication(
  candidateId: string,
  jobId: string,
  initialStage: PipelineStage = "SUBMITTED"
): Application {
  const db = getDb();
  const existing = db.applications.find((a) => a.candidateId === candidateId && a.jobId === jobId);
  if (existing) {
    return existing;
  }

  const newApp: Application = {
    id: `app_${Date.now()}`,
    jobId,
    candidateId,
    status: initialStage,
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    auditTrail: [
      {
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        fromStage: "SUBMITTED",
        toStage: initialStage,
        actionBy: "Candidate Self-Service",
        userRole: "CANDIDATE",
        note: "Initial candidate application submitted for review",
      },
    ],
    notes: [],
  };

  db.applications.unshift(newApp);

  const job = db.jobs.find((j) => j.id === jobId);
  if (job) {
    job.applicantCount = (job.applicantCount || 0) + 1;
  }

  // Update analytics
  const stageDist: Record<PipelineStage, number> = {
    SUBMITTED: 0,
    PARSED: 0,
    AI_ASSESSMENT: 0,
    RECRUITER_REVIEW: 0,
    SHORTLISTED: 0,
    INTERVIEW: 0,
    SELECTED: 0,
    REJECTED: 0,
  };
  db.applications.forEach((a) => {
    stageDist[a.status] = (stageDist[a.status] || 0) + 1;
  });
  db.analytics.stageDistribution = stageDist;
  db.analytics.pendingReviewsCount = stageDist.SUBMITTED + stageDist.PARSED + stageDist.AI_ASSESSMENT + stageDist.RECRUITER_REVIEW;

  saveDb(db);
  return newApp;
}

export function updateApplicationStage(
  applicationId: string,
  toStage: PipelineStage,
  actionBy: string,
  role: UserRole | "RECRUITER" | "CANDIDATE" | string,
  note?: string
): Application | undefined {
  const db = getDb();
  const app = db.applications.find((a) => a.id === applicationId);
  if (!app) return undefined;

  const previousStage = app.status;
  app.status = toStage;
  app.updatedAt = new Date().toISOString();

  app.auditTrail.push({
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    fromStage: previousStage,
    toStage,
    actionBy,
    userRole: role,
    note,
  });

  // Update analytics stage distribution
  const stageDist: Record<PipelineStage, number> = {
    SUBMITTED: 0,
    PARSED: 0,
    AI_ASSESSMENT: 0,
    RECRUITER_REVIEW: 0,
    SHORTLISTED: 0,
    INTERVIEW: 0,
    SELECTED: 0,
    REJECTED: 0,
  };

  db.applications.forEach((a) => {
    stageDist[a.status] = (stageDist[a.status] || 0) + 1;
  });
  db.analytics.stageDistribution = stageDist;
  db.analytics.shortlistedCount = stageDist.SHORTLISTED + stageDist.INTERVIEW + stageDist.SELECTED;
  db.analytics.pendingReviewsCount = stageDist.SUBMITTED + stageDist.PARSED + stageDist.AI_ASSESSMENT + stageDist.RECRUITER_REVIEW;

  saveDb(db);
  return app;
}

export function addRecruiterNote(applicationId: string, authorId: string, authorName: string, content: string): Application | undefined {
  const db = getDb();
  const app = db.applications.find((a) => a.id === applicationId);
  if (!app) return undefined;

  app.notes.push({
    id: `note_${Date.now()}`,
    authorId,
    authorName,
    createdAt: new Date().toISOString(),
    content,
  });
  app.updatedAt = new Date().toISOString();
  saveDb(db);
  return app;
}

// ==========================================
// Semantic Matching & Evaluation Operations
// ==========================================
export function getEvaluationByApplicationId(applicationId: string): MatchEvaluation | undefined {
  const db = getDb();
  let evaluation = db.evaluations.find((e) => e.applicationId === applicationId);
  if (!evaluation) {
    if (applicationId === "app_david_backend" || applicationId === "app_alex_backend") {
      evaluation = db.evaluations.find((e) => e.applicationId === "app_alex_backend" || e.applicationId === "app_david_backend");
    } else if (applicationId === "app_elena_backend" || applicationId === "app_maya_backend") {
      evaluation = db.evaluations.find((e) => e.applicationId === "app_maya_backend" || e.applicationId === "app_elena_backend");
    } else if (applicationId === "app_liam_backend" || applicationId === "app_tariq_backend") {
      evaluation = db.evaluations.find((e) => e.applicationId === "app_tariq_backend" || e.applicationId === "app_liam_backend");
    }
  }
  return evaluation;
}

export function saveEvaluation(evaluation: MatchEvaluation): MatchEvaluation {
  const db = getDb();
  const existingIdx = db.evaluations.findIndex((e) => e.applicationId === evaluation.applicationId);
  if (existingIdx >= 0) {
    db.evaluations[existingIdx] = evaluation;
  } else {
    db.evaluations.push(evaluation);
  }
  saveDb(db);
  return evaluation;
}

export function overrideEvaluationScore(
  applicationId: string,
  newScore: number,
  reason: string,
  overriddenBy: string
): MatchEvaluation | undefined {
  const db = getDb();
  const evalItem = db.evaluations.find((e) => e.applicationId === applicationId);
  if (!evalItem) return undefined;

  evalItem.manualScoreOverride = {
    originalScore: evalItem.overallScore,
    newScore,
    reason,
    overriddenBy,
    timestamp: new Date().toISOString(),
  };
  evalItem.overallScore = newScore;
  saveDb(db);
  return evalItem;
}

// ==========================================
// Interview Scheduling & Questions
// ==========================================
export function getInterviewQuestions(applicationId: string): InterviewQuestion[] {
  const db = getDb();
  return db.interviewQuestions[applicationId] || [];
}

export function saveInterviewQuestions(applicationId: string, questions: InterviewQuestion[]): void {
  const db = getDb();
  db.interviewQuestions[applicationId] = questions;
  saveDb(db);
}

export function updateInterviewQuestion(applicationId: string, question: InterviewQuestion): InterviewQuestion[] {
  const db = getDb();
  const list = db.interviewQuestions[applicationId] || [];
  const idx = list.findIndex((q) => q.id === question.id);
  if (idx >= 0) {
    list[idx] = question;
  } else {
    list.push(question);
  }
  db.interviewQuestions[applicationId] = list;
  saveDb(db);
  return list;
}

export function deleteInterviewQuestion(applicationId: string, questionId: string): InterviewQuestion[] {
  const db = getDb();
  const list = (db.interviewQuestions[applicationId] || []).filter((q) => q.id !== questionId);
  db.interviewQuestions[applicationId] = list;
  saveDb(db);
  return list;
}

export function getInterviews(): InterviewSchedule[] {
  return getDb().interviews;
}

export function scheduleInterview(interview: InterviewSchedule): InterviewSchedule {
  const db = getDb();
  db.interviews.push(interview);
  db.analytics.interviewsScheduledCount = db.interviews.filter((i) => i.status === "SCHEDULED").length;
  saveDb(db);
  return interview;
}

export function updateInterviewFeedback(
  interviewId: string,
  feedback: {
    rating: number;
    technicalCompetency: number;
    communication: number;
    notes: string;
    recommendation: "STRONG_HIRE" | "HIRE" | "LEANING_NO" | "NO_HIRE";
  }
): InterviewSchedule | undefined {
  const db = getDb();
  const interview = db.interviews.find((i) => i.id === interviewId);
  if (!interview) return undefined;

  interview.feedback = feedback;
  interview.status = "COMPLETED";
  saveDb(db);
  return interview;
}

// ==========================================
// Analytics & Talent Intelligence
// ==========================================
export function getAnalytics() {
  return getDb().analytics;
}

export function getDuplicateGroups() {
  return getDb().duplicateGroups || [];
}

export function mergeDuplicateGroup(groupId: string): boolean {
  const db = getDb();
  const grp = db.duplicateGroups?.find((g) => g.groupId === groupId);
  if (!grp) return false;

  grp.merged = true;
  saveDb(db);
  return true;
}
