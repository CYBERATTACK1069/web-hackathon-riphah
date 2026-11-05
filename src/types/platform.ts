/**
 * Strict Shared Data Contract for Riphah AI Recruitment Platform
 * Enterprise Swiss-Grid Architecture Contract
 */

// ============================================================================
// 1. User & Authentication Roles
// ============================================================================

export type UserRole = "recruiter" | "candidate";

export interface UserAccount {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  avatarUrl?: string;
  organization?: string;
  title?: string;
  createdAt: string;
}

// ============================================================================
// 2. Job Vacancy & Skill Weighting
// ============================================================================

export type JobVacancyStatus = "draft" | "open" | "closed" | "reopened" | "archived";

export type SkillImportance = "critical" | "important" | "nice_to_have";

export interface WeightedSkillRequirement {
  skillId: string;
  name: string;
  category: "language" | "framework" | "database" | "devops" | "architecture" | "soft_skill";
  importance: SkillImportance;
  /** Importance weight between 0.0 and 1.0 (sums to 1.0 across required skills) */
  weight: number;
  minimumYearsRequired: number;
  description?: string;
}

export interface JobVacancyStatusAudit {
  status: JobVacancyStatus;
  changedAt: string;
  changedBy: string; // User ID or system
  reason?: string;
}

export interface JobVacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  workplaceType: "remote" | "hybrid" | "on_site";
  employmentType: "full_time" | "part_time" | "contract" | "internship";
  experienceLevel: "entry" | "mid" | "senior" | "lead" | "principal";
  salaryRange: {
    currency: string;
    min: number;
    max: number;
    period: "annual" | "monthly" | "hourly";
  };
  summary: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skillWeights: WeightedSkillRequirement[];
  status: JobVacancyStatus;
  statusHistory: JobVacancyStatusAudit[];
  recruiterId: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  reopenedAt?: string;
}

// ============================================================================
// 3. Parsed Resume & Grounded Excerpt Mapping
// ============================================================================

export interface ResumeExcerptCitation {
  id: string;
  targetField: "skill" | "work_experience" | "project" | "education" | "certification";
  associatedIdentifier: string; // e.g. skill name, company name, project title
  excerptText: string;
  characterStart: number;
  characterEnd: number;
  pageNumber?: number;
  contextSnippet: string; // Surrounding text for UI verification
  confidence: number; // 0.0 - 1.0
}

export interface NormalizedSkillItem {
  skillId: string;
  name: string;
  category: "language" | "framework" | "database" | "devops" | "architecture" | "tool" | "other";
  normalizedName: string; // e.g. "PostgreSQL" for "postgres", "Docker" for "docker container"
  claimedYears: number;
  proficiencyLevel: "novice" | "competent" | "proficient" | "expert";
  citationIds: string[];
}

export interface ResumeWorkExperience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate: string | "Present";
  isCurrent: boolean;
  bulletPoints: string[];
  technologiesUsed: string[];
  citationIds: string[];
}

export interface ResumeProject {
  id: string;
  title: string;
  summary: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  role?: string;
  outcomes?: string[];
  citationIds: string[];
}

export interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate?: string;
  graduationDate: string;
  gradeOrGpa?: string;
  honors?: string[];
  citationIds: string[];
}

export interface ResumeCertification {
  id: string;
  title: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
  citationIds: string[];
}

export interface ParsedResume {
  id: string;
  candidateId: string;
  rawText: string;
  fileMetadata: {
    fileName: string;
    fileSizeKB: number;
    mimeType: string;
    uploadedAt: string;
  };
  contactInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location: string;
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  summary: string;
  normalizedSkills: NormalizedSkillItem[];
  workExperience: ResumeWorkExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  certifications: ResumeCertification[];
  excerptMapping: ResumeExcerptCitation[];
  parsingConfidence: number; // 0.0 - 1.0
  parsedAt: string;
}

// ============================================================================
// 4. Match Evaluation Engine (50/25/15/10 Strict Weighting & Hallucination Checks)
// ============================================================================

/**
 * Strict evidence classification separating unmentioned claims from confirmed gaps
 */
export type EvidenceState =
  | "confirmed_present"   // Explicitly backed by resume excerpts & employment history
  | "partial_evidence"   // Mentioned in buzzwords or basic listing, but lacks deep project/work context
  | "missing_evidence"   // Not mentioned anywhere in the resume (unconfirmed gap; requires targeted verification)
  | "confirmed_absence"; // Contradicted by candidate's disclosed experience (e.g. explicitly stated non-familiarity)

export interface SkillMatchAssessment {
  skillName: string;
  requiredWeight: number; // Configured job weight
  importance: SkillImportance;
  evidenceState: EvidenceState;
  score: number; // 0 to 100
  candidateYearsFound: number;
  requiredYears: number;
  justification: string;
  relevantExcerptIds: string[];
  verificationNeeded: boolean;
  suggestedProbingQuestion?: string;
}

export type HallucinationRiskLevel = "clean" | "low" | "medium" | "high" | "critical";

export interface HallucinationVerificationFlag {
  id: string;
  claimType: "temporal_impossibility" | "ungrounded_skill" | "exaggerated_seniority" | "inconsistent_timeline" | "contradictory_metric";
  suspectClaim: string;
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "unverified" | "verified_truth" | "verified_hallucination";
  detectedConfidence: number; // 0.0 - 1.0
  recommendedInterviewProbe: string;
  evidenceExcerptIds: string[];
}

export interface WeightBreakdownScores {
  /** 50% Weight */
  skillsScore: number;
  /** 25% Weight */
  experienceScore: number;
  /** 15% Weight */
  projectsScore: number;
  /** 10% Weight */
  qualificationsScore: number;
  /**
   * Final composite score calculated strictly as:
   * (skillsScore * 0.50) + (experienceScore * 0.25) + (projectsScore * 0.15) + (qualificationsScore * 0.10)
   */
  compositeScore: number;
}

export type MatchVerdict = "strong_match" | "potential_match" | "requires_investigation" | "mismatch";

export interface MatchEvaluation {
  id: string;
  candidateId: string;
  jobId: string;
  resumeId: string;
  evaluatedAt: string;
  modelIdentifier: string;

  // Strict 50 / 25 / 15 / 10 Weighted Scores
  weights: {
    skills: 0.50;
    experience: 0.25;
    projects: 0.15;
    qualifications: 0.10;
  };
  scoreBreakdown: WeightBreakdownScores;
  verdict: MatchVerdict;

  // Granular Assessments
  skillAssessments: SkillMatchAssessment[];
  experienceMatchAnalysis: {
    score: number; // 0-100
    totalYearsRelevant: number;
    seniorityAlignment: "below" | "matches" | "exceeds";
    keyStrengths: string[];
    gapsIdentified: string[];
    justification: string;
  };
  projectsMatchAnalysis: {
    score: number; // 0-100
    complexityRating: "low" | "moderate" | "high" | "exceptional";
    relevantProjectsCount: number;
    stackOverlapDetails: string[];
    justification: string;
  };
  qualificationsMatchAnalysis: {
    score: number; // 0-100
    degreeRelevant: boolean;
    educationLevelMet: boolean;
    certificationsBonus: number;
    justification: string;
  };

  // Hallucination & Discrepancy Verification Engine
  isHallucinationFlagged: boolean;
  hallucinationRiskLevel: HallucinationRiskLevel;
  hallucinationFlags: HallucinationVerificationFlag[];

  // Executive Synthesis
  executiveSummary: string;
  recommendationReasoning: string[];
  targetedInterviewFocusAreas: string[];
}

// ============================================================================
// 5. Application Record & 7 Pipeline Stages Audit Trail
// ============================================================================

/**
 * 7 Sequential Pipeline Stages
 * 1. applied
 * 2. screening
 * 3. ai_evaluated
 * 4. interview_scheduled
 * 5. interview_completed
 * 6. offer_extended
 * 7. hired
 * Terminal branch stages: 'rejected' | 'withdrawn'
 */
export type ApplicationStage =
  | "applied"
  | "screening"
  | "ai_evaluated"
  | "interview_scheduled"
  | "interview_completed"
  | "offer_extended"
  | "hired"
  | "rejected"
  | "withdrawn";

export interface ApplicationAuditTrailEntry {
  id: string;
  timestamp: string;
  action: string;
  previousStage?: ApplicationStage;
  newStage: ApplicationStage;
  actor: {
    id: string;
    name: string;
    role: UserRole | "system";
  };
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  candidateId: string;
  resumeId: string;
  evaluationId?: string;
  currentStage: ApplicationStage;
  appliedDate: string;
  lastUpdated: string;
  auditTrail: ApplicationAuditTrailEntry[];
  candidateProfile: {
    fullName: string;
    email: string;
    phone?: string;
    location: string;
    headline: string;
  };
  recruiterNotes?: string;
  tags: string[];
}

// ============================================================================
// 6. Dynamic Interview Question Generation
// ============================================================================

export type QuestionCategory =
  | "technical"
  | "behavioral"
  | "project_deep_dive"
  | "evidence_verification"
  | "system_architecture";

export interface InterviewRubricLevel {
  score: number; // e.g. 1, 2, 3, 4, 5
  description: string;
  signalsToLookFor: string[];
}

export interface InterviewQuestion {
  id: string;
  jobId: string;
  candidateId?: string;
  evaluationId?: string;
  category: QuestionCategory;
  targetSkillOrTopic: string;
  questionText: string;
  contextReasoning: string; // Explains why AI picked this (e.g. verifying Docker absence or high-scale Postgres)
  difficulty: "junior" | "mid" | "senior" | "lead";
  expectedSignals: string[];
  redFlagIndicators: string[];
  rubric: {
    criteria: string;
    levels: InterviewRubricLevel[];
  };
  followUpProbes: string[];
  evidenceStateTargeted?: EvidenceState;
}

// ============================================================================
// 7. Interview Scheduling & Verification Feedback
// ============================================================================

export type InterviewType =
  | "technical_deep_dive"
  | "system_architecture"
  | "behavioral_screening"
  | "executive_final";

export type InterviewStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rescheduled";

export interface InterviewAssessedSkill {
  skillName: string;
  claimedEvidenceState: EvidenceState;
  verifiedState: "confirmed_present" | "exaggerated" | "unconfirmed" | "absent";
  technicalScore: number; // 1 - 5
  interviewerComments: string;
}

export interface InterviewEvaluationReport {
  submittedAt: string;
  interviewerId: string;
  overallScore: number; // 1 - 5
  recommendation: "strong_hire" | "hire" | "weak_hire" | "no_hire";
  assessedSkills: InterviewAssessedSkill[];
  verifiedHallucinationClaims: Array<{
    flagId: string;
    outcome: "verified_truth" | "confirmed_hallucination" | "inconclusive";
    notes: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  detailedFeedback: string;
}

export interface InterviewSchedule {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  interviewType: InterviewType;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string;
  interviewer: {
    id: string;
    name: string;
    email: string;
    title: string;
  };
  status: InterviewStatus;
  rescheduleReason?: string;
  prepNotesForInterviewer?: string[];
  questionIds: string[];
  feedback?: InterviewEvaluationReport;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 8. Database Schema Container for Store & Seed
// ============================================================================

export interface PlatformDatabaseSchema {
  jobs: JobVacancy[];
  resumes: ParsedResume[];
  evaluations: MatchEvaluation[];
  applications: ApplicationRecord[];
  questions: InterviewQuestion[];
  schedules: InterviewSchedule[];
  users: UserAccount[];
}

