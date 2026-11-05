/**
 * Types index definition supporting both Backend/Vector schemas and Platform Swiss-Grid schemas
 */

export * from "./platform";

export type LegacyUserRole = "RECRUITER" | "CANDIDATE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: LegacyUserRole | string;
  avatarUrl?: string;
  title?: string;
  companyOrAffiliation?: string;
}

export type SkillCategory = "FRONTEND" | "BACKEND" | "DEVOPS" | "AI_ML" | "DATABASE" | "GENERAL";

export interface JobSkillRequirement {
  name: string;
  importance: number; // 1 - 5
  minYearsRequired: number;
  category: SkillCategory;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salaryRange?: string;
  description: string;
  requiredSkills: JobSkillRequirement[];
  preferredSkills: string[];
  minExperienceYears: number;
  qualifications: string[];
  status?: "OPEN" | "CLOSED" | "DRAFT";
  applicantCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NormalizedSkill {
  name?: string;
  originalTerm?: string;
  normalizedName: string;
  category?: string;
  yearsOfExperience?: number;
  proficiency?: string;
  proficiencyLevel?: string;
}

export interface CandidateExperience {
  id?: string;
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  highlights: string[];
  technologiesUsed?: string[];
}

export interface CandidateProject {
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  metricsOrOutcomes?: string;
}

export interface CandidateEducation {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  year?: number | string;
  graduationYear?: number | string;
}

export interface CandidateProfile {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  summary: string;
  rawResumeText?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  parsedAt?: string;
  skills: NormalizedSkill[];
  experience: CandidateExperience[];
  projects: CandidateProject[];
  education: CandidateEducation[];
  hasCandidateCorrections?: boolean;
}

export interface SkillGapMetric {
  skill: string;
  count: number;
  percentage: number;
}

export interface RecruitmentAnalytics {
  activeJobsCount: number;
  totalApplicationsCount: number;
  shortlistedCount: number;
  pendingReviewsCount: number;
  interviewsScheduledCount: number;
  applicationToShortlistRate: number;
  avgProcessingTimeDays: number;
  stageDistribution: Record<PipelineStage, number>;
  topSkillGapsAcrossPool: SkillGapMetric[];
}

export interface MissingSkillAnalysis {
  skillName: string;
  importance: number;
  status: "MISSING_EVIDENCE" | "CONFIRMED_ABSENT";
  rationale: string;
}

export interface ResumeExcerptCitation {
  skillOrClaim: string;
  excerptText: string;
  sourceSection: string;
  verified: boolean;
}

export interface UpskillingRecommendation {
  skillToLearn: string;
  recommendedProjectOrCourse: string;
  estimatedTimeToAcquire: string;
  expectedScoreBump: number;
}

export interface MatchEvaluationManualOverride {
  originalScore: number;
  newScore: number;
  reason: string;
  overriddenBy: string;
  timestamp: string;
}

export interface MatchEvaluation {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  projectsScore: number;
  qualificationsScore: number;
  matchedSkills: string[];
  missingSkills: MissingSkillAnalysis[];
  citations: ResumeExcerptCitation[];
  executiveSummary: string;
  strengths: string[];
  weaknesses: string[];
  upskillingRoadmap: UpskillingRecommendation[];
  manualScoreOverride?: MatchEvaluationManualOverride;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  tailoredProjectContext?: string;
  expectedAnswerRubric: string;
}

export interface InterviewSchedule {
  id: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  scheduledAt?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  durationMinutes?: number;
  meetingUrl?: string;
  meetingLink?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  interviewType?: string;
  hasConflict?: boolean;
  status: string;
  feedback?: {
    rating: number;
    technicalCompetency: number;
    communication: number;
    notes: string;
    recommendation: "STRONG_HIRE" | "HIRE" | "LEANING_NO" | "NO_HIRE";
  } | Record<string, unknown>;
}

export type PipelineStage =
  | "SUBMITTED"
  | "PARSED"
  | "AI_ASSESSMENT"
  | "RECRUITER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "SELECTED"
  | "REJECTED";

export interface ApplicationNote {
  id: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  content: string;
}

export interface ApplicationAuditTrailItem {
  id: string;
  timestamp: string;
  fromStage: string;
  toStage: string;
  actionBy: string;
  userRole: string;
  note?: string;
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: PipelineStage;
  stage?: PipelineStage;
  evaluationId?: string;
  appliedDate?: string;
  appliedAt?: string;
  lastStatusUpdate?: string;
  updatedAt?: string;
  recruiterNotes?: string;
  notes: ApplicationNote[];
  auditTrail: ApplicationAuditTrailItem[];
}

export interface DuplicateGroup {
  groupId: string;
  primaryCandidateId: string;
  duplicateCandidateIds: string[];
  matchConfidence: number;
  detectedBy: string;
  merged: boolean;
}

export interface AnalyticsData {
  activeJobsCount: number;
  totalApplicationsCount: number;
  shortlistedCount: number;
  pendingReviewsCount: number;
  interviewsScheduledCount: number;
  applicationToShortlistRate: number;
  avgProcessingTimeDays: number;
  stageDistribution: Record<PipelineStage, number>;
  topSkillGapsAcrossPool: Array<{ skill: string; count: number; percentage: number }>;
}

export interface DatabaseSchema {
  users: User[];
  jobs: Job[];
  candidates: CandidateProfile[];
  applications: Application[];
  evaluations: MatchEvaluation[];
  interviews: InterviewSchedule[];
  interviewQuestions: Record<string, InterviewQuestion[]>;
  duplicateGroups?: DuplicateGroup[];
  analytics: AnalyticsData;
}
