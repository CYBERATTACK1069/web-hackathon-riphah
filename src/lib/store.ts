import fs from "fs";
import path from "path";
import {
  PlatformDatabaseSchema,
  JobVacancy,
  JobVacancyStatus,
  ParsedResume,
  MatchEvaluation,
  ApplicationRecord,
  ApplicationStage,
  ApplicationAuditTrailEntry,
  InterviewQuestion,
  InterviewSchedule,
  UserAccount,
  UserRole,
} from "@/types/platform";
import { INITIAL_DEMO_DATABASE } from "./seed-data";

// File path for persistence in local project directory
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE_PATH = path.join(DB_DIR, "platform_db.json");

// In-Memory Fallback Singleton
let memoryStore: PlatformDatabaseSchema | null = null;

/**
 * Deep clone utility to ensure in-memory mutations don't corrupt references
 */
function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Attempt to read database from local JSON file
 */
function readDbFromFile(): PlatformDatabaseSchema | null {
  try {
    if (typeof window !== "undefined") {
      // Client-side environment fallback
      return null;
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      return null;
    }
    const rawData = fs.readFileSync(DB_FILE_PATH, "utf-8");
    if (!rawData.trim()) {
      return null;
    }
    const parsed = JSON.parse(rawData) as PlatformDatabaseSchema;
    // Validate minimal structure
    if (!Array.isArray(parsed.jobs) || !Array.isArray(parsed.resumes)) {
      console.warn("[Store] Database file corrupted or invalid structure. Re-initializing.");
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn("[Store] Warning reading from DB file, using memory fallback:", error);
    return null;
  }
}

/**
 * Attempt to write database to local JSON file with directory creation
 */
function writeDbToFile(data: PlatformDatabaseSchema): boolean {
  try {
    if (typeof window !== "undefined") {
      return false;
    }
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.warn("[Store] Failed writing database to disk; retained in memory cache:", error);
    return false;
  }
}

/**
 * Initialize or get the current active database schema
 */
export async function getDatabase(): Promise<PlatformDatabaseSchema> {
  // 1. If memoryStore is already populated, return cloned copy
  if (memoryStore) {
    return clone(memoryStore);
  }

  // 2. Try loading from disk
  const diskData = readDbFromFile();
  if (diskData) {
    memoryStore = diskData;
    return clone(memoryStore);
  }

  // 3. First boot / Pre-seed with Final Demo Scenario
  console.info("[Store] Initializing database with Final Demo Scenario seed data...");
  const initialData = clone(INITIAL_DEMO_DATABASE);
  memoryStore = initialData;

  // Persist the seed data to disk so inspection and restarts retain state
  writeDbToFile(initialData);

  return clone(memoryStore);
}

/**
 * Commit updated state to both in-memory store and file storage
 */
export async function saveDatabase(data: PlatformDatabaseSchema): Promise<void> {
  memoryStore = clone(data);
  writeDbToFile(data);
}

/**
 * Reset database back to original pre-seeded Final Demo Scenario
 */
export async function resetToInitialDemoData(): Promise<PlatformDatabaseSchema> {
  console.info("[Store] Resetting database to initial seed scenario...");
  const freshSeed = clone(INITIAL_DEMO_DATABASE);
  await saveDatabase(freshSeed);
  return freshSeed;
}

// ============================================================================
// JOB VACANCIES REPOSITORY
// ============================================================================

export async function getJobs(): Promise<JobVacancy[]> {
  const db = await getDatabase();
  return db.jobs;
}

export async function getJobById(id: string): Promise<JobVacancy | null> {
  const db = await getDatabase();
  return db.jobs.find((j) => j.id === id) || null;
}

export async function saveJob(job: JobVacancy): Promise<JobVacancy> {
  const db = await getDatabase();
  const index = db.jobs.findIndex((j) => j.id === job.id);
  if (index >= 0) {
    db.jobs[index] = job;
  } else {
    db.jobs.push(job);
  }
  await saveDatabase(db);
  return job;
}

export async function updateJobStatus(
  id: string,
  newStatus: JobVacancyStatus,
  changedBy: string,
  reason?: string
): Promise<JobVacancy | null> {
  const db = await getDatabase();
  const job = db.jobs.find((j) => j.id === id);
  if (!job) return null;

  const now = new Date().toISOString();
  job.status = newStatus;
  job.updatedAt = now;

  if (newStatus === "closed") {
    job.closedAt = now;
  } else if (newStatus === "reopened") {
    job.reopenedAt = now;
  }

  job.statusHistory.push({
    status: newStatus,
    changedAt: now,
    changedBy,
    reason: reason || `Status transitioned to ${newStatus}`,
  });

  await saveDatabase(db);
  return job;
}

// ============================================================================
// RESUMES REPOSITORY
// ============================================================================

export async function getResumes(): Promise<ParsedResume[]> {
  const db = await getDatabase();
  return db.resumes;
}

export async function getResumeById(id: string): Promise<ParsedResume | null> {
  const db = await getDatabase();
  return db.resumes.find((r) => r.id === id) || null;
}

export async function getResumeByCandidateId(candidateId: string): Promise<ParsedResume | null> {
  const db = await getDatabase();
  return db.resumes.find((r) => r.candidateId === candidateId) || null;
}

export async function saveResume(resume: ParsedResume): Promise<ParsedResume> {
  const db = await getDatabase();
  const index = db.resumes.findIndex((r) => r.id === resume.id);
  if (index >= 0) {
    db.resumes[index] = resume;
  } else {
    db.resumes.push(resume);
  }
  await saveDatabase(db);
  return resume;
}

// ============================================================================
// MATCH EVALUATIONS REPOSITORY
// ============================================================================

export async function getEvaluations(): Promise<MatchEvaluation[]> {
  const db = await getDatabase();
  return db.evaluations;
}

export async function getEvaluationById(id: string): Promise<MatchEvaluation | null> {
  const db = await getDatabase();
  return db.evaluations.find((e) => e.id === id) || null;
}

export async function getEvaluationForCandidate(
  candidateId: string,
  jobId: string
): Promise<MatchEvaluation | null> {
  const db = await getDatabase();
  return db.evaluations.find((e) => e.candidateId === candidateId && e.jobId === jobId) || null;
}

export async function saveEvaluation(evaluation: MatchEvaluation): Promise<MatchEvaluation> {
  const db = await getDatabase();
  const index = db.evaluations.findIndex((e) => e.id === evaluation.id);
  if (index >= 0) {
    db.evaluations[index] = evaluation;
  } else {
    db.evaluations.push(evaluation);
  }
  await saveDatabase(db);
  return evaluation;
}

// ============================================================================
// APPLICATION RECORDS & 7 PIPELINE STAGES REPOSITORY
// ============================================================================

export async function getApplications(): Promise<ApplicationRecord[]> {
  const db = await getDatabase();
  return db.applications;
}

export async function getApplicationById(id: string): Promise<ApplicationRecord | null> {
  const db = await getDatabase();
  return db.applications.find((a) => a.id === id) || null;
}

export async function saveApplication(application: ApplicationRecord): Promise<ApplicationRecord> {
  const db = await getDatabase();
  const index = db.applications.findIndex((a) => a.id === application.id);
  if (index >= 0) {
    db.applications[index] = application;
  } else {
    db.applications.push(application);
  }
  await saveDatabase(db);
  return application;
}

export async function updateApplicationStage(
  id: string,
  newStage: ApplicationStage,
  actor: { id: string; name: string; role: UserRole | "system" },
  notes?: string
): Promise<ApplicationRecord | null> {
  const db = await getDatabase();
  const application = db.applications.find((a) => a.id === id);
  if (!application) return null;

  const previousStage = application.currentStage;
  const now = new Date().toISOString();

  application.currentStage = newStage;
  application.lastUpdated = now;

  const auditEntry: ApplicationAuditTrailEntry = {
    id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    action: `Stage transitioned from ${previousStage} to ${newStage}`,
    previousStage,
    newStage,
    actor,
    notes: notes || `Moved pipeline stage to ${newStage}`,
  };

  application.auditTrail.push(auditEntry);
  await saveDatabase(db);
  return application;
}

export async function addApplicationAuditEntry(
  applicationId: string,
  entry: Omit<ApplicationAuditTrailEntry, "id" | "timestamp">
): Promise<ApplicationRecord | null> {
  const db = await getDatabase();
  const application = db.applications.find((a) => a.id === applicationId);
  if (!application) return null;

  const fullEntry: ApplicationAuditTrailEntry = {
    id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  application.auditTrail.push(fullEntry);
  application.lastUpdated = fullEntry.timestamp;

  await saveDatabase(db);
  return application;
}

export async function updateApplicationNotes(
  id: string,
  recruiterNotes: string,
  actor?: { id: string; name: string; role: UserRole | "system" }
): Promise<ApplicationRecord | null> {
  const db = await getDatabase();
  const application = db.applications.find((a) => a.id === id);
  if (!application) return null;

  const now = new Date().toISOString();
  application.recruiterNotes = recruiterNotes;
  application.lastUpdated = now;

  const actorObj = actor || { id: "usr-recruiter-01", name: "Elena Vance", role: "recruiter" };
  application.auditTrail.push({
    id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    action: "Recruiter note logged",
    previousStage: application.currentStage,
    newStage: application.currentStage,
    actor: actorObj,
    notes: recruiterNotes,
  });

  await saveDatabase(db);
  return application;
}

// ============================================================================
// INTERVIEW QUESTIONS REPOSITORY
// ============================================================================

export async function getInterviewQuestions(
  jobId?: string,
  candidateId?: string
): Promise<InterviewQuestion[]> {
  const db = await getDatabase();
  let questions = db.questions;
  if (jobId) {
    questions = questions.filter((q) => q.jobId === jobId);
  }
  if (candidateId) {
    questions = questions.filter((q) => !q.candidateId || q.candidateId === candidateId);
  }
  return questions;
}

export async function saveInterviewQuestion(question: InterviewQuestion): Promise<InterviewQuestion> {
  const db = await getDatabase();
  const index = db.questions.findIndex((q) => q.id === question.id);
  if (index >= 0) {
    db.questions[index] = question;
  } else {
    db.questions.push(question);
  }
  await saveDatabase(db);
  return question;
}

// ============================================================================
// INTERVIEW SCHEDULES REPOSITORY
// ============================================================================

export async function getInterviewSchedules(): Promise<InterviewSchedule[]> {
  const db = await getDatabase();
  return db.schedules;
}

export async function getScheduleById(id: string): Promise<InterviewSchedule | null> {
  const db = await getDatabase();
  return db.schedules.find((s) => s.id === id) || null;
}

export async function saveInterviewSchedule(schedule: InterviewSchedule): Promise<InterviewSchedule> {
  const db = await getDatabase();
  const index = db.schedules.findIndex((s) => s.id === schedule.id);
  if (index >= 0) {
    db.schedules[index] = schedule;
  } else {
    db.schedules.push(schedule);
  }
  await saveDatabase(db);
  return schedule;
}

export async function updateInterviewFeedback(
  scheduleId: string,
  feedback: NonNullable<InterviewSchedule["feedback"]>
): Promise<InterviewSchedule | null> {
  const db = await getDatabase();
  const schedule = db.schedules.find((s) => s.id === scheduleId);
  if (!schedule) return null;

  schedule.feedback = feedback;
  schedule.status = "completed";
  schedule.updatedAt = new Date().toISOString();
  await saveDatabase(db);
  return schedule;
}

// ============================================================================
// USERS REPOSITORY
// ============================================================================

export async function getUsers(): Promise<UserAccount[]> {
  const db = await getDatabase();
  return db.users;
}

export async function getUserById(id: string): Promise<UserAccount | null> {
  const db = await getDatabase();
  return db.users.find((u) => u.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<UserAccount | null> {
  const db = await getDatabase();
  const lower = email.trim().toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === lower) || null;
}

export async function saveUser(user: UserAccount): Promise<UserAccount> {
  const db = await getDatabase();
  const index = db.users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    db.users[index] = user;
  } else {
    db.users.push(user);
  }
  await saveDatabase(db);
  return user;
}

