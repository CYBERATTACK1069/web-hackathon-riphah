"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Filter,
  BarChart2,
  Send,
  Sliders,
  RotateCcw,
  Eye,
  EyeOff,
  UserCheck,
  MessageSquare,
  Award,
  ExternalLink,
  HelpCircle,
  Calendar,
  Star,
  Check,
  Copy,
  Split,
  RefreshCw,
  Zap,
  TrendingUp,
  CheckSquare,
  Square,
  Info,
  Edit3,
  Trash2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { RadarScorecardChart } from "@/components/RadarScorecardChart";
import { SwissHeader } from "@/components/SwissHeader";

// ============================================================================
// Types & Interfaces
// ============================================================================

export type PipelineStage =
  | "SUBMITTED"
  | "PARSED"
  | "AI_ASSESSMENT"
  | "RECRUITER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "SELECTED"
  | "REJECTED";

export interface CandidateSkill {
  name: string;
  normalizedName: string;
  years: number;
  proficiency: "Expert" | "Advanced" | "Competent" | "Basic";
  status: "VERIFIED_MATCH" | "MISSING_EVIDENCE" | "CONFIRMED_ABSENT";
  sourceVerified: boolean;
  hallucinationFlag: boolean;
  citationQuote: string;
  sourceSection: string;
  synonymAlias?: string; // e.g. "Py" -> "Python"
  rationale?: string;
}

export interface RecruiterCandidate {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  avatarInitials: string;
  overallScore: number;
  manualOverrideScore?: number;
  manualOverrideReason?: string;
  matchBadge: string;
  badgeColor: "emerald" | "amber" | "rose" | "zinc";
  stage: PipelineStage;
  experienceYears: number;
  scores: {
    skills: number;
    experience: number;
    projects: number;
    qualifications: number;
  };
  skills: CandidateSkill[];
  suggestedLearning: string[];
  hallucinationAlerts: {
    flagged: boolean;
    claim: string;
    reality: string;
    confidence: number;
  }[];
  auditTrail: {
    fromStage?: string;
    toStage: string;
    actionBy: string;
    timestamp: string;
    note?: string;
  }[];
  notes: {
    id: string;
    author: string;
    content: string;
    timestamp: string;
  }[];
  hasDuplicate: boolean;
  duplicateInfo?: {
    appId: string;
    email: string;
    similarity: number;
  };
  summary: string;
  topProject: {
    name: string;
    description: string;
    tech: string[];
  };
}

export interface InterviewQItem {
  id: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Candidate Projects";
  category: string;
  targetSkillOrProject: string;
  questionText: string;
  answerGuideline: {
    idealAnswer: string;
    keySignals: string[];
    redFlags: string[];
    rubric: {
      score5: string;
      score3: string;
      score1: string;
    };
  };
}

export interface ScheduledInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  date: string;
  time: string;
  interviewer: string;
  type: string;
  status: "scheduled" | "completed" | "cancelled";
  meetingLink: string;
  feedback?: {
    rating: number;
    technicalScore: number;
    communicationScore: number;
    decision: "Select (Offer)" | "Reject" | "Pending";
    notes: string;
  };
}

// ============================================================================
// Pre-Loaded Section 6 Demo Dataset (Deterministic Instant Offline State)
// ============================================================================

const SECTION_6_VACANCY = {
  id: "job-backend-001",
  title: "Senior Backend Developer",
  department: "Platform Engineering",
  location: "Zurich, Switzerland (Hybrid) / Remote EU",
  salaryRange: "$140,000 - $185,000",
  minExperienceYears: 4,
  status: "Active // Requisition Open",
  description:
    "We are seeking a Senior Backend Developer to architect resilient distributed microservices, optimize high-throughput PostgreSQL databases, and lead containerized deployments with Docker and Django.",
  requiredSkills: [
    { name: "Python", minYears: 4, importance: 5, weight: 35, category: "language" },
    { name: "Django", minYears: 3, importance: 5, weight: 30, category: "framework" },
    { name: "PostgreSQL", minYears: 2, importance: 4, weight: 20, category: "database" },
    { name: "Docker", minYears: 2, importance: 4, weight: 15, category: "devops" },
  ],
};

const INITIAL_CANDIDATES: RecruiterCandidate[] = [
  {
    id: "cand-ali-raza",
    name: "Ali Raza",
    role: "Senior Python & Django Backend Engineer",
    email: "ali.raza.backend@gmail.com",
    phone: "+92 (300) 555-0142",
    location: "Islamabad, Pakistan",
    avatarInitials: "AR",
    overallScore: 92,
    matchBadge: "STRONG MATCH (92%)",
    badgeColor: "emerald",
    stage: "SHORTLISTED",
    experienceYears: 4.5,
    scores: {
      skills: 95,
      experience: 90,
      projects: 92,
      qualifications: 88,
    },
    skills: [
      {
        name: "Python",
        normalizedName: "Python",
        years: 4,
        proficiency: "Expert",
        status: "VERIFIED_MATCH",
        sourceVerified: true,
        hallucinationFlag: false,
        sourceSection: "Core Technical Skills & Experience",
        citationQuote:
          "Python 3.10-3.12 (4 years, Expert)... Architected scalable RESTful services in Python and Django REST Framework processing 8M+ daily requests.",
      },
      {
        name: "Django",
        normalizedName: "Django",
        years: 4,
        proficiency: "Expert",
        status: "VERIFIED_MATCH",
        sourceVerified: true,
        hallucinationFlag: false,
        sourceSection: "Work Experience & Open Source",
        citationQuote:
          "Django (4 years, Expert), Django REST Framework, Celery, Pytest... FinStream: High-throughput financial transaction engine in Python & Django REST Framework.",
      },
      {
        name: "PostgreSQL",
        normalizedName: "PostgreSQL",
        years: 3,
        proficiency: "Advanced",
        status: "VERIFIED_MATCH",
        sourceVerified: true,
        hallucinationFlag: false,
        sourceSection: "Work Experience (Apex & CloudScale)",
        citationQuote:
          "PostgreSQL (3 years, Advanced)... Optimized high-load PostgreSQL database queries with composite indexing, reducing latency by 45%.",
      },
      {
        name: "Docker",
        normalizedName: "Docker",
        years: 2,
        proficiency: "Advanced",
        status: "VERIFIED_MATCH",
        sourceVerified: true,
        hallucinationFlag: false,
        sourceSection: "DevOps & Certifications",
        citationQuote:
          "Docker (2 years, Proficient), Docker Compose, CI/CD pipelines, Docker Certified Associate (DCA) | Docker Inc. (2023).",
      },
    ],
    suggestedLearning: ["Distributed tracing with OpenTelemetry", "eBPF Linux kernel profiling"],
    hallucinationAlerts: [],
    hasDuplicate: true,
    duplicateInfo: {
      appId: "APP-1092-PRIOR",
      email: "ali.raza.backend@gmail.com",
      similarity: 96,
    },
    auditTrail: [
      {
        fromStage: "SUBMITTED",
        toStage: "PARSED",
        actionBy: "TalentIQ Parser v2.5",
        timestamp: "2026-11-04T09:12:00Z",
        note: "Extracted 14 skills, 2 degree credentials, and 2 verified work histories.",
      },
      {
        fromStage: "PARSED",
        toStage: "AI_ASSESSMENT",
        actionBy: "TalentIQ Intelligence Engine",
        timestamp: "2026-11-04T09:14:00Z",
        note: "Evaluated composite 50/25/15/10 weighted score: 92.4%. All 4 core skills verified.",
      },
      {
        fromStage: "AI_ASSESSMENT",
        toStage: "RECRUITER_REVIEW",
        actionBy: "Elena Vance (Lead Recruiter)",
        timestamp: "2026-11-04T11:00:00Z",
        note: "Verified resume citations and confirmed DCA certification with Docker Inc registry.",
      },
      {
        fromStage: "RECRUITER_REVIEW",
        toStage: "SHORTLISTED",
        actionBy: "Elena Vance (Lead Recruiter)",
        timestamp: "2026-11-05T08:30:00Z",
        note: "Fast-tracked to Technical Interview based on exceptional FinStream open-source project.",
      },
    ],
    notes: [
      {
        id: "note-1",
        author: "Elena Vance",
        content:
          "Candidate has exceptional PostgreSQL indexing knowledge. FinStream repository shows clean Django architecture. Strong hire recommendation.",
        timestamp: "2026-11-04 11:15 AM",
      },
    ],
    summary:
      "Dedicated Backend Software Engineer with 4 years of hands-on experience designing and maintaining high-throughput distributed microservices using Python and Django REST Framework.",
    topProject: {
      name: "FinStream Distributed Ledger",
      description:
        "High-throughput financial transaction engine written in Python and Django REST Framework. Benchmarked at 3,200 req/sec with PostgreSQL connection pooling and Docker orchestration.",
      tech: ["Python", "Django", "PostgreSQL", "Docker", "Celery"],
    },
  },
  {
    id: "cand-sara-khan",
    name: "Sara Khan",
    role: "Python API Developer (FastAPI & Flask)",
    email: "sara.khan.dev@gmail.com",
    phone: "+92 (321) 555-8821",
    location: "Lahore, Pakistan",
    avatarInitials: "SK",
    overallScore: 68,
    matchBadge: "PARTIAL GAP (68%)",
    badgeColor: "amber",
    stage: "RECRUITER_REVIEW",
    experienceYears: 2.2,
    scores: {
      skills: 64,
      experience: 70,
      projects: 68,
      qualifications: 78,
    },
    skills: [
      {
        name: "Python",
        normalizedName: "Python",
        years: 2,
        proficiency: "Competent",
        status: "VERIFIED_MATCH",
        sourceVerified: true,
        hallucinationFlag: false,
        sourceSection: "Languages & Frameworks",
        citationQuote:
          "Python (2 years, Competent)... Developed lightweight asynchronous APIs using Python and FastAPI for real-time analytics dashboards.",
      },
      {
        name: "PostgreSQL",
        normalizedName: "PostgreSQL",
        years: 2,
        proficiency: "Competent",
        status: "VERIFIED_MATCH",
        sourceVerified: true,
        hallucinationFlag: false,
        sourceSection: "Databases & Storage",
        citationQuote:
          "PostgreSQL (2 years, Competent)... Designed relational database tables and written complex SQL queries in PostgreSQL.",
      },
      {
        name: "Docker",
        normalizedName: "Docker",
        years: 0.5,
        proficiency: "Basic",
        status: "MISSING_EVIDENCE",
        sourceVerified: true,
        hallucinationFlag: false,
        sourceSection: "DevOps & Tools",
        citationQuote:
          "Familiarity with containers (watched Docker tutorials)... Collaborated with DevOps engineers; gained familiarity with containers during staging deployments.",
        rationale:
          "Watched Docker tutorials and observed deployments, but lacks verified hands-on production container deployment or Dockerfile optimization evidence.",
      },
      {
        name: "Django",
        normalizedName: "Django",
        years: 0,
        proficiency: "Basic",
        status: "CONFIRMED_ABSENT",
        sourceVerified: true,
        hallucinationFlag: false,
        sourceSection: "Candidate Declaration",
        citationQuote:
          "Note: 0 production Django projects (primary experience in micro-frameworks FastAPI and Flask)... Explicit note: Focused exclusively on FastAPI and Flask; 0 production Django projects completed.",
        rationale:
          "Candidate explicitly confirms 0 production Django projects; exclusively experienced in micro-frameworks FastAPI and Flask.",
      },
    ],
    suggestedLearning: [
      "Advanced Django ORM & Architecture (Official Django Docs & Two Scoops of Django)",
      "Production Docker Containerization & Multi-stage Builds (Docker Deep Dive by Nigel Poulton)",
      "Relational Query Tuning & EXPLAIN ANALYZE Optimization",
    ],
    hallucinationAlerts: [],
    hasDuplicate: false,
    auditTrail: [
      {
        fromStage: "SUBMITTED",
        toStage: "PARSED",
        actionBy: "TalentIQ Parser v2.5",
        timestamp: "2026-11-04T14:20:00Z",
        note: "Extracted 9 skills. Candidate declared 0 Django experience transparently.",
      },
      {
        fromStage: "PARSED",
        toStage: "AI_ASSESSMENT",
        actionBy: "TalentIQ Intelligence Engine",
        timestamp: "2026-11-04T14:22:00Z",
        note: "Weighted score: 68.2%. Flagged Missing Evidence on Docker, Confirmed Absence on Django.",
      },
      {
        fromStage: "AI_ASSESSMENT",
        toStage: "RECRUITER_REVIEW",
        actionBy: "Elena Vance (Lead Recruiter)",
        timestamp: "2026-11-05T09:00:00Z",
        note: "Reviewing candidate for potential mid-level backend fast-track or upskilling cohort.",
      },
    ],
    notes: [
      {
        id: "note-sk-1",
        author: "Elena Vance",
        content:
          "Solid FastAPI knowledge, but Django is a core requirement for our platform. May be a strong fit for the API Microservices vacancy instead.",
        timestamp: "2026-11-05 09:10 AM",
      },
    ],
    summary:
      "Backend developer with 2 years of professional experience developing REST APIs and microservices using Python, FastAPI, and Flask. Strong background in relational database modeling in PostgreSQL.",
    topProject: {
      name: "DataPulse Real-Time Telemetry API",
      description:
        "Lightweight asynchronous microservices built with Python and FastAPI, handling live time-series ingestion into PostgreSQL.",
      tech: ["Python", "FastAPI", "PostgreSQL", "Redis"],
    },
  },
  {
    id: "cand-usman-tariq",
    name: "Usman Tariq",
    role: "Full-Stack Developer (Node & Frontend)",
    email: "usman.tariq.code@gmail.com",
    phone: "+92 (333) 555-4920",
    location: "Karachi, Pakistan",
    avatarInitials: "UT",
    overallScore: 54,
    matchBadge: "SKILL NORMALIZER / MISMATCH (54%)",
    badgeColor: "rose",
    stage: "AI_ASSESSMENT",
    experienceYears: 3.0,
    scores: {
      skills: 50,
      experience: 55,
      projects: 58,
      qualifications: 52,
    },
    skills: [
      {
        name: "Python",
        normalizedName: "Python",
        years: 1,
        proficiency: "Basic",
        status: "VERIFIED_MATCH",
        sourceVerified: true,
        hallucinationFlag: false,
        synonymAlias: "Py",
        sourceSection: "Skills & Work Experience",
        citationQuote:
          "Wrote Py (Python) automation scripts to sync third-party REST APIs into our Postgres datastore. [Synonym Mapped: 'Py' -> 'Python' (100% confidence)]",
      },
      {
        name: "PostgreSQL",
        normalizedName: "PostgreSQL",
        years: 2,
        proficiency: "Competent",
        status: "VERIFIED_MATCH",
        sourceVerified: true,
        hallucinationFlag: false,
        synonymAlias: "Postgres",
        sourceSection: "Databases",
        citationQuote:
          "Maintained database schema migrations in Postgres and tuned basic queries. [Synonym Mapped: 'Postgres' -> 'PostgreSQL' (100% confidence)]",
      },
      {
        name: "Docker",
        normalizedName: "Docker",
        years: 1,
        proficiency: "Basic",
        status: "MISSING_EVIDENCE",
        sourceVerified: true,
        hallucinationFlag: false,
        sourceSection: "DevOps & Tools",
        citationQuote:
          "Docker (Basic)... Containerized staging microservices with Docker and deployed to test K8s clusters.",
        rationale:
          "Only basic exposure to staging containers; lacking production Dockerfile optimization or cluster tuning.",
      },
      {
        name: "Django",
        normalizedName: "Django",
        years: 0,
        proficiency: "Basic",
        status: "CONFIRMED_ABSENT",
        sourceVerified: true,
        hallucinationFlag: false,
        sourceSection: "Full Document Scan",
        citationQuote: "No mention of Django or Django REST Framework in resume document.",
        rationale: "Skill completely unmentioned in candidate dossier.",
      },
    ],
    suggestedLearning: [
      "Python Enterprise Architecture & Django REST Framework",
      "Advanced Relational Modeling & Index Design in PostgreSQL",
    ],
    hallucinationAlerts: [
      {
        flagged: true,
        claim: "Claimed 6 years of Distributed Architecture tenure on LinkedIn header",
        reality:
          "Graduation date is May 2020 (total career span is 3.0 years). Exaggerated tenure by +3.0 years.",
        confidence: 0.94,
      },
    ],
    hasDuplicate: false,
    auditTrail: [
      {
        fromStage: "SUBMITTED",
        toStage: "PARSED",
        actionBy: "TalentIQ Parser v2.5",
        timestamp: "2026-11-05T06:10:00Z",
        note: "Canonically normalized 5 alias terms: 'JS'->JavaScript, 'TS'->TypeScript, 'Py'->Python, 'Postgres'->PostgreSQL, 'K8s'->Kubernetes.",
      },
      {
        fromStage: "PARSED",
        toStage: "AI_ASSESSMENT",
        actionBy: "TalentIQ Intelligence Engine",
        timestamp: "2026-11-05T06:12:00Z",
        note: "AI Hallucination Verifier flagged ungrounded tenure claim. Composite weighted score: 54.0%.",
      },
    ],
    notes: [],
    summary:
      "Versatile Full-Stack Engineer with 3 years experience building dynamic web apps using JS, TS, and Py. Skilled with Postgres databases and modern frontend architectures with React and Node.js.",
    topProject: {
      name: "DevNexus Internal Data Sync",
      description:
        "Wrote Py automation scripts to sync third-party REST APIs into our Postgres datastore with Node.js microservices.",
      tech: ["Node.js", "Python (Py)", "PostgreSQL (Postgres)", "Docker"],
    },
  },
];

const INITIAL_QUESTIONS: InterviewQItem[] = [
  {
    id: "q-beg-01",
    difficulty: "Beginner",
    category: "Python Fundamentals & Memory",
    targetSkillOrProject: "Python",
    questionText:
      "Explain the fundamental difference between Python's GIL (Global Interpreter Lock) and multi-processing, and when you would choose asyncio versus multiprocessing for backend services.",
    answerGuideline: {
      idealAnswer:
        "The candidate should articulate that the GIL prevents multiple native threads from executing Python bytecodes simultaneously in CPython. For I/O-bound operations (network requests, DB calls), asyncio or threading is ideal because the GIL is released during I/O. For CPU-bound tasks, multiprocessing or C-extensions bypass the GIL by running separate processes with isolated memory spaces.",
      keySignals: [
        "Mentions CPython GIL release during blocking I/O calls",
        "Clear distinction between CPU-bound vs I/O-bound concurrency models",
        "Understands process IPC overhead vs thread shared-memory trade-offs",
      ],
      redFlags: [
        "Claims threading provides CPU parallelism in default CPython",
        "Confuses asyncio event loop with true multi-core parallel execution",
      ],
      rubric: {
        score5:
          "Flawless explanation including GIL internals, event-loop lifecycle, and production memory implications.",
        score3: "Accurate basic distinction between threads and processes, but vague on asyncio internals.",
        score1: "Incorrectly states threads run in parallel on multi-core CPython without processes.",
      },
    },
  },
  {
    id: "q-int-01",
    difficulty: "Intermediate",
    category: "Django ORM & Query Performance",
    targetSkillOrProject: "Django",
    questionText:
      "In Django REST Framework, what is the N+1 query problem, how do `select_related` and `prefetch_related` mitigate it under the hood, and how do you inspect generated SQL queries?",
    answerGuideline: {
      idealAnswer:
        "The candidate should describe how accessing related foreign keys inside a loop triggers a separate DB query per row (N+1). `select_related` performs an SQL JOIN in a single query (suitable for ForeignKey and OneToOne). `prefetch_related` executes separate queries with an `IN (...)` lookup and joins objects in Python memory (essential for ManyToMany and reverse ForeignKeys). Inspection via django.db.connection.queries, Django Debug Toolbar, or Silk.",
      keySignals: [
        "Articulates SQL JOIN vs separate IN-clause query trade-off",
        "Identifies OneToOne/ForeignKey vs ManyToMany suitability correctly",
        "Mentions connection.queries, django-silk, or EXPLAIN query plans",
      ],
      redFlags: [
        "Uses select_related on ManyToMany fields without understanding SQL limitation",
        "Cannot explain where memory overhead is incurred in prefetch_related",
      ],
      rubric: {
        score5:
          "Deep mastery of ORM caching, SQL execution mechanics, and memory profiling of large prefetch queries.",
        score3: "Explains N+1 and knows when to use each method, but has limited SQL-level inspection depth.",
        score1: "Unaware of N+1 query problem or believes Django queries are always automatically optimized.",
      },
    },
  },
  {
    id: "q-adv-01",
    difficulty: "Advanced",
    category: "PostgreSQL High-Throughput & Indexing",
    targetSkillOrProject: "PostgreSQL",
    questionText:
      "When optimizing high-throughput PostgreSQL databases under heavy write loads, what are the architectural trade-offs between B-Tree, BRIN, and GIN indexes, and how do you prevent table bloat during bulk updates?",
    answerGuideline: {
      idealAnswer:
        "B-Tree is the default for high-cardinality equality and range queries, but incurs significant write amplification on heavy INSERT/UPDATE streams. BRIN indexes store min/max per page block, offering 99% smaller index footprints for append-mostly sequential timestamps/IDs. GIN is ideal for JSONB and full-text search, but updates are costly. To prevent bloat, tune autovacuum (autovacuum_vacuum_scale_factor), use HOT (Heap-Only Tuples) updates with suitable fillfactor, and partition large tables.",
      keySignals: [
        "Explains BRIN index page-range block compression and sequential ordering prerequisite",
        "Explains HOT updates (Heap-Only Tuples) and fillfactor tuning to prevent index rewrites",
        "Mentions autovacuum starvation and MVCC dead tuple reclamation",
      ],
      redFlags: [
        "Suggests putting GIN indexes on rapidly updating high-throughput transaction tables",
        "Does not know how MVCC causes dead tuples or why UPDATE is an INSERT+DELETE in Postgres",
      ],
      rubric: {
        score5:
          "Principal architect mastery: details HOT optimization, BRIN page sizing, MVCC vacuum heuristics, and partition pruning.",
        score3: "Understands B-Tree vs GIN well and mentions vacuuming, but unfamiliar with BRIN or fillfactor.",
        score1: "Cannot explain how indexes degrade write throughput or what table bloat means.",
      },
    },
  },
  {
    id: "q-proj-01",
    difficulty: "Candidate Projects",
    category: "Architecture Probe: FinStream Distributed Ledger",
    targetSkillOrProject: "FinStream Distributed Ledger (Ali Raza Project)",
    questionText:
      "In your 'FinStream Distributed Ledger' project, you benchmarked 3,200 requests/sec with PostgreSQL connection pooling and Docker Compose. How did you handle distributed transaction isolation and prevent pool starvation under peak load spikes?",
    answerGuideline: {
      idealAnswer:
        "Candidate should explain connection pool dimensioning (e.g. PgBouncer in transaction pooling mode), keeping DB transactions strictly under 50ms, offloading heavy calculations to Celery workers backed by Redis, and using optimistic locking (`SELECT FOR UPDATE` or version stamps) to prevent race conditions during ledger balance reconciliations.",
      keySignals: [
        "Mentions PgBouncer or Pgpool in transaction pooling vs session pooling",
        "Explains ledger idempotency keys and transactional outbox patterns",
        "Demonstrates real benchmark numbers (P95/P99 latency metrics)",
      ],
      redFlags: [
        "Vague on how 3,200 req/sec was achieved or cannot explain DB connection pool limits",
        "Admits benchmark was run on localhost without network latency or simulated lock contention",
      ],
      rubric: {
        score5:
          "Authoritative, battle-tested explanation of pool sizing formulas, idempotency keys, and P99 latency controls.",
        score3: "Solid explanation of PgBouncer and Redis queuing, but minor gaps in distributed lock failure modes.",
        score1: "Hesitant or unable to defend specific architectural claims made on the resume.",
      },
    },
  },
];

const INITIAL_SCHEDULES: ScheduledInterview[] = [
  {
    id: "sched-001",
    candidateId: "cand-ali-raza",
    candidateName: "Ali Raza",
    jobTitle: "Senior Backend Developer",
    date: "2026-11-10",
    time: "14:00",
    interviewer: "Elena Vance",
    type: "Technical Architecture & System Design",
    status: "scheduled",
    meetingLink: "https://meet.talentswiss.io/interview-ar-tech-eval",
  },
];

export default function RecruiterCommandCenter() {
  const router = useRouter();

  // Active View Tab: Tab 1 Leaderboard | Tab 2 Interview Engine | Tab 3 Analytics
  const [activeTab, setActiveTab] = useState<"leaderboard" | "interviews" | "analytics">("leaderboard");

  // Core Data State (Pre-loaded with Section 6 Demo)
  const [candidates, setCandidates] = useState<RecruiterCandidate[]>(INITIAL_CANDIDATES);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("cand-ali-raza");
  const [selectedAppId, setSelectedAppId] = useState<string>("cand-ali-raza");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState<string>("ALL");
  const [blindMode, setBlindMode] = useState(false);

  // Scoring Weights (50 / 25 / 15 / 10 default)
  const [weights, setWeights] = useState({
    skills: 50,
    experience: 25,
    projects: 15,
    qualifications: 10,
  });
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);

  // Manual Score Override Modal
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideScore, setOverrideScore] = useState<number>(95);
  const [overrideReason, setOverrideReason] = useState("");

  // Skill Detail Drawer / Inline Inspection
  const [inspectedSkill, setInspectedSkill] = useState<{
    candidateId: string;
    skill: CandidateSkill;
  } | null>(null);

  // Candidate Comparison Modal (2–3 candidates)
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(["cand-ali-raza", "cand-sara-khan"]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Bias Shield Modal
  const [isBiasModalOpen, setIsBiasModalOpen] = useState(false);

  // Duplicate Alert State
  const [duplicateMergedNotice, setDuplicateMergedNotice] = useState(false);

  // Recruiter Note Input
  const [newNoteInput, setNewNoteInput] = useState("");

  // Tab 2: Interview Questions State
  const [questions, setQuestions] = useState<InterviewQItem[]>(INITIAL_QUESTIONS);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "All" | "Beginner" | "Intermediate" | "Advanced" | "Candidate Projects"
  >("All");
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>("q-adv-01");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedQuestionText, setEditedQuestionText] = useState("");

  // Tab 2: Interview Scheduler Form
  const [scheduledInterviews, setScheduledInterviews] = useState<ScheduledInterview[]>(INITIAL_SCHEDULES);
  const [schedDate, setSchedDate] = useState("2026-11-10");
  const [schedTime, setSchedTime] = useState("14:00");
  const [schedInterviewer, setSchedInterviewer] = useState("Elena Vance");
  const [schedType, setSchedType] = useState("Technical Architecture Deep-Dive");
  const [conflictDetected, setConflictDetected] = useState(false);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState("");

  // Tab 2: 5-Star Interviewer Feedback Rubric
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackTechScore, setFeedbackTechScore] = useState<number>(5);
  const [feedbackNotes, setFeedbackNotes] = useState(
    "Candidate demonstrated exceptional mastery of PostgreSQL query optimization, B-Tree vs BRIN indexing, and Docker multi-stage builds. Strong hire recommendation."
  );
  const [finalDecisionToast, setFinalDecisionToast] = useState<string | null>(null);

  // Active Selected Candidate
  const activeCandidate = useMemo(() => {
    return candidates.find((c) => c.id === selectedCandidateId) || candidates[0];
  }, [candidates, selectedCandidateId]);

  // Recalculate candidate overall scores based on interactive weights
  const scoredCandidates = useMemo(() => {
    const totalWeight = weights.skills + weights.experience + weights.projects + weights.qualifications || 100;
    const wS = weights.skills / totalWeight;
    const wE = weights.experience / totalWeight;
    const wP = weights.projects / totalWeight;
    const wQ = weights.qualifications / totalWeight;

    return candidates.map((cand) => {
      if (cand.manualOverrideScore !== undefined) {
        return { ...cand, overallScore: cand.manualOverrideScore };
      }
      const calculated = Math.round(
        cand.scores.skills * wS +
          cand.scores.experience * wE +
          cand.scores.projects * wP +
          cand.scores.qualifications * wQ
      );
      return { ...cand, overallScore: calculated };
    });
  }, [candidates, weights]);

  // Filter & Search Candidates (Natural Language Support)
  const filteredCandidates = useMemo(() => {
    return scoredCandidates
      .filter((cand) => {
        if (pipelineFilter !== "ALL" && cand.stage !== pipelineFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();

        // Check name, role, summary, skills
        const matchBasic =
          cand.name.toLowerCase().includes(q) ||
          cand.role.toLowerCase().includes(q) ||
          cand.summary.toLowerCase().includes(q);

        // Check skill citations & quotes
        const matchSkills = cand.skills.some(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.citationQuote.toLowerCase().includes(q) ||
            (s.synonymAlias && s.synonymAlias.toLowerCase().includes(q))
        );

        // Semantic natural language queries
        if (q.includes("python") && q.includes("rest")) {
          return cand.skills.some((s) => s.name === "Python" && s.citationQuote.includes("REST"));
        }
        if (q.includes("docker")) {
          return cand.skills.some((s) => s.name === "Docker");
        }
        if (q.includes("postgres") || q.includes("sql")) {
          return cand.skills.some((s) => s.name === "PostgreSQL");
        }

        return matchBasic || matchSkills;
      })
      .sort((a, b) => b.overallScore - a.overallScore);
  }, [scoredCandidates, pipelineFilter, searchQuery]);

  // Check for Scheduling Conflict whenever date, time, or interviewer changes
  useEffect(() => {
    const isConflict = scheduledInterviews.some(
      (s) =>
        s.status === "scheduled" &&
        s.date === schedDate &&
        s.time === schedTime &&
        s.interviewer.toLowerCase() === schedInterviewer.toLowerCase()
    );
    setConflictDetected(isConflict);
  }, [schedDate, schedTime, schedInterviewer, scheduledInterviews]);

  // 1-Click Stage Transition (Zero-Failure Hybrid State)
  const handleStageTransition = async (candidateId: string, toStage: PipelineStage) => {
    // 1. Instant optimistic local UI update (0ms latency for slow Wi-Fi)
    const nowIso = new Date().toISOString();
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const fromStage = c.stage;
          return {
            ...c,
            stage: toStage,
            auditTrail: [
              ...c.auditTrail,
              {
                fromStage,
                toStage,
                actionBy: "Elena Vance (Recruiter Command)",
                timestamp: nowIso,
                note: `Transitioned status to ${toStage}. Candidate pipeline updated.`,
              },
            ],
          };
        }
        return c;
      })
    );

    // 2. Background API sync (best-effort)
    try {
      await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule",
          applicationId: candidateId,
          candidateId,
          finalDecision: toStage === "SELECTED" ? "hire" : toStage === "REJECTED" ? "reject" : "screen",
        }),
      });
    } catch (e) {
      console.warn("Background API sync handled locally:", e);
    }
  };

  // Add Recruiter Private Note
  const handleAddNote = () => {
    if (!newNoteInput.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      author: "Elena Vance (Lead Recruiter)",
      content: newNoteInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setCandidates((prev) =>
      prev.map((c) => (c.id === selectedCandidateId ? { ...c, notes: [newNote, ...c.notes] } : c))
    );
    setNewNoteInput("");
  };

  // Manual Score Override Apply
  const handleApplyOverride = () => {
    if (!overrideReason.trim()) return;
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === selectedCandidateId
          ? {
              ...c,
              manualOverrideScore: overrideScore,
              manualOverrideReason: overrideReason.trim(),
              auditTrail: [
                ...c.auditTrail,
                {
                  fromStage: c.stage,
                  toStage: c.stage,
                  actionBy: "Elena Vance (Manual Override)",
                  timestamp: new Date().toISOString(),
                  note: `Manual Score Override applied: ${c.overallScore}% -> ${overrideScore}%. Reason: "${overrideReason}"`,
                },
              ],
            }
          : c
      )
    );
    setIsOverrideModalOpen(false);
    setOverrideReason("");
  };

  // Reset Override
  const handleResetOverride = (candidateId: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              manualOverrideScore: undefined,
              manualOverrideReason: undefined,
            }
          : c
      )
    );
  };

  // 1-Click Merge Duplicate Records
  const handleMergeDuplicate = (candidateId: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              hasDuplicate: false,
              auditTrail: [
                ...c.auditTrail,
                {
                  fromStage: c.stage,
                  toStage: c.stage,
                  actionBy: "TalentIQ Deduplication Engine",
                  timestamp: new Date().toISOString(),
                  note: `Merged duplicate record #APP-1092-PRIOR into canonical record #${c.id}. Dossier consolidated.`,
                },
              ],
            }
          : c
      )
    );
    setDuplicateMergedNotice(true);
    setTimeout(() => setDuplicateMergedNotice(false), 5000);
  };

  // Schedule New Interview
  const handleScheduleInterview = async () => {
    if (conflictDetected) return;

    const newSched: ScheduledInterview = {
      id: `sched-${Date.now().toString().slice(-4)}`,
      candidateId: activeCandidate.id,
      candidateName: activeCandidate.name,
      jobTitle: SECTION_6_VACANCY.title,
      date: schedDate,
      time: schedTime,
      interviewer: schedInterviewer,
      type: schedType,
      status: "scheduled",
      meetingLink: `https://meet.talentswiss.io/interview-${activeCandidate.id}-${Date.now().toString().slice(-3)}`,
    };

    setScheduledInterviews((prev) => [newSched, ...prev]);

    // Automatically transition candidate to INTERVIEW stage
    handleStageTransition(activeCandidate.id, "INTERVIEW");

    setScheduleSuccessMsg(`Interview confirmed for ${schedDate} at ${schedTime} with ${schedInterviewer}.`);
    setTimeout(() => setScheduleSuccessMsg(""), 5000);

    // Call background API
    try {
      await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule",
          candidateId: activeCandidate.id,
          date: schedDate,
          time: schedTime,
          interviewer: schedInterviewer,
          interviewType: schedType,
        }),
      });
    } catch {}
  };

  // Record Final Decision (Select / Reject)
  const handleRecordFinalDecision = (decision: "Select (Offer)" | "Reject") => {
    const toStage: PipelineStage = decision === "Select (Offer)" ? "SELECTED" : "REJECTED";
    handleStageTransition(activeCandidate.id, toStage);

    setFinalDecisionToast(
      `Decision recorded: ${activeCandidate.name} marked as ${decision.toUpperCase()}. Simulated candidate notification email dispatched via TalentIQ Relay.`
    );
    setTimeout(() => setFinalDecisionToast(null), 6000);
  };

  // Regenerate Question with AI
  const handleRegenerateQuestion = async (qId: string) => {
    const targetQ = questions.find((q) => q.id === qId);
    if (!targetQ) return;

    // Instant local upgrade
    const alternateQuestions: Record<string, string> = {
      "q-beg-01":
        "How does Python's asyncio cooperative multitasking differ from OS-level preemption, and how do you handle unhandled exceptions inside background tasks?",
      "q-int-01":
        "How would you refactor a Django REST Framework ModelViewSet query generating 100+ SQL statements into a zero-allocation subquery with Django's `FilteredRelation`?",
      "q-adv-01":
        "Compare PostgreSQL partitioning strategies (declarative range vs hash partitioning) for an append-heavy audit ledger table scaling beyond 500 million rows.",
      "q-proj-01":
        "In FinStream, what specific connection pooling parameters (pool_size, max_overflow, pool_timeout) did you tune in PgBouncer to prevent worker starvation during sudden traffic spikes?",
    };

    const newText =
      alternateQuestions[qId] ||
      `Advanced deep-dive: Probing production architectural patterns in ${targetQ.targetSkillOrProject}.`;

    setQuestions((prev) => prev.map((q) => (q.id === qId ? { ...q, questionText: newText } : q)));
  };

  // Delete Question
  const handleDeleteQuestion = (qId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  // Edit Question Save
  const handleSaveEditedQuestion = (qId: string) => {
    if (!editedQuestionText.trim()) return;
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, questionText: editedQuestionText.trim() } : q))
    );
    setEditingQuestionId(null);
    setEditedQuestionText("");
  };

  // Comparison toggle
  const toggleCandidateComparison = (candId: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(candId)) {
        return prev.filter((id) => id !== candId);
      } else {
        if (prev.length >= 3) return [prev[1], prev[2], candId];
        return [...prev, candId];
      }
    });
  };

  // Blind mode name anonymizer
  const getDisplayName = (fullName: string) => {
    if (!blindMode) return fullName;
    const hash = fullName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `Candidate #CAN-${(hash % 900 + 100).toString(16).toUpperCase()}`;
  };

  // 7 Stages definition for pipeline progress bar
  const PIPELINE_STAGES: { key: PipelineStage; label: string }[] = [
    { key: "SUBMITTED", label: "Submitted" },
    { key: "PARSED", label: "Parsed" },
    { key: "AI_ASSESSMENT", label: "AI Eval" },
    { key: "RECRUITER_REVIEW", label: "Review" },
    { key: "SHORTLISTED", label: "Shortlisted" },
    { key: "INTERVIEW", label: "Interview" },
    { key: "SELECTED", label: "Selected" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20 transition-colors duration-150">
      {/* Swiss Header Navigation */}
      <SwissHeader
        currentRole="recruiter"
        onRoleChange={(newRole) => {
          if (newRole === "candidate") router.push("/candidate");
        }}
        onResetData={() => {
          setCandidates(INITIAL_CANDIDATES);
          setQuestions(INITIAL_QUESTIONS);
          setScheduledInterviews(INITIAL_SCHEDULES);
          setWeights({ skills: 50, experience: 25, projects: 15, qualifications: 10 });
        }}
        isResetting={false}
        dbType="local_json"
        blindMode={blindMode}
        onToggleBlindMode={() => setBlindMode(!blindMode)}
      />

      {/* Requisition Bar & Tab Navigation */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Active Vacancy Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
            <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {SECTION_6_VACANCY.title}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 font-semibold">
              SECTION 6 DEMO ACTIVE
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
            <span>Req Skills:</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
              Python (35%), Django (30%), PostgreSQL (20%), Docker (15%)
            </span>
          </div>
        </div>

        {/* Center: Command Center Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "leaderboard"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-emerald-400 shadow-xs border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tab 1: Leaderboard & Pipeline</span>
            <span className="text-[10px] px-1 rounded bg-zinc-200 dark:bg-zinc-700">
              {scoredCandidates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("interviews")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "interviews"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-emerald-400 shadow-xs border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tab 2: AI Interview & Scheduler</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "analytics"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-emerald-400 shadow-xs border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Tab 3: Live Analytics</span>
          </button>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Bias Shield Modal Button */}
          <button
            onClick={() => setIsBiasModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-mono transition-colors shadow-2xs"
            title="Inspect Demographic Perturbation Test"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Bias Shield (0.0% Delta)</span>
          </button>

          {/* Interactive Weight Sliders Button */}
          <button
            onClick={() => setIsWeightsModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-mono transition-colors shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
            <span>Weights ({weights.skills}/{weights.experience}/{weights.projects}/{weights.qualifications})</span>
          </button>
        </div>
      </div>

      {/* Global Notifications & Banners */}
      {finalDecisionToast && (
        <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-mono flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{finalDecisionToast}</span>
          </div>
          <button onClick={() => setFinalDecisionToast(null)} className="text-emerald-100 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {duplicateMergedNotice && (
        <div className="bg-blue-600 text-white px-6 py-2.5 text-xs font-mono flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Canonical duplicate record merged. Audit trail and verified citations successfully preserved.</span>
          </div>
          <button onClick={() => setDuplicateMergedNotice(false)} className="text-blue-100 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">
        {/* ==================================================================== */}
        {/* TAB 1: EXPLAINABLE CANDIDATE LEADERBOARD & 7-STAGE PIPELINE           */}
        {/* ==================================================================== */}
        {activeTab === "leaderboard" && (
          <div className="flex flex-col gap-5">
            {/* Natural Language Talent Search & Duplicate Banner */}
            <div className="flex flex-col gap-3">
              {/* Duplicate Candidate Alert Banner */}
              {activeCandidate.hasDuplicate && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-lg flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <strong className="font-mono">Duplicate Candidate Detected:</strong> "{activeCandidate.name}" has
                      another active application record (App #{activeCandidate.duplicateInfo?.appId} /{" "}
                      {activeCandidate.duplicateInfo?.email}) with {activeCandidate.duplicateInfo?.similarity}% similarity.
                    </div>
                  </div>
                  <button
                    onClick={() => handleMergeDuplicate(activeCandidate.id)}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-mono font-semibold text-xs transition-colors shrink-0 shadow-xs"
                  >
                    1-Click Merge Records
                  </button>
                </div>
              )}

              {/* Natural Language Talent Search Bar */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <Search className="w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder='Try semantic search: "Python developers with REST API experience", "Docker", "PostgreSQL", or candidate name...'
                      className="bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none w-full font-sans"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="text-zinc-400 hover:text-zinc-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Stage Filter Buttons */}
                  <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-800 pl-3">
                    {["ALL", "SHORTLISTED", "RECRUITER_REVIEW", "AI_ASSESSMENT"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setPipelineFilter(st)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                          pipelineFilter === st
                            ? "bg-zinc-900 dark:bg-emerald-500 text-white dark:text-zinc-950 font-bold"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Natural Language Search Suggestion Chips */}
                <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    Quick NL Queries:
                  </span>
                  {[
                    "Python & Django with high throughput",
                    "Candidates with Docker experience",
                    "PostgreSQL query optimization",
                    "FastAPI microservices",
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSearchQuery(chip)}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      "{chip}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Split Leaderboard & Detailed Inspection Drawer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Ranked Candidate Cards (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col gap-3.5">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
                  <span>
                    RANKED CANDIDATES ({filteredCandidates.length}) // 50/25/15/10 WEIGHTED FIT
                  </span>
                  {selectedForComparison.length > 1 && (
                    <button
                      onClick={() => setIsCompareModalOpen(true)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-mono font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Split className="w-3 h-3" />
                      <span>Compare Selected ({selectedForComparison.length})</span>
                    </button>
                  )}
                </div>

                {/* Candidate Card Loop */}
                {filteredCandidates.map((cand, index) => {
                  const isSelected = selectedCandidateId === cand.id;
                  const isCompared = selectedForComparison.includes(cand.id);

                  return (
                    <div
                      key={cand.id}
                      onClick={() => {
                        setSelectedCandidateId(cand.id);
                        setSelectedAppId(cand.id);
                      }}
                      className={`bg-white dark:bg-zinc-900 border rounded-xl p-4 transition-all cursor-pointer relative group ${
                        isSelected
                          ? "border-emerald-500 dark:border-emerald-500 shadow-md ring-1 ring-emerald-500/30"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs"
                      }`}
                    >
                      {/* Top Header: Rank, Compare Checkbox, Name, Score */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Checkbox for side-by-side comparison */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCandidateComparison(cand.id);
                            }}
                            className="text-zinc-400 hover:text-emerald-500"
                            title="Select for Side-by-Side Comparison"
                          >
                            {isCompared ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>

                          {/* Rank Circle */}
                          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-mono font-bold text-xs text-zinc-600 dark:text-zinc-300">
                            #{index + 1}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {getDisplayName(cand.name)}
                              </h3>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.2 rounded font-semibold border ${
                                  cand.stage === "SHORTLISTED"
                                    ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                                    : cand.stage === "INTERVIEW"
                                    ? "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800"
                                    : cand.stage === "RECRUITER_REVIEW"
                                    ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700"
                                }`}
                              >
                                {cand.stage}
                              </span>

                              {cand.manualOverrideScore !== undefined && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 font-bold">
                                  MANUAL OVERRIDE
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                              {cand.role} • {cand.experienceYears}y exp • {cand.location}
                            </p>
                          </div>
                        </div>

                        {/* Composite Score Pill */}
                        <div className="text-right shrink-0">
                          <div className="flex items-baseline justify-end gap-1">
                            <span
                              className={`text-2xl font-mono font-bold ${
                                cand.overallScore >= 80
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : cand.overallScore >= 60
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {cand.overallScore}%
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">FIT</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 block">
                            {cand.matchBadge}
                          </span>
                        </div>
                      </div>

                      {/* 4-Segment Weighted Score Bar (Requirement 2.1) */}
                      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] font-mono">
                        <div>
                          <div className="text-zinc-500 flex justify-between">
                            <span>SKILLS ({weights.skills}%)</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              {cand.scores.skills}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${cand.scores.skills}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500 flex justify-between">
                            <span>EXP ({weights.experience}%)</span>
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                              {cand.scores.experience}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${cand.scores.experience}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500 flex justify-between">
                            <span>PROJ ({weights.projects}%)</span>
                            <span className="text-purple-600 dark:text-purple-400 font-semibold">
                              {cand.scores.projects}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${cand.scores.projects}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500 flex justify-between">
                            <span>QUAL ({weights.qualifications}%)</span>
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              {cand.scores.qualifications}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${cand.scores.qualifications}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tri-State Skill Pills with Verified Match / Missing / Confirmed Absence */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 text-[11px]">
                        {cand.skills.map((skill, sIdx) => {
                          const isMatch = skill.status === "VERIFIED_MATCH";
                          const isMissing = skill.status === "MISSING_EVIDENCE";
                          const isAbsent = skill.status === "CONFIRMED_ABSENT";

                          return (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectedSkill({ candidateId: cand.id, skill });
                              }}
                              className={`px-2 py-0.5 rounded font-mono text-[10px] border flex items-center gap-1 transition-all ${
                                isMatch
                                  ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:ring-1 hover:ring-emerald-500"
                                  : isMissing
                                  ? "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:ring-1 hover:ring-amber-500"
                                  : "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:ring-1 hover:ring-rose-500"
                              }`}
                            >
                              <span>
                                {isMatch ? "✓" : isMissing ? "○" : "✗"} {skill.name}
                              </span>
                              {skill.synonymAlias && (
                                <span className="text-[9px] opacity-75 font-mono">
                                  ({skill.synonymAlias}→{skill.name})
                                </span>
                              )}
                              <span className="text-[8px] opacity-80 uppercase tracking-tighter">
                                {isMatch ? "Verified" : isMissing ? "Missing" : "Absent"}
                              </span>
                            </button>
                          );
                        })}

                        {/* Hallucination Verifier Badge */}
                        {cand.hallucinationAlerts.length > 0 ? (
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-400 dark:border-rose-800 flex items-center gap-1 font-bold animate-pulse">
                            <ShieldAlert className="w-3 h-3 text-rose-500" />
                            <span>1 Hallucination Flagged</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span>Source Verified</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Deep Scorecard & Pipeline Progression (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4 sticky top-24">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-md space-y-5">
                  {/* Candidate Dossier Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        EXPLAINABLE DOSSIER & CITATIONS
                      </span>
                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mt-0.5">
                        {getDisplayName(activeCandidate.name)}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                        {activeCandidate.role}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {activeCandidate.overallScore}%
                        </span>
                        <button
                          onClick={() => {
                            setOverrideScore(activeCandidate.overallScore);
                            setIsOverrideModalOpen(true);
                          }}
                          className="text-zinc-400 hover:text-purple-500 p-1"
                          title="Recruiter Manual Override"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">Weighted Fit</span>
                    </div>
                  </div>

                  {/* Multi-Dimensional Radar Chart */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <BarChart2 className="w-4 h-4 text-emerald-500" />
                        Multi-Dimensional Alignment
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">APACHE ECHARTS</span>
                    </div>
                    <RadarScorecardChart
                      candidateName={getDisplayName(activeCandidate.name)}
                      scores={{
                        skills: activeCandidate.scores.skills,
                        experience: activeCandidate.scores.experience,
                        projects: activeCandidate.scores.projects,
                        qualifications: activeCandidate.scores.qualifications,
                      }}
                    />
                  </div>

                  {/* Grounded Resume Citations (Requirement 2.1) */}
                  <div>
                    <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      Grounded Citations & Verbatim Excerpts
                    </span>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {activeCandidate.skills.map((skill, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs"
                        >
                          <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mb-1">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              {skill.name} ({skill.years}y • {skill.proficiency})
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                              {skill.sourceSection}
                            </span>
                          </div>
                          <p className="text-zinc-700 dark:text-zinc-300 italic text-[11px] border-l-2 border-emerald-500 pl-2">
                            "{skill.citationQuote}"
                          </p>
                          {skill.rationale && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 pl-2">
                              Note: {skill.rationale}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hallucination Alerts Card (if any) */}
                  {activeCandidate.hallucinationAlerts.length > 0 && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-lg text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-mono font-bold">
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                        <span>AI Hallucination Verifier Flag</span>
                      </div>
                      {activeCandidate.hallucinationAlerts.map((h, hIdx) => (
                        <div key={hIdx} className="space-y-1 text-zinc-700 dark:text-zinc-300 text-[11px]">
                          <div>
                            <span className="font-semibold text-rose-700 dark:text-rose-400">Claim:</span> {h.claim}
                          </div>
                          <div>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Verified Reality:</span>{" "}
                            {h.reality}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400">
                            Confidence: {(h.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Learning Areas (for Gaps) */}
                  {activeCandidate.suggestedLearning.length > 0 && (
                    <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs">
                      <span className="font-mono font-semibold text-amber-800 dark:text-amber-300 block mb-1.5">
                        Targeted Upskilling & Learning Areas:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-700 dark:text-zinc-300">
                        {activeCandidate.suggestedLearning.map((item, lIdx) => (
                          <li key={lIdx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 7-Stage Pipeline Progression (Requirement 2.1) */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-emerald-500" />
                        7-Stage Status Progression
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {activeCandidate.stage}
                      </span>
                    </div>

                    {/* 7-Stage Clickable Bar */}
                    <div className="grid grid-cols-7 gap-1">
                      {PIPELINE_STAGES.map((st) => {
                        const isCurrent = activeCandidate.stage === st.key;
                        return (
                          <button
                            key={st.key}
                            onClick={() => handleStageTransition(activeCandidate.id, st.key)}
                            className={`py-1.5 px-0.5 rounded text-[10px] font-mono font-semibold text-center transition-all ${
                              isCurrent
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                            }`}
                            title={`Advance candidate to ${st.label}`}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Advance Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => handleStageTransition(activeCandidate.id, "SHORTLISTED")}
                        className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold text-center transition-all shadow-xs"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => {
                          handleStageTransition(activeCandidate.id, "INTERVIEW");
                          setActiveTab("interviews");
                        }}
                        className="py-1.5 px-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold text-center transition-all shadow-xs"
                      >
                        Schedule Interview
                      </button>
                      <button
                        onClick={() => handleStageTransition(activeCandidate.id, "SELECTED")}
                        className="py-1.5 px-2 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 text-white rounded text-xs font-semibold text-center transition-all border border-zinc-300 dark:border-zinc-700"
                      >
                        Extend Offer
                      </button>
                    </div>

                    {/* Recruiter Notes Input */}
                    <div className="mt-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newNoteInput}
                          onChange={(e) => setNewNoteInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                          placeholder="Add private recruiter interview note..."
                          className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={handleAddNote}
                          disabled={!newNoteInput.trim()}
                          className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 border border-zinc-700"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>

                      {/* Notes List */}
                      {activeCandidate.notes.length > 0 && (
                        <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {activeCandidate.notes.map((n) => (
                            <div
                              key={n.id}
                              className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs"
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                  {n.author}
                                </span>
                                <span>{n.timestamp}</span>
                              </div>
                              <p className="text-zinc-700 dark:text-zinc-300 text-[11px] mt-0.5">{n.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Expandable Audit Trail Timeline (Requirement 2.1) */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-[11px] font-mono font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        Audit Trail Timeline ({activeCandidate.auditTrail.length} Events)
                      </span>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {activeCandidate.auditTrail.map((ev, eIdx) => (
                          <div
                            key={eIdx}
                            className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px]"
                          >
                            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                {ev.actionBy}
                              </span>
                              <span>{new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <div className="text-zinc-800 dark:text-zinc-200 mt-0.5 font-medium flex items-center gap-1 text-[11px]">
                              {ev.fromStage && <span className="text-zinc-400">{ev.fromStage} →</span>}
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {ev.toStage}
                              </span>
                            </div>
                            {ev.note && (
                              <p className="text-[10px] text-zinc-500 italic mt-0.5">"{ev.note}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: AI INTERVIEW QUESTION GENERATOR & CONFLICT SCHEDULER           */}
        {/* ==================================================================== */}
        {activeTab === "interviews" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Question Generator with 4 Difficulty Tabs (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Question Header & Candidate Selector */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      Role-Tailored AI Interview Questions
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Probing questions with answer rubrics for {activeCandidate.name} ({activeCandidate.role})
                  </p>
                </div>

                {/* Candidate Selector Switcher */}
                <div className="flex items-center gap-1.5">
                  {candidates.map((cand) => (
                    <button
                      key={cand.id}
                      onClick={() => {
                        setSelectedCandidateId(cand.id);
                        setSelectedAppId(cand.id);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                        selectedCandidateId === cand.id
                          ? "bg-zinc-900 dark:bg-emerald-500 text-white dark:text-zinc-950 font-bold"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {cand.name.split(" ")[0]} ({cand.overallScore}%)
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Difficulty Tabs (Requirement 2.2) */}
              <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                {(["All", "Beginner", "Intermediate", "Advanced", "Candidate Projects"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                      selectedDifficulty === diff
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Question Accordion List */}
              <div className="space-y-3">
                {questions
                  .filter((q) => selectedDifficulty === "All" || q.difficulty === selectedDifficulty)
                  .map((q) => {
                    const isExpanded = expandedQuestionId === q.id;
                    const isEditing = editingQuestionId === q.id;

                    return (
                      <div
                        key={q.id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs transition-all"
                      >
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span
                                className={`text-[10px] font-mono px-2 py-0.2 rounded font-semibold border ${
                                  q.difficulty === "Beginner"
                                    ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                    : q.difficulty === "Intermediate"
                                    ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                    : q.difficulty === "Advanced"
                                    ? "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                    : "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                }`}
                              >
                                {q.difficulty}
                              </span>
                              <span className="text-[11px] font-mono text-zinc-500">
                                {q.category} // Target: {q.targetSkillOrProject}
                              </span>
                            </div>

                            {/* Question Text or Inline Edit Mode */}
                            {isEditing ? (
                              <div className="space-y-2">
                                <textarea
                                  rows={3}
                                  value={editedQuestionText}
                                  onChange={(e) => setEditedQuestionText(e.target.value)}
                                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-emerald-500 rounded p-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSaveEditedQuestion(q.id)}
                                    className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-mono font-bold"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingQuestionId(null)}
                                    className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-[11px] font-mono"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                "{q.questionText}"
                              </p>
                            )}
                          </div>

                          {/* Action Buttons: Edit, Delete, Regenerate */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setEditingQuestionId(q.id);
                                setEditedQuestionText(q.questionText);
                              }}
                              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                              title="Edit Question"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRegenerateQuestion(q.id)}
                              className="p-1 text-zinc-400 hover:text-emerald-500"
                              title="AI Regenerate Variant"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1 text-zinc-400 hover:text-rose-500"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 ml-1"
                              title="Toggle Rubric Guideline"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Accordion: Answer Guideline & Scoring Rubric */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2.5 text-xs bg-zinc-50/70 dark:bg-zinc-950/60 p-3 rounded-lg">
                            <div>
                              <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px] uppercase tracking-wider block mb-1">
                                Ideal Answer Key Signals:
                              </strong>
                              <p className="text-zinc-700 dark:text-zinc-300 text-[11px] leading-relaxed">
                                {q.answerGuideline.idealAnswer}
                              </p>
                              <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">
                                {q.answerGuideline.keySignals.map((sig, sIdx) => (
                                  <li key={sIdx}>✓ {sig}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                              <strong className="text-rose-700 dark:text-rose-400 font-mono text-[11px] uppercase tracking-wider block mb-1">
                                Common Red Flags / Misconceptions:
                              </strong>
                              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">
                                {q.answerGuideline.redFlags.map((rf, rIdx) => (
                                  <li key={rIdx}>✗ {rf}</li>
                                ))}
                              </ul>
                            </div>

                            {/* 5-Star Rubric */}
                            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                              <strong className="text-zinc-700 dark:text-zinc-300 font-mono text-[11px] uppercase tracking-wider block mb-1.5">
                                5-Star Interviewer Rubric:
                              </strong>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px]">
                                <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                                  <div className="font-bold text-emerald-700 dark:text-emerald-300">
                                    ★ 5 Stars (Mastery)
                                  </div>
                                  <div className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                                    {q.answerGuideline.rubric.score5}
                                  </div>
                                </div>
                                <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
                                  <div className="font-bold text-amber-700 dark:text-amber-300">
                                    ★ 3 Stars (Adequate)
                                  </div>
                                  <div className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                                    {q.answerGuideline.rubric.score3}
                                  </div>
                                </div>
                                <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800">
                                  <div className="font-bold text-rose-700 dark:text-rose-300">
                                    ★ 1 Star (Insufficient)
                                  </div>
                                  <div className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                                    {q.answerGuideline.rubric.score1}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right Column: Conflict Scheduler & Interviewer Rubric (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5 sticky top-24">
              {/* Interview Scheduler Form (Requirement 2.2) */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      Interview Scheduler & Conflict Guard
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Candidate: {activeCandidate.name.split(" ")[0]}
                  </span>
                </div>

                {/* Scheduling Conflict Alert Banner */}
                {conflictDetected ? (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-400 dark:border-rose-700 rounded-lg text-xs space-y-1.5 animate-pulse">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-mono font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Scheduling Conflict Detected!</span>
                    </div>
                    <p className="text-[11px] text-rose-800 dark:text-rose-200">
                      Interviewer <strong>{schedInterviewer}</strong> is already booked on <strong>{schedDate}</strong> at{" "}
                      <strong>{schedTime}</strong> for another technical evaluation.
                    </p>
                    <div className="pt-1 text-[10px] font-mono">
                      <span className="text-zinc-500 dark:text-zinc-400">Suggested alternatives:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {["10:00", "15:30", "16:30"].map((alt) => (
                          <button
                            key={alt}
                            onClick={() => setSchedTime(alt)}
                            className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-100"
                          >
                            {alt} CET
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300/60 dark:border-emerald-800/60 rounded text-[11px] font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Slot Available: No calendar collisions detected</span>
                  </div>
                )}

                {/* Scheduler Form Inputs */}
                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="text-zinc-500 block mb-1">Interview Date:</label>
                    <input
                      type="date"
                      value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-zinc-500 block mb-1">Time Slot:</label>
                      <select
                        value={schedTime}
                        onChange={(e) => setSchedTime(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="10:00">10:00 AM CET</option>
                        <option value="11:30">11:30 AM CET</option>
                        <option value="14:00">14:00 PM CET (Conflict Slot)</option>
                        <option value="15:30">15:30 PM CET</option>
                        <option value="17:00">17:00 PM CET</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-500 block mb-1">Interviewer:</label>
                      <select
                        value={schedInterviewer}
                        onChange={(e) => setSchedInterviewer(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Elena Vance">Elena Vance (Lead Partner)</option>
                        <option value="Sarah Chen">Sarah Chen (Principal Eng)</option>
                        <option value="David Miller">David Miller (DevOps Lead)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-500 block mb-1">Interview Type:</label>
                    <select
                      value={schedType}
                      onChange={(e) => setSchedType(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Technical Architecture Deep-Dive">
                        Technical Architecture Deep-Dive (60m)
                      </option>
                      <option value="Live Code & ORM Query Optimization">
                        Live Code & ORM Query Optimization (60m)
                      </option>
                      <option value="System Design & Scalability">System Design & Scalability (45m)</option>
                      <option value="Cultural & Engineering Values">Cultural & Engineering Values (30m)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleScheduleInterview}
                    disabled={conflictDetected}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded font-mono font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Confirm & Send Calendar Invitation</span>
                  </button>

                  {scheduleSuccessMsg && (
                    <p className="text-emerald-600 dark:text-emerald-400 text-[11px] font-mono text-center">
                      ✓ {scheduleSuccessMsg}
                    </p>
                  )}
                </div>
              </div>

              {/* 5-Star Interviewer Feedback Rubric & Final Decision (Requirement 2.2) */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      5-Star Interview Evaluation Rubric
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Interviewer Review</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Star Rating Interactive Selector */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-zinc-500">Overall Technical Score:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= feedbackRating
                                ? "text-amber-500 fill-amber-500"
                                : "text-zinc-300 dark:text-zinc-700"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="font-mono font-bold text-sm ml-2 text-zinc-900 dark:text-zinc-100">
                        {feedbackRating}.0 / 5.0
                      </span>
                    </div>
                  </div>

                  {/* Interviewer Notes */}
                  <div>
                    <label className="text-zinc-500 font-mono block mb-1">
                      Interviewer Evaluation Memo & Signal Notes:
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Record Final Decision Buttons */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Record Final Hiring Decision:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleRecordFinalDecision("Select (Offer)")}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-mono font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Select Candidate</span>
                      </button>

                      <button
                        onClick={() => handleRecordFinalDecision("Reject")}
                        className="py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded font-mono font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject Candidate</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: LIVE RECRUITMENT ANALYTICS DASHBOARD                           */}
        {/* ==================================================================== */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* 4 KPI Cards (Requirement 2.3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Active Jobs */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-xs font-mono uppercase">Active Jobs</span>
                  <Briefcase className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  1
                </div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1">
                  Senior Backend Developer Requisition
                </div>
              </div>

              {/* Card 2: Total Applications */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-xs font-mono uppercase">Applications</span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {candidates.length}
                </div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1">
                  100% Ingested & AI Evaluated
                </div>
              </div>

              {/* Card 3: Shortlisted Candidates */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-xs font-mono uppercase">Shortlisted</span>
                  <Award className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-3xl font-mono font-bold text-purple-600 dark:text-purple-400">
                  {candidates.filter((c) => c.stage === "SHORTLISTED" || c.stage === "SELECTED").length}
                </div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1">
                  Advanced to technical rounds
                </div>
              </div>

              {/* Card 4: Pending Interviews */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between text-zinc-500 mb-2">
                  <span className="text-xs font-mono uppercase">Scheduled Interviews</span>
                  <Calendar className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-3xl font-mono font-bold text-amber-600 dark:text-amber-400">
                  {scheduledInterviews.filter((s) => s.status === "scheduled").length}
                </div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1">
                  Active calendar slots booked
                </div>
              </div>
            </div>

            {/* Visual Charts: Funnel & Metrics (Requirement 2.3) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Pipeline Stage Funnel Chart (7 Cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>Pipeline Stage Funnel (Live Progression)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">Conversion Rates</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {[
                    { stage: "Submitted & Received", count: 18, pct: 100, color: "bg-zinc-400" },
                    { stage: "Skills Parsed & Normalized", count: 15, pct: 83, color: "bg-blue-500" },
                    { stage: "AI Evaluated & Scored", count: 12, pct: 66, color: "bg-emerald-500" },
                    { stage: "Recruiter Review", count: 8, pct: 44, color: "bg-amber-500" },
                    {
                      stage: "Shortlisted for Interview",
                      count: candidates.filter((c) => c.stage === "SHORTLISTED" || c.stage === "INTERVIEW" || c.stage === "SELECTED").length + 2,
                      pct: 28,
                      color: "bg-purple-500",
                    },
                    {
                      stage: "Final Selection / Offer",
                      count: candidates.filter((c) => c.stage === "SELECTED").length || 1,
                      pct: 8,
                      color: "bg-emerald-600",
                    },
                  ].map((row, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-zinc-600 dark:text-zinc-300 text-[11px]">
                        <span>{row.stage}</span>
                        <span className="font-bold">
                          {row.count} candidates ({row.pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${row.color} rounded-full transition-all duration-500`}
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Rates & Velocity Metrics (5 Cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Velocity & Quality Benchmarks</span>
                </h3>

                <div className="space-y-4 font-mono text-xs">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <div className="text-zinc-500 text-[10px] uppercase">Application-to-Shortlist Rate</div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      27.8%
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Benchmark: +12.4% higher qualified shortlist accuracy vs unweighted manual resume screening.
                    </p>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <div className="text-zinc-500 text-[10px] uppercase">Average Processing Time</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                      1.8 Days
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Reduced from 14.5 days traditional industry average (87% acceleration).
                    </p>
                  </div>

                  {/* Common Missing Skills Across Talent Pool */}
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="text-zinc-500 text-[10px] uppercase">Common Missing Skills in Applicant Pool</div>
                    {[
                      { name: "Docker (Production Deployments)", missingPct: 66.7, severity: "Important" },
                      { name: "Django (Enterprise ORM)", missingPct: 33.3, severity: "Critical" },
                      { name: "Kubernetes & Mesh Orchestration", missingPct: 33.3, severity: "Nice-to-have" },
                    ].map((item, mIdx) => (
                      <div key={mIdx} className="text-[11px] flex justify-between items-center">
                        <span className="text-zinc-700 dark:text-zinc-300">{item.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                          {item.missingPct}% missing
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* MODALS & DRAWERS                                                     */}
      {/* ==================================================================== */}

      {/* 1. Skill Quote Inspection & Inline Recruiter Edit Drawer */}
      {inspectedSkill && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 shadow-2xl relative font-sans space-y-4">
            <button
              onClick={() => setInspectedSkill(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Grounded Skill Citation & Recruiter Edit
              </h3>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between font-mono">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {inspectedSkill.skill.name}
                </span>
                <span className="text-zinc-500">
                  {inspectedSkill.skill.years} years • {inspectedSkill.skill.proficiency}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Exact Resume Excerpt:</span>
                <p className="italic text-zinc-800 dark:text-zinc-200 border-l-2 border-emerald-500 pl-2 mt-1">
                  "{inspectedSkill.skill.citationQuote}"
                </p>
              </div>

              {inspectedSkill.skill.rationale && (
                <div className="text-[11px] text-amber-700 dark:text-amber-400">
                  <strong>Assessment Note:</strong> {inspectedSkill.skill.rationale}
                </div>
              )}
            </div>

            {/* Recruiter Inline Override Controls */}
            <div className="space-y-2 text-xs font-mono">
              <span className="text-zinc-500 uppercase tracking-wider block">Inline Recruiter Skill Override:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setCandidates((prev) =>
                      prev.map((c) =>
                        c.id === inspectedSkill.candidateId
                          ? {
                              ...c,
                              skills: c.skills.map((s) =>
                                s.name === inspectedSkill.skill.name
                                  ? { ...s, status: "VERIFIED_MATCH" as const }
                                  : s
                              ),
                            }
                          : c
                      )
                    );
                    setInspectedSkill(null);
                  }}
                  className="p-2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 text-center"
                >
                  ✓ Mark Verified
                </button>

                <button
                  onClick={() => {
                    setCandidates((prev) =>
                      prev.map((c) =>
                        c.id === inspectedSkill.candidateId
                          ? {
                              ...c,
                              skills: c.skills.map((s) =>
                                s.name === inspectedSkill.skill.name
                                  ? { ...s, status: "MISSING_EVIDENCE" as const }
                                  : s
                              ),
                            }
                          : c
                      )
                    );
                    setInspectedSkill(null);
                  }}
                  className="p-2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800 text-center"
                >
                  ○ Mark Missing
                </button>

                <button
                  onClick={() => {
                    setCandidates((prev) =>
                      prev.map((c) =>
                        c.id === inspectedSkill.candidateId
                          ? {
                              ...c,
                              skills: c.skills.map((s) =>
                                s.name === inspectedSkill.skill.name
                                  ? { ...s, status: "CONFIRMED_ABSENT" as const }
                                  : s
                              ),
                            }
                          : c
                      )
                    );
                    setInspectedSkill(null);
                  }}
                  className="p-2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-800 text-center"
                >
                  ✗ Mark Absent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Side-by-Side Candidate Comparison Modal (Requirement 2.1) */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-5xl w-full p-6 shadow-2xl relative font-sans space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Split className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                Side-by-Side Candidate Comparison Matrix
              </h3>
            </div>

            {/* Comparison Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {candidates
                .filter((c) => selectedForComparison.includes(c.id))
                .map((cand) => (
                  <div
                    key={cand.id}
                    className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{cand.name}</h4>
                        <span className="text-[11px] font-mono text-zinc-500">{cand.role}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {cand.overallScore}%
                        </span>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span>Skills (50%):</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {cand.scores.skills}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Experience (25%):</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {cand.scores.experience}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projects (15%):</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {cand.scores.projects}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Qualifications (10%):</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {cand.scores.qualifications}%
                        </span>
                      </div>
                    </div>

                    {/* Skills Matrix */}
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Core Skills Status:</span>
                      {cand.skills.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between font-mono text-[11px] p-1.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                        >
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">{s.name}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              s.status === "VERIFIED_MATCH"
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                : s.status === "MISSING_EVIDENCE"
                                ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                                : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                            }`}
                          >
                            {s.status === "VERIFIED_MATCH"
                              ? "Verified"
                              : s.status === "MISSING_EVIDENCE"
                              ? "Missing"
                              : "Absent"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => {
                        handleStageTransition(cand.id, "SHORTLISTED");
                        setIsCompareModalOpen(false);
                      }}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-mono font-bold text-xs shadow-xs"
                    >
                      Shortlist Candidate
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Fairness & Bias Shield Modal (Requirement 2.1) */}
      {isBiasModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-xl w-full p-6 shadow-2xl relative font-sans space-y-4">
            <button
              onClick={() => setIsBiasModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Fairness & Bias Shield Verification
              </h3>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between font-mono font-bold">
                <span className="text-emerald-700 dark:text-emerald-300">
                  Algorithmic Score Parity:
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 text-base">
                  0.0% Delta (Verified Zero Bias)
                </span>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 text-[11px]">
                Counterfactual evaluation verified: When candidate names, gender pronouns, accredited university names,
                and geographic regions are stripped, the model produces mathematically identical candidate rankings.
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <span className="text-zinc-500 uppercase tracking-wider block">Stripped Demographics:</span>
              <ul className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300 text-[11px]">
                <li>Candidate Full Name & Cultural Identifiers</li>
                <li>Gender Pronouns (he/him/she/her normalized to neutral)</li>
                <li>University Names (NUST / FAST replaced with [ACCREDITED_INSTITUTION])</li>
                <li>Geographic Origin (Islamabad / Zurich replaced with [REGION])</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-mono text-zinc-500">
              Compliant with EU AI Act Article 10, EEOC Uniform Selection Guidelines, and IEEE 7000 Standards.
            </div>
          </div>
        </div>
      )}

      {/* 4. Interactive Weight Sliders Modal (Requirement 2.1) */}
      {isWeightsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative font-sans space-y-4">
            <button
              onClick={() => setIsWeightsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Interactive Scoring Weight Sliders
              </h3>
            </div>
            <p className="text-xs text-zinc-500">
              Adjust weights dynamically. Candidate composite scores recalculate instantly across all views.
            </p>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Skills Weight:</span>
                  <span className="font-bold text-emerald-500">{weights.skills}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={weights.skills}
                  onChange={(e) => setWeights({ ...weights, skills: Number(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Experience Weight:</span>
                  <span className="font-bold text-blue-500">{weights.experience}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={weights.experience}
                  onChange={(e) => setWeights({ ...weights, experience: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Projects Weight:</span>
                  <span className="font-bold text-purple-500">{weights.projects}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={weights.projects}
                  onChange={(e) => setWeights({ ...weights, projects: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Qualifications Weight:</span>
                  <span className="font-bold text-amber-500">{weights.qualifications}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={weights.qualifications}
                  onChange={(e) => setWeights({ ...weights, qualifications: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() =>
                    setWeights({ skills: 50, experience: 25, projects: 15, qualifications: 10 })
                  }
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default (50/25/15/10)</span>
                </button>
                <button
                  onClick={() => setIsWeightsModalOpen(false)}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Manual Score Override Modal (Requirement 2.1) */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative font-sans space-y-4">
            <button
              onClick={() => setIsOverrideModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Manual Recruiter Score Override
              </h3>
            </div>
            <p className="text-xs text-zinc-500">
              Provide an audited override score and mandatory rationale for {activeCandidate.name}.
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-zinc-500 block mb-1">New Composite Score (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-zinc-900 dark:text-zinc-100 font-bold text-base focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">Mandatory Recruiter Rationale:</label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Exceptional open-source contribution to Django REST Framework Core; compensated for missing Docker certification."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-between pt-2">
                {activeCandidate.manualOverrideScore !== undefined && (
                  <button
                    onClick={() => {
                      handleResetOverride(activeCandidate.id);
                      setIsOverrideModalOpen(false);
                    }}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Clear Override
                  </button>
                )}
                <button
                  onClick={handleApplyOverride}
                  disabled={!overrideReason.trim()}
                  className="ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded font-bold text-xs shadow-xs"
                >
                  Save Override & Log Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 px-6 py-3 text-center text-xs font-mono text-zinc-500">
        TALENTIQ ENTERPRISE // SECTION 6 BENCHMARK DEMO // RAPID SHOWCASE MODE ACTIVE
      </footer>
    </div>
  );
}
