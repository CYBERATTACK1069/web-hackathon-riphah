"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Layers,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Briefcase,
  GraduationCap,
  Award,
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowRight,
  Sun,
  Moon,
  Trash2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import type {
  ParsedResume,
  NormalizedSkillItem,
  WeightedSkillRequirement,
  JobVacancy,
  MatchEvaluation,
  InterviewQuestion,
} from "@/types/platform";
import type { ComprehensiveVerificationReport } from "@/lib/ai/verifier";
import { normalizeSkillName } from "@/lib/ai/normalizer";
import { formatExperienceDuration } from "@/lib/formatters";

// Sample Grounded Senior Resume for 1-Click Evaluation
const SAMPLE_VALID_RESUME = `Alex Morgan
Senior Cloud & Full-Stack Architect
Email: alex.morgan.eng@gmail.com | Phone: +1 (415) 555-8291
Location: San Francisco, CA | LinkedIn: linkedin.com/in/alexmorgan-cloud | GitHub: github.com/alexmorgan

PROFESSIONAL SUMMARY
Senior Cloud & Distributed Systems Architect with 7+ years of experience architecting resilient financial platforms, high-throughput microservices, and containerized cloud applications. Proven track record migrating legacy monoliths to Kubernetes and optimizing PostgreSQL query pipelines at scale.

CORE COMPETENCIES & TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL, HTML5, CSS3
Frameworks & Libraries: React, Next.js, Node.js, Express.js, Tailwind CSS
Data Stores: PostgreSQL, Redis, MongoDB, Elasticsearch
Cloud & DevOps: Docker, Kubernetes, AWS, Terraform, CI/CD, GitHub Actions
Architecture: Microservices, Distributed Systems, Event-Driven Architecture, REST APIs

PROFESSIONAL WORK EXPERIENCE
Staff Platform Engineer | Stripe Platform Services
San Francisco, CA | 2021 - Present
- Architected and scaled distributed multi-region payment ledger processing over 45M transactions daily.
- Optimized high-load PostgreSQL clustering, reducing P99 latency by 38% and lowering read replicas load.
- Designed automated CI/CD deployment pipelines using GitHub Actions and Kubernetes with zero-downtime rolling deploys.
- Mentored junior engineers and led weekly architectural RFC design reviews across 3 backend squads.

Senior Full-Stack Engineer | Vercel Systems
San Francisco, CA | 2018 - 2021
- Led the migration of client dashboards to Next.js and TypeScript, improving initial page load speeds by 52%.
- Engineered real-time edge telemetry microservices with Node.js, Redis pub/sub, and Docker.
- Spearheaded company-wide adoption of strict TypeScript conventions and automated integration testing.

EDUCATION
University of California, Berkeley | 2014 - 2018
Bachelor of Science in Computer Science (B.S.)
GPA: 3.85 / 4.0 | Dean's Honors List

CERTIFICATIONS
AWS Certified Solutions Architect - Professional | Amazon Web Services (2022)
Certified Kubernetes Administrator (CKA) | CNCF (2023)`;

// Sample Hallucinated / Contradictory Resume
const SAMPLE_HALLUCINATED_RESUME = `Taylor Vance
Junior Frontend Developer
Email: taylor.vance@techtest.io | Phone: +1 (212) 555-4302
Location: New York, NY | GitHub: github.com/taylorvance

PROFESSIONAL SUMMARY
Motivated software engineer with 2 years of professional experience. 
Claiming 12 years of hands-on expertise in Next.js, React, and QuantumFluxDB.

PROFESSIONAL WORK EXPERIENCE
Junior Frontend Engineer | QuickStart Media
New York, NY | 2022 - Present
- Built promotional landing pages using React and Tailwind CSS.
- Maintained internal documentation and bug triage.

EDUCATION
State University of New York | 2018 - 2022
Bachelor of Arts in Media Studies`;

// Sample Free-Text Job Description
const SAMPLE_JOB_DESCRIPTION = `Role: Principal Cloud & Distributed Systems Architect
Department: Cloud Infrastructure Platform
Location: San Francisco, CA (Hybrid)
Experience Level: Senior / Principal (6+ years experience)

About the Opportunity:
We are seeking a seasoned Principal Cloud & Distributed Systems Architect to lead our next-generation transactional infrastructure. In this role, you will define architecture standards, scale our relational datastores, and drive our Kubernetes orchestration strategy.

Key Responsibilities:
- Architect, build, and maintain mission-critical distributed microservices in TypeScript and Node.js.
- Champion cloud-native deployments using Docker, Kubernetes (K8s), and Terraform on AWS.
- Optimize relational data pipelines in PostgreSQL (Postgres) and cache layers in Redis.
- Partner with product managers and security leaders to enforce SOC2 and PCI-DSS compliance.
- Mentor senior engineers and conduct deep-dive architectural design reviews.

Requirements & Qualifications:
- 6+ years of professional experience designing high-scale distributed backend systems.
- Deep expertise in TypeScript, JavaScript (JS), and Node.js ecosystem.
- Extensive production hands-on experience with PostgreSQL, relational indexing, and schema migrations.
- Strong mastery of containerization and orchestration: Docker, Kubernetes, and CI/CD pipelines.
- Bachelor's degree in Computer Science, Software Engineering, or equivalent industry tenure.
- Preferred: Experience with Python (Py), GraphQL, and Event-Driven Architecture.`;

export default function AiLabPage() {
  const [activeTab, setActiveTab] = useState<"resume" | "job" | "normalizer">("resume");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [, startTransition] = useTransition();

  // Resume Test State
  const [resumeText, setResumeText] = useState(SAMPLE_VALID_RESUME);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parsedResult, setParsedResult] = useState<{
    resume: ParsedResume;
    verification: ComprehensiveVerificationReport;
    evaluation?: MatchEvaluation;
    dynamicQuestions?: InterviewQuestion[];
    modelUsed: string;
    isFallback: boolean;
  } | null>(null);
  const [resumeError, setResumeError] = useState<{ message: string; code: string; status: number } | null>(null);
  const [copiedResumeJson, setCopiedResumeJson] = useState(false);
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);

  // Candidate Profile & Skill Edit State for PUT /api/parse-resume
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillYears, setNewSkillYears] = useState(3);
  const [newSkillCategory, setNewSkillCategory] = useState<"language" | "framework" | "database" | "devops" | "architecture" | "tool" | "other">("framework");
  const [isUpdatingSkill, setIsUpdatingSkill] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // Job Extractor State
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB_DESCRIPTION);
  const [isExtractingJob, setIsExtractingJob] = useState(false);
  const [jobResult, setJobResult] = useState<{
    vacancy: JobVacancy;
    requiredSkills: WeightedSkillRequirement[];
    preferredSkills: WeightedSkillRequirement[];
    allSkillWeights: WeightedSkillRequirement[];
    normalizationMap: Record<string, { raw: string; canonical: string; category: string }>;
    confidenceScore: number;
    extractionModel: string;
    isFallback: boolean;
  } | null>(null);
  const [jobError, setJobError] = useState<{ message: string; code: string; status: number } | null>(null);
  const [copiedJobJson, setCopiedJobJson] = useState(false);

  // Playground / Normalizer State
  const [testSkillInput, setTestSkillInput] = useState("k8s");

  // Handler: Run Resume Parsing (POST /api/parse-resume)
  const handleParseResume = async (fileToUpload?: File) => {
    setIsParsingResume(true);
    setResumeError(null);
    setUpdateMessage(null);

    try {
      let res: Response;

      if (fileToUpload || selectedFile) {
        const file = fileToUpload || selectedFile!;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("saveToStore", "true");

        res = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawText: resumeText,
            fileName: "diagnostic_test_resume.txt",
            saveToStore: true,
          }),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        setResumeError({
          message: json.error || "Parsing failed",
          code: json.code || `HTTP_${res.status}`,
          status: res.status,
        });
        setParsedResult(null);
      } else {
        setParsedResult(json.data);
        if (json.data?.resume?.contactInfo) {
          setEditFullName(json.data.resume.contactInfo.fullName || "");
          setEditEmail(json.data.resume.contactInfo.email || "");
          setEditLocation(json.data.resume.contactInfo.location || "");
        }
      }
    } catch (err: unknown) {
      setResumeError({
        message: err instanceof Error ? err.message : "Network error",
        code: "NETWORK_ERROR",
        status: 500,
      });
      setParsedResult(null);
    } finally {
      setIsParsingResume(false);
    }
  };

  // Handler: Test Candidate Edit & Full Save (PUT /api/parse-resume)
  const handleSaveCandidateEdits = async () => {
    if (!parsedResult) return;

    setIsUpdatingSkill(true);
    setUpdateMessage(null);

    try {
      let updatedSkills = [...parsedResult.resume.normalizedSkills];

      // If user typed a new skill in the input box, add it
      if (newSkillName.trim()) {
        const norm = normalizeSkillName(newSkillName.trim());
        const skillCategory = (norm.category === "tool" || norm.category === "other") ? norm.category : (norm.category as any);
        updatedSkills.push({
          skillId: norm.skillId,
          name: norm.canonicalName,
          normalizedName: norm.canonicalName,
          category: skillCategory,
          claimedYears: Number(newSkillYears) || 2,
          proficiencyLevel: "proficient",
          citationIds: [],
        });
      }

      const updatedResume: ParsedResume = {
        ...parsedResult.resume,
        contactInfo: {
          ...parsedResult.resume.contactInfo,
          fullName: editFullName.trim() || parsedResult.resume.contactInfo.fullName,
          email: editEmail.trim() || parsedResult.resume.contactInfo.email,
          location: editLocation.trim() || parsedResult.resume.contactInfo.location,
        },
        normalizedSkills: updatedSkills,
      };

      const res = await fetch("/api/parse-resume", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: updatedResume }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setParsedResult({
          ...parsedResult,
          resume: json.data,
          verification: json.verification || parsedResult.verification,
        });
        setUpdateMessage(`Profile & skills successfully updated, re-verified, and persisted to store.`);
        setNewSkillName("");
      } else {
        setResumeError({
          message: json.error || "Update failed",
          code: json.code || "UPDATE_FAILED",
          status: res.status,
        });
      }
    } catch (err: unknown) {
      setResumeError({
        message: err instanceof Error ? err.message : "Network error",
        code: "NETWORK_ERROR",
        status: 500,
      });
    } finally {
      setIsUpdatingSkill(false);
    }
  };

  // Handler: Remove a skill from candidate profile
  const handleRemoveSkill = (skillIdToRemove: string) => {
    if (!parsedResult) return;
    const filtered = parsedResult.resume.normalizedSkills.filter(
      (s) => s.skillId !== skillIdToRemove
    );
    setParsedResult({
      ...parsedResult,
      resume: {
        ...parsedResult.resume,
        normalizedSkills: filtered,
      },
    });
  };

  // Handler: Run Job Extraction (POST /api/extract-job)
  const handleExtractJob = async () => {
    setIsExtractingJob(true);
    setJobError(null);

    try {
      const res = await fetch("/api/extract-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: jobDescription,
          saveToStore: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setJobError({
          message: json.error || "Extraction failed",
          code: json.code || `HTTP_${res.status}`,
          status: res.status,
        });
        setJobResult(null);
      } else {
        setJobResult(json.data);
      }
    } catch (err: unknown) {
      setJobError({
        message: err instanceof Error ? err.message : "Network error",
        code: "NETWORK_ERROR",
        status: 500,
      });
      setJobResult(null);
    } finally {
      setIsExtractingJob(false);
    }
  };

  // Test Negative Error Scenarios
  const testEmptyFileUpload = () => {
    const emptyFile = new File([], "empty_corrupt_test.pdf", { type: "application/pdf" });
    setSelectedFile(emptyFile);
    handleParseResume(emptyFile);
  };

  const testUnsupportedFile = () => {
    const invalidFile = new File(["dummy binary payload"], "unauthorized_script.exe", {
      type: "application/x-msdownload",
    });
    setSelectedFile(invalidFile);
    handleParseResume(invalidFile);
  };

  const copyToClipboard = (text: string, type: "resume" | "job") => {
    navigator.clipboard.writeText(text);
    if (type === "resume") {
      setCopiedResumeJson(true);
      setTimeout(() => setCopiedResumeJson(false), 2000);
    } else {
      setCopiedJobJson(true);
      setTimeout(() => setCopiedJobJson(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors ${
      theme === "dark"
        ? "bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-black"
        : "bg-zinc-50 text-zinc-900 selection:bg-emerald-200 selection:text-emerald-950"
    }`}>
      {/* Top Banner Ribbon */}
      <div className={`border-b sticky top-0 z-40 backdrop-blur transition-colors ${
        theme === "dark"
          ? "border-zinc-800 bg-zinc-900/90"
          : "border-zinc-200 bg-white/90 shadow-sm"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 text-zinc-950 flex items-center justify-center font-mono font-bold text-base border border-emerald-400">
              AI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`font-bold text-sm tracking-tight uppercase font-mono ${
                  theme === "dark" ? "text-white" : "text-zinc-900"
                }`}>
                  Diagnostic AI Verification Bench
                </h1>
                <span className={`font-mono text-[10px] px-2 py-0.5 uppercase font-semibold ${
                  theme === "dark"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-300"
                }`}>
                  gemini-2.5-flash
                </span>
              </div>
              <p className={`text-[11px] font-mono ${
                theme === "dark" ? "text-zinc-400" : "text-zinc-500"
              }`}>
                System Hardened • Requirement 3.2, 3.3, 3.10
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium border transition-colors ${
                theme === "dark"
                  ? "text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
                  : "text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border-zinc-300"
              }`}
              title="Toggle Light/Dark Theme"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>LIGHT THEME</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>DARK THEME</span>
                </>
              )}
            </button>

            <Link
              href="/"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium border transition-colors ${
                theme === "dark"
                  ? "text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
                  : "text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border-zinc-300"
              }`}
            >
              <span>RETURN TO MAIN PLATFORM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className={`border-b transition-colors ${
        theme === "dark" ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1">
          <button
            onClick={() => setActiveTab("resume")}
            className={`py-3 px-4 font-mono text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "resume"
                ? theme === "dark"
                  ? "border-emerald-500 text-emerald-400 bg-zinc-800/60"
                  : "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : theme === "dark"
                ? "border-transparent text-zinc-400 hover:text-zinc-200"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>1. RESUME PARSER & HALLUCINATION VERIFIER</span>
          </button>

          <button
            onClick={() => setActiveTab("job")}
            className={`py-3 px-4 font-mono text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "job"
                ? theme === "dark"
                  ? "border-emerald-500 text-emerald-400 bg-zinc-800/60"
                  : "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : theme === "dark"
                ? "border-transparent text-zinc-400 hover:text-zinc-200"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>2. JOB REQUIREMENT EXTRACTOR</span>
          </button>

          <button
            onClick={() => setActiveTab("normalizer")}
            className={`py-3 px-4 font-mono text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "normalizer"
                ? theme === "dark"
                  ? "border-emerald-500 text-emerald-400 bg-zinc-800/60"
                  : "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : theme === "dark"
                ? "border-transparent text-zinc-400 hover:text-zinc-200"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>3. CANONICAL NORMALIZER PLAYGROUND</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ========================================================================= */}
        {/* TAB 1: RESUME PARSER & HALLUCINATION VERIFIER */}
        {/* ========================================================================= */}
        {activeTab === "resume" && (
          <div className="space-y-6">
            {/* Control & Input Card */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider">
                    // Resume Upload & Grounded Citation Verification Pipeline
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Upload a PDF or test text. Gemini parses candidate metadata while our deterministic verifier checks verbatim quotes against source bytes.
                  </p>
                </div>

                {/* Quick-Preset Test Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setResumeText(SAMPLE_VALID_RESUME);
                    }}
                    className="px-2.5 py-1 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                  >
                    Load Grounded Senior Resume
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setResumeText(SAMPLE_HALLUCINATED_RESUME);
                    }}
                    className="px-2.5 py-1 text-xs font-mono bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800"
                  >
                    Load Hallucinated Resume (Stress-Test)
                  </button>
                  <button
                    onClick={testEmptyFileUpload}
                    className="px-2.5 py-1 text-xs font-mono bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800"
                  >
                    Test 422 (Empty File)
                  </button>
                  <button
                    onClick={testUnsupportedFile}
                    className="px-2.5 py-1 text-xs font-mono bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-800"
                  >
                    Test 415 (Invalid File)
                  </button>
                </div>
              </div>

              {/* Upload Drop Area or Text Input */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* File Dropzone */}
                <div className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/70 p-6 bg-zinc-950/50 flex flex-col items-center justify-center text-center transition-colors">
                  <UploadCloud className="w-10 h-10 text-emerald-400 mb-3" />
                  <p className="text-xs font-mono font-medium text-zinc-200 mb-1">
                    Upload Candidate PDF Document (.pdf)
                  </p>
                  <p className="text-[11px] text-zinc-500 mb-4">
                    Max size: 10MB • Strict MIME verification (415) • Corrupted header guard (422)
                  </p>
                  <input
                    type="file"
                    id="resume-file-input"
                    accept=".pdf,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="resume-file-input"
                    className="cursor-pointer px-4 py-2 text-xs font-mono font-semibold bg-emerald-600 hover:bg-emerald-500 text-zinc-950 transition-colors"
                  >
                    {selectedFile ? `Selected: ${selectedFile.name}` : "CHOOSE PDF / TXT FILE"}
                  </label>
                  {selectedFile && (
                    <div className="mt-2 text-[11px] font-mono text-emerald-400">
                      File: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>

                {/* Free Text Input Fallback */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono text-zinc-400 uppercase">
                      Or Direct Resume Text Input:
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {resumeText.length} characters
                    </span>
                  </div>
                  <textarea
                    value={resumeText}
                    onChange={(e) => {
                      setSelectedFile(null);
                      setResumeText(e.target.value);
                    }}
                    rows={8}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 font-mono text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
                    placeholder="Paste resume raw text..."
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={isParsingResume}
                  onClick={() => handleParseResume()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isParsingResume ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Parsing & Verifying with Gemini 2.5 Flash...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>RUN RESUME PARSING & VERIFICATION</span>
                    </>
                  )}
                </button>

                <div className="text-[11px] font-mono text-zinc-500">
                  Target Route: <strong className="text-zinc-300">POST /api/parse-resume</strong>
                </div>
              </div>
            </div>

            {/* Error Display Card */}
            {resumeError && (
              <div className="bg-rose-950/50 border border-rose-700 p-4 text-xs font-mono space-y-1">
                <div className="flex items-center gap-2 text-rose-400 font-bold uppercase">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Pipeline Guard Error [{resumeError.code}] // HTTP {resumeError.status}</span>
                </div>
                <p className="text-rose-200">{resumeError.message}</p>
              </div>
            )}

            {/* Extracted & Verified Results View */}
            {parsedResult && (
              <div className="space-y-6">
                {/* Metrics & Execution Stats Ribbon */}
                <div className="bg-zinc-900 border border-zinc-800 p-4 grid grid-cols-2 md:grid-cols-5 gap-4 font-mono text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Model Pipeline</span>
                    <strong className="text-emerald-400">{parsedResult.modelUsed}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Claims Verified</span>
                    <strong className="text-white">
                      {parsedResult.verification.verifiedCount} / {parsedResult.verification.totalClaimsCount}
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Grounded Citations</span>
                    <strong className="text-emerald-400">
                      {parsedResult.verification.citations.length} Verbatim Quotes
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Parsing Confidence</span>
                    <strong className="text-white">
                      {Math.round(parsedResult.resume.parsingConfidence * 100)}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Hallucination Risk</span>
                    <span
                      className={`inline-block px-2 py-0.5 text-[11px] font-bold uppercase ${
                        parsedResult.verification.overallRiskLevel === "clean"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-700"
                          : parsedResult.verification.overallRiskLevel === "critical"
                          ? "bg-rose-950 text-rose-400 border border-rose-700"
                          : "bg-amber-950 text-amber-400 border border-amber-700"
                      }`}
                    >
                      {parsedResult.verification.overallRiskLevel}
                    </span>
                  </div>
                </div>

                {/* Hallucination Alert Banner (if any flags detected) */}
                {parsedResult.verification.flags.length > 0 && (
                  <div className="bg-rose-950/40 border border-rose-700 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                      <h3 className="font-mono text-sm font-bold text-rose-300 uppercase">
                        AI Hallucination & Discrepancy Alert ({parsedResult.verification.flags.length} Flagged Claims)
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {parsedResult.verification.flags.map((flag) => (
                        <div key={flag.id} className="p-3 bg-zinc-950 border border-rose-800 text-xs font-mono space-y-1">
                          <div className="flex items-center justify-between text-rose-400">
                            <strong>[{flag.claimType.replace("_", " ").toUpperCase()}]</strong>
                            <span className="text-[10px] px-1.5 py-0.5 bg-rose-950 border border-rose-700 uppercase">
                              Severity: {flag.severity}
                            </span>
                          </div>
                          <div className="text-white font-medium">Claim: "{flag.suspectClaim}"</div>
                          <p className="text-zinc-400 text-[11px]">{flag.reason}</p>
                          <div className="bg-zinc-900 p-2 border-l-2 border-rose-500 text-[11px] text-zinc-300">
                            <strong>MANDATORY INTERVIEW PROBE:</strong> {flag.recommendedInterviewProbe}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 50/25/15/10 Candidate Match Evaluation Card */}
                {parsedResult.evaluation && (
                  <div className={`p-6 border space-y-5 transition-colors ${
                    theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                  }`}>
                    {/* Header with Composite Score & Verdict */}
                    <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
                      theme === "dark" ? "border-zinc-800" : "border-zinc-200"
                    }`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold uppercase tracking-wider">
                            JOB-BACKEND-001 REQUISITION MATCH
                          </span>
                          <span className={`font-mono text-xs ${
                            theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                          }`}>
                            Senior Backend Developer (Distributed Systems)
                          </span>
                        </div>
                        <h3 className={`text-base font-bold font-mono mt-1 ${
                          theme === "dark" ? "text-white" : "text-zinc-900"
                        }`}>
                          Dynamic Candidate Match Evaluation (50/25/15/10 Strict Weighting)
                        </h3>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-mono text-[10px] text-zinc-500 block uppercase">Composite Score</span>
                          <div className={`text-3xl font-black font-mono tracking-tight ${
                            parsedResult.evaluation.scoreBreakdown.compositeScore >= 80
                              ? "text-emerald-500"
                              : parsedResult.evaluation.scoreBreakdown.compositeScore >= 50
                              ? "text-amber-500"
                              : "text-rose-500"
                          }`}>
                            {parsedResult.evaluation.scoreBreakdown.compositeScore}%
                          </div>
                        </div>

                        <span className={`px-3 py-1 font-mono text-xs font-bold uppercase border ${
                          parsedResult.evaluation.verdict === "strong_match"
                            ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                            : parsedResult.evaluation.verdict === "requires_investigation"
                            ? "bg-rose-950 text-rose-400 border-rose-800"
                            : "bg-amber-950 text-amber-400 border-amber-800"
                        }`}>
                          {parsedResult.evaluation.verdict.replace("_", " ")}
                        </span>

                        <Link
                          href="/"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
                        >
                          <span>VIEW ON DASHBOARD</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* 4-Pillar Score Breakdown (50 / 25 / 15 / 10) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className={`p-3 border font-mono ${
                        theme === "dark" ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      }`}>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                          <span>1. SKILLS (50%)</span>
                          <strong className="text-emerald-500">{parsedResult.evaluation.scoreBreakdown.skillsScore}%</strong>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full"
                            style={{ width: `${Math.min(100, parsedResult.evaluation.scoreBreakdown.skillsScore)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 block">4 Weighted Skills</span>
                      </div>

                      <div className={`p-3 border font-mono ${
                        theme === "dark" ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      }`}>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                          <span>2. EXPERIENCE (25%)</span>
                          <strong className="text-emerald-500">{parsedResult.evaluation.scoreBreakdown.experienceScore}%</strong>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full"
                            style={{ width: `${Math.min(100, parsedResult.evaluation.scoreBreakdown.experienceScore)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 block">Career Tenure & Depth</span>
                      </div>

                      <div className={`p-3 border font-mono ${
                        theme === "dark" ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      }`}>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                          <span>3. PROJECTS (15%)</span>
                          <strong className="text-emerald-500">{parsedResult.evaluation.scoreBreakdown.projectsScore}%</strong>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full"
                            style={{ width: `${Math.min(100, parsedResult.evaluation.scoreBreakdown.projectsScore)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 block">Microservices Portfolio</span>
                      </div>

                      <div className={`p-3 border font-mono ${
                        theme === "dark" ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      }`}>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                          <span>4. QUALIFICATIONS (10%)</span>
                          <strong className="text-emerald-500">{parsedResult.evaluation.scoreBreakdown.qualificationsScore}%</strong>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full"
                            style={{ width: `${Math.min(100, parsedResult.evaluation.scoreBreakdown.qualificationsScore)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 block">Degrees & Certifications</span>
                      </div>
                    </div>

                    {/* Skill Evidence Assessment Matrix */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                          theme === "dark" ? "text-white" : "text-zinc-900"
                        }`}>
                          // Skill Evidence Matrix (Critical vs Gap Classification)
                        </h4>
                        <span className="text-[11px] font-mono text-zinc-500">
                          {parsedResult.evaluation.skillAssessments.length} Required Requisition Skills
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {parsedResult.evaluation.skillAssessments.map((sa) => (
                          <div
                            key={sa.skillName}
                            className={`p-3 border font-mono space-y-2 ${
                              sa.evidenceState === "confirmed_present"
                                ? theme === "dark" ? "bg-zinc-950/80 border-emerald-800/60" : "bg-emerald-50/40 border-emerald-200"
                                : sa.evidenceState === "confirmed_absence"
                                ? theme === "dark" ? "bg-zinc-950/80 border-rose-800/60" : "bg-rose-50/40 border-rose-200"
                                : sa.evidenceState === "missing_evidence"
                                ? theme === "dark" ? "bg-zinc-950/80 border-zinc-700" : "bg-zinc-100 border-zinc-300"
                                : theme === "dark" ? "bg-zinc-950/80 border-amber-800/60" : "bg-amber-50/40 border-amber-200"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={`font-bold text-sm block ${
                                  theme === "dark" ? "text-white" : "text-zinc-900"
                                }`}>
                                  {sa.skillName}
                                </span>
                                <span className="text-[10px] text-zinc-500 uppercase">
                                  Weight: {Math.round(sa.requiredWeight * 100)}% • Required: {sa.requiredYears}y
                                </span>
                              </div>

                              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 font-bold uppercase border shrink-0 ${
                                sa.evidenceState === "confirmed_present"
                                  ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                                  : sa.evidenceState === "confirmed_absence"
                                  ? "bg-rose-950 text-rose-400 border-rose-800"
                                  : sa.evidenceState === "missing_evidence"
                                  ? "bg-zinc-900 text-zinc-400 border-zinc-700"
                                  : "bg-amber-950 text-amber-400 border-amber-800"
                              }`}>
                                {sa.evidenceState === "confirmed_present" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                {sa.evidenceState === "confirmed_absence" && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                                {sa.evidenceState.replace("_", " ")}
                              </span>
                            </div>

                            <p className={`text-[11px] leading-relaxed ${
                              theme === "dark" ? "text-zinc-400" : "text-zinc-600"
                            }`}>
                              {sa.justification}
                            </p>

                            {sa.suggestedProbingQuestion && (
                              <div className={`p-2 border-l-2 text-[10px] space-y-0.5 ${
                                sa.evidenceState === "confirmed_absence"
                                  ? "bg-rose-950/30 border-rose-500 text-rose-300"
                                  : "bg-amber-950/30 border-amber-500 text-amber-300"
                              }`}>
                                <strong className="block uppercase">Probing Question:</strong>
                                <span>{sa.suggestedProbingQuestion}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Candidate Overview Card */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-950 border border-zinc-700 text-emerald-400 flex items-center justify-center font-mono font-bold text-lg">
                        {parsedResult.resume.contactInfo.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white font-mono">
                          {parsedResult.resume.contactInfo.fullName}
                        </h3>
                        <p className="text-xs text-zinc-400 font-mono">
                          {parsedResult.resume.contactInfo.email} • {parsedResult.resume.contactInfo.location}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs px-2.5 py-1 bg-zinc-950 text-zinc-400 border border-zinc-700">
                      CANDIDATE ID: {parsedResult.resume.candidateId}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {parsedResult.resume.summary}
                  </p>
                </div>

                {/* Normalized Skills Grid with Verbatim Excerpt Accordions */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        // Canonically Normalized Skills & Hallucination Verification ({parsedResult.resume.normalizedSkills.length})
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        Every skill is normalized via deterministic dictionary and checked against raw text bytes.
                      </p>
                    </div>
                    <span className="font-mono text-xs text-emerald-400">
                      {parsedResult.resume.normalizedSkills.filter((s) => s.citationIds.length > 0).length} GROUNDED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {parsedResult.resume.normalizedSkills.map((skill) => {
                      const isVerified = skill.citationIds.length > 0;
                      const citation = parsedResult.verification.citations.find((c) =>
                        skill.citationIds.includes(c.id)
                      );
                      const isExpanded = expandedCitationId === skill.skillId;

                      return (
                        <div
                          key={skill.skillId}
                          className={`p-3 border font-mono text-xs transition-colors ${
                            isVerified
                              ? "bg-zinc-950 border-zinc-800 hover:border-emerald-600/60"
                              : "bg-rose-950/20 border-rose-900/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="font-bold text-white text-sm block">
                                {skill.normalizedName}
                              </span>
                              <span className="text-[10px] text-zinc-500 uppercase">
                                {skill.category} • {skill.claimedYears}y claimed
                              </span>
                            </div>

                            {isVerified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold shrink-0">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                VERIFIED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 font-semibold shrink-0">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                FLAGGED
                              </span>
                            )}
                          </div>

                          {/* Accordion Toggle for Grounded Excerpt */}
                          {citation && (
                            <div className="pt-2 border-t border-zinc-800/80">
                              <button
                                onClick={() =>
                                  setExpandedCitationId(isExpanded ? null : skill.skillId)
                                }
                                className="w-full flex items-center justify-between text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors"
                              >
                                <span>Source Excerpt [{citation.id}]</span>
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {isExpanded && (
                                <div className="mt-2 p-2 bg-zinc-900 text-[11px] border border-zinc-800 space-y-1">
                                  <div className="text-zinc-500">
                                    Byte Chars: [{citation.characterStart} - {citation.characterEnd}] // Confidence: {Math.round(citation.confidence * 100)}%
                                  </div>
                                  <blockquote className="italic text-emerald-300 border-l-2 border-emerald-500 pl-2 my-1">
                                    "{citation.excerptText}"
                                  </blockquote>
                                  <div className="text-zinc-500 text-[10px]">
                                    Context: {citation.contextSnippet}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Relevant Work Experience with Calculated Duration & Verbatim Excerpts */}
                {parsedResult.resume.workExperience && parsedResult.resume.workExperience.length > 0 && (
                  <div className={`p-6 border space-y-4 transition-colors ${
                    theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                  }`}>
                    <div className={`flex items-center justify-between pb-3 border-b ${
                      theme === "dark" ? "border-zinc-800" : "border-zinc-200"
                    }`}>
                      <div>
                        <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                          theme === "dark" ? "text-white" : "text-zinc-900"
                        }`}>
                          // Relevant Work Experience & Calculated Duration ({parsedResult.resume.workExperience.length})
                        </h4>
                        <p className={`text-[11px] font-mono ${
                          theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                        }`}>
                          Each position includes calculated duration, technologies used, and grounded verbatim citation checks.
                        </p>
                      </div>
                      <span className="font-mono text-xs text-emerald-500 font-semibold">
                        {parsedResult.resume.workExperience.filter((w) => w.citationIds.length > 0).length} VERIFIED POSITIONS
                      </span>
                    </div>

                    <div className="space-y-4">
                      {parsedResult.resume.workExperience.map((exp, idx) => {
                        const isVerified = exp.citationIds.length > 0;
                        const citation = parsedResult.verification.citations.find((c) =>
                          exp.citationIds.includes(c.id)
                        );
                        const isExpanded = expandedCitationId === exp.id;
                        const durationFormatted = formatExperienceDuration(
                          exp.startDate,
                          exp.endDate,
                          exp.isCurrent
                        );

                        return (
                          <div
                            key={exp.id || idx}
                            className={`p-4 border font-mono text-xs transition-colors ${
                              theme === "dark"
                                ? isVerified
                                  ? "bg-zinc-950 border-zinc-800 hover:border-emerald-600/60"
                                  : "bg-rose-950/20 border-rose-900/60"
                                : isVerified
                                ? "bg-zinc-50 border-zinc-200 hover:border-emerald-500"
                                : "bg-rose-50 border-rose-300"
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                              <div>
                                <span className={`font-bold text-sm block ${
                                  theme === "dark" ? "text-white" : "text-zinc-900"
                                }`}>
                                  {exp.title}
                                </span>
                                <div className={`text-xs font-medium flex items-center gap-2 mt-0.5 ${
                                  theme === "dark" ? "text-emerald-400" : "text-emerald-700"
                                }`}>
                                  <span>{exp.company}</span>
                                  {exp.location && <span>• {exp.location}</span>}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-[11px] px-2 py-0.5 font-semibold border ${
                                  theme === "dark"
                                    ? "bg-zinc-900 text-zinc-300 border-zinc-700"
                                    : "bg-zinc-200 text-zinc-800 border-zinc-300"
                                }`}>
                                  {durationFormatted}
                                </span>

                                {isVerified ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold shrink-0">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    SOURCE VERIFIED
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 font-semibold shrink-0">
                                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                                    FLAGGED
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Bullet Points */}
                            {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                              <ul className={`my-2 space-y-1 text-[11px] pl-3 border-l-2 ${
                                theme === "dark" ? "border-zinc-800 text-zinc-300" : "border-zinc-200 text-zinc-700"
                              }`}>
                                {exp.bulletPoints.map((bp, bIdx) => (
                                  <li key={bIdx}>• {bp}</li>
                                ))}
                              </ul>
                            )}

                            {/* Technologies Used */}
                            {exp.technologiesUsed && exp.technologiesUsed.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {exp.technologiesUsed.map((tech, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className={`text-[10px] px-1.5 py-0.5 border ${
                                      theme === "dark"
                                        ? "bg-zinc-900 text-zinc-400 border-zinc-800"
                                        : "bg-white text-zinc-600 border-zinc-200"
                                    }`}
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Excerpt Citation Accordion */}
                            {citation && (
                              <div className={`mt-3 pt-2 border-t ${
                                theme === "dark" ? "border-zinc-800" : "border-zinc-200"
                              }`}>
                                <button
                                  onClick={() =>
                                    setExpandedCitationId(isExpanded ? null : exp.id)
                                  }
                                  className="w-full flex items-center justify-between text-[11px] text-zinc-400 hover:text-emerald-500 transition-colors"
                                >
                                  <span>Source Excerpt Verification [{citation.id}]</span>
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {isExpanded && (
                                  <div className={`mt-2 p-2.5 text-[11px] border space-y-1 ${
                                    theme === "dark"
                                      ? "bg-zinc-900 border-zinc-800 text-zinc-300"
                                      : "bg-zinc-100 border-zinc-200 text-zinc-800"
                                  }`}>
                                    <div className="text-zinc-500">
                                      Byte Range: [{citation.characterStart} - {citation.characterEnd}] // Verifier Confidence: {Math.round(citation.confidence * 100)}%
                                    </div>
                                    <blockquote className="italic text-emerald-400 border-l-2 border-emerald-500 pl-2 my-1">
                                      "{citation.excerptText}"
                                    </blockquote>
                                    <div className="text-zinc-500 text-[10px]">
                                      Context: {citation.contextSnippet}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Key Technical Projects & Excerpt Citations */}
                {parsedResult.resume.projects && parsedResult.resume.projects.length > 0 && (
                  <div className={`p-6 border space-y-4 transition-colors ${
                    theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                  }`}>
                    <div className={`flex items-center justify-between pb-3 border-b ${
                      theme === "dark" ? "border-zinc-800" : "border-zinc-200"
                    }`}>
                      <div>
                        <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                          theme === "dark" ? "text-white" : "text-zinc-900"
                        }`}>
                          // Technical Projects & Verifiable Outcomes ({parsedResult.resume.projects.length})
                        </h4>
                        <p className={`text-[11px] font-mono ${
                          theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                        }`}>
                          Extracted systems projects with architecture summaries, outcomes, and raw source verifications.
                        </p>
                      </div>
                      <span className="font-mono text-xs text-emerald-500 font-semibold">
                        {parsedResult.resume.projects.filter((p) => p.citationIds.length > 0).length} VERIFIED PROJECTS
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parsedResult.resume.projects.map((proj, pIdx) => {
                        const isVerified = proj.citationIds.length > 0;
                        const citation = parsedResult.verification.citations.find((c) =>
                          proj.citationIds.includes(c.id)
                        );
                        const isExpanded = expandedCitationId === proj.id;

                        return (
                          <div
                            key={proj.id || pIdx}
                            className={`p-4 border font-mono text-xs transition-colors ${
                              theme === "dark"
                                ? isVerified
                                  ? "bg-zinc-950 border-zinc-800 hover:border-emerald-600/60"
                                  : "bg-rose-950/20 border-rose-900/60"
                                : isVerified
                                ? "bg-zinc-50 border-zinc-200 hover:border-emerald-500"
                                : "bg-rose-50 border-rose-300"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <span className={`font-bold text-sm block ${
                                  theme === "dark" ? "text-white" : "text-zinc-900"
                                }`}>
                                  {proj.title}
                                </span>
                                {proj.role && (
                                  <span className={`text-[10px] uppercase font-semibold ${
                                    theme === "dark" ? "text-emerald-400" : "text-emerald-700"
                                  }`}>
                                    Role: {proj.role}
                                  </span>
                                )}
                              </div>

                              {isVerified ? (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold shrink-0">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  VERIFIED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 font-semibold shrink-0">
                                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                                  FLAGGED
                                </span>
                              )}
                            </div>

                            <p className={`text-[11px] my-2 leading-relaxed ${
                              theme === "dark" ? "text-zinc-300" : "text-zinc-700"
                            }`}>
                              {proj.summary}
                            </p>

                            {/* Outcomes */}
                            {proj.outcomes && proj.outcomes.length > 0 && (
                              <div className="space-y-1 my-2">
                                {proj.outcomes.map((out, oIdx) => (
                                  <div key={oIdx} className="text-[10px] text-emerald-500 flex items-start gap-1.5">
                                    <span>✓</span>
                                    <span>{out}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Technologies */}
                            {proj.technologies && proj.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {proj.technologies.map((t, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className={`text-[10px] px-1.5 py-0.5 border ${
                                      theme === "dark"
                                        ? "bg-zinc-900 text-zinc-400 border-zinc-800"
                                        : "bg-white text-zinc-600 border-zinc-200"
                                    }`}
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Excerpt Citation */}
                            {citation && (
                              <div className={`mt-3 pt-2 border-t ${
                                theme === "dark" ? "border-zinc-800" : "border-zinc-200"
                              }`}>
                                <button
                                  onClick={() =>
                                    setExpandedCitationId(isExpanded ? null : proj.id)
                                  }
                                  className="w-full flex items-center justify-between text-[11px] text-zinc-400 hover:text-emerald-500 transition-colors"
                                >
                                  <span>Project Excerpt [{citation.id}]</span>
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {isExpanded && (
                                  <div className={`mt-2 p-2 text-[11px] border space-y-1 ${
                                    theme === "dark"
                                      ? "bg-zinc-900 border-zinc-800 text-zinc-300"
                                      : "bg-zinc-100 border-zinc-200 text-zinc-800"
                                  }`}>
                                    <blockquote className="italic text-emerald-400 border-l-2 border-emerald-500 pl-2 my-1">
                                      "{citation.excerptText}"
                                    </blockquote>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Education & Certifications Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Education */}
                  {parsedResult.resume.education && parsedResult.resume.education.length > 0 && (
                    <div className={`p-6 border space-y-4 transition-colors ${
                      theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                    }`}>
                      <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                        theme === "dark" ? "text-white" : "text-zinc-900"
                      }`}>
                        // Documented Education ({parsedResult.resume.education.length})
                      </h4>
                      <div className="space-y-3">
                        {parsedResult.resume.education.map((edu, edIdx) => (
                          <div
                            key={edu.id || edIdx}
                            className={`p-3 border font-mono text-xs ${
                              theme === "dark" ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className={`font-bold block ${
                                  theme === "dark" ? "text-white" : "text-zinc-900"
                                }`}>
                                  {edu.degree}
                                </span>
                                <div className={`text-[11px] ${
                                  theme === "dark" ? "text-emerald-400" : "text-emerald-700"
                                }`}>
                                  {edu.institution}
                                </div>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 border ${
                                theme === "dark"
                                  ? "bg-zinc-900 text-zinc-400 border-zinc-800"
                                  : "bg-white text-zinc-600 border-zinc-300"
                              }`}>
                                Grad: {edu.graduationDate}
                              </span>
                            </div>
                            {edu.gradeOrGpa && (
                              <div className="mt-1 text-[11px] text-zinc-500">
                                Grade/GPA: {edu.gradeOrGpa}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {parsedResult.resume.certifications && parsedResult.resume.certifications.length > 0 && (
                    <div className={`p-6 border space-y-4 transition-colors ${
                      theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                    }`}>
                      <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                        theme === "dark" ? "text-white" : "text-zinc-900"
                      }`}>
                        // Professional Certifications ({parsedResult.resume.certifications.length})
                      </h4>
                      <div className="space-y-3">
                        {parsedResult.resume.certifications.map((cert, cIdx) => (
                          <div
                            key={cert.id || cIdx}
                            className={`p-3 border font-mono text-xs ${
                              theme === "dark" ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className={`font-bold block ${
                                  theme === "dark" ? "text-white" : "text-zinc-900"
                                }`}>
                                  {cert.title}
                                </span>
                                <div className={`text-[11px] ${
                                  theme === "dark" ? "text-emerald-400" : "text-emerald-700"
                                }`}>
                                  {cert.issuingOrganization}
                                </div>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 border ${
                                theme === "dark"
                                  ? "bg-zinc-900 text-zinc-400 border-zinc-800"
                                  : "bg-white text-zinc-600 border-zinc-300"
                              }`}>
                                Issued: {cert.issueDate}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Candidate Profile Correction Panel (PUT /api/parse-resume) */}
                <div className={`p-6 border space-y-4 transition-colors ${
                  theme === "dark" ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                }`}>
                  <div className={`flex flex-wrap items-center justify-between gap-2 pb-3 border-b ${
                    theme === "dark" ? "border-zinc-800" : "border-zinc-200"
                  }`}>
                    <div>
                      <h5 className={`font-mono text-xs font-bold uppercase tracking-wider ${
                        theme === "dark" ? "text-white" : "text-zinc-900"
                      }`}>
                        // Candidate Interactive Correction Panel (PUT /api/parse-resume)
                      </h5>
                      <p className={`text-[11px] font-mono ${
                        theme === "dark" ? "text-zinc-400" : "text-zinc-500"
                      }`}>
                        Requirement 3.3: Edit, add, or correct any candidate field and re-verify claims before saving to store.
                      </p>
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold uppercase">
                      PUT /api/parse-resume
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                        Full Name:
                      </label>
                      <input
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        placeholder="Candidate Name"
                        className={`w-full border px-3 py-1.5 font-mono text-xs focus:border-emerald-500 focus:outline-none ${
                          theme === "dark" ? "bg-zinc-950 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-300 text-zinc-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                        Email:
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="email@example.com"
                        className={`w-full border px-3 py-1.5 font-mono text-xs focus:border-emerald-500 focus:outline-none ${
                          theme === "dark" ? "bg-zinc-950 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-300 text-zinc-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                        Location:
                      </label>
                      <input
                        type="text"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="City, State"
                        className={`w-full border px-3 py-1.5 font-mono text-xs focus:border-emerald-500 focus:outline-none ${
                          theme === "dark" ? "bg-zinc-950 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-300 text-zinc-900"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Add Skill Row */}
                  <div className={`p-4 border space-y-2 ${
                    theme === "dark" ? "bg-zinc-950/70 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}>
                    <span className="text-[11px] font-mono text-zinc-400 uppercase block">
                      Add / Correct Skill with Live Canonical Normalization:
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        placeholder="e.g. JS, Postgres, K8s, Py..."
                        className={`border px-3 py-1.5 font-mono text-xs focus:border-emerald-500 focus:outline-none ${
                          theme === "dark" ? "bg-zinc-900 border-zinc-700 text-white" : "bg-white border-zinc-300 text-zinc-900"
                        }`}
                      />
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={newSkillYears}
                        onChange={(e) => setNewSkillYears(Number(e.target.value))}
                        className={`border px-3 py-1.5 font-mono text-xs w-20 focus:border-emerald-500 focus:outline-none ${
                          theme === "dark" ? "bg-zinc-900 border-zinc-700 text-white" : "bg-white border-zinc-300 text-zinc-900"
                        }`}
                      />
                      <span className="text-xs font-mono text-zinc-500">years</span>

                      {newSkillName.trim() && (
                        <span className="text-[11px] font-mono text-emerald-400">
                          → Normalizes to: <strong>"{normalizeSkillName(newSkillName).canonicalName}"</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Existing Skills Quick Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                      Current Skills (Click × to remove):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {parsedResult.resume.normalizedSkills.map((s) => (
                        <span
                          key={s.skillId}
                          className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 border ${
                            theme === "dark"
                              ? "bg-zinc-950 text-zinc-300 border-zinc-800"
                              : "bg-white text-zinc-800 border-zinc-300"
                          }`}
                        >
                          <span>{s.normalizedName} ({s.claimedYears}y)</span>
                          <button
                            onClick={() => handleRemoveSkill(s.skillId)}
                            className="text-zinc-500 hover:text-rose-400 font-bold ml-1"
                            title="Remove Skill"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      disabled={isUpdatingSkill}
                      onClick={handleSaveCandidateEdits}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {isUpdatingSkill ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Re-Verifying & Saving to Platform Store...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>SAVE & RE-VERIFY CANDIDATE PROFILE (PUT)</span>
                        </>
                      )}
                    </button>

                    {updateMessage && (
                      <span className="text-[11px] font-mono text-emerald-400 font-medium">
                        ✓ {updateMessage}
                      </span>
                    )}
                  </div>
                </div>

                {/* Raw JSON Accordion with Copy */}
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-zinc-400 uppercase">
                      // Raw Resume Payload JSON (API Output)
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(JSON.stringify(parsedResult, null, 2), "resume")
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
                    >
                      {copiedResumeJson ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>COPY JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 max-h-72 overflow-y-auto leading-relaxed">
                    {JSON.stringify(parsedResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: JOB REQUIREMENT EXTRACTOR */}
        {/* ========================================================================= */}
        {activeTab === "job" && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider">
                    // AI Job Requirement Extractor (Requirement 3.2)
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Extracts required/preferred skills, weights strictly summing to 1.0 (100%), experience level, and canonical tech aliases.
                  </p>
                </div>

                {/* Sample Presets */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setJobDescription(SAMPLE_JOB_DESCRIPTION)}
                    className="px-2.5 py-1 text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                  >
                    Load Principal Cloud Architect Job
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-zinc-400 uppercase">
                    Free-Text Job Description:
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {jobDescription.length} characters
                  </span>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={10}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 font-mono text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
                  placeholder="Paste free-text job description..."
                />
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={isExtractingJob}
                  onClick={handleExtractJob}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isExtractingJob ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extracting with Gemini 2.5 Flash...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>EXTRACT JOB REQUIREMENTS WITH AI</span>
                    </>
                  )}
                </button>

                <div className="text-[11px] font-mono text-zinc-500">
                  Target Route: <strong className="text-zinc-300">POST /api/extract-job</strong>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {jobError && (
              <div className="bg-rose-950/50 border border-rose-700 p-4 text-xs font-mono space-y-1">
                <div className="flex items-center gap-2 text-rose-400 font-bold uppercase">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Extraction Error [{jobError.code}] // HTTP {jobError.status}</span>
                </div>
                <p className="text-rose-200">{jobError.message}</p>
              </div>
            )}

            {/* Job Results */}
            {jobResult && (
              <div className="space-y-6">
                {/* Meta stats */}
                <div className="bg-zinc-900 border border-zinc-800 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Model</span>
                    <strong className="text-emerald-400">{jobResult.extractionModel}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Experience Level</span>
                    <strong className="text-white uppercase">{jobResult.vacancy.experienceLevel} ({jobResult.vacancy.skillWeights[0]?.minimumYearsRequired || 5}+ yrs)</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Workplace Type</span>
                    <strong className="text-emerald-400 uppercase">{jobResult.vacancy.workplaceType}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Total Skills Weight</span>
                    <strong className="text-white">
                      {(
                        jobResult.requiredSkills.reduce((acc, curr) => acc + curr.weight, 0) * 100
                      ).toFixed(0)}% (Strict 1.00 Distribution)
                    </strong>
                  </div>
                </div>

                {/* Role Header */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white font-mono">
                        {jobResult.vacancy.title}
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono">
                        {jobResult.vacancy.department} • {jobResult.vacancy.location} • {jobResult.vacancy.employmentType.replace("_", " ")}
                      </p>
                    </div>
                    <span className="font-mono text-xs px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold uppercase">
                      ID: {jobResult.vacancy.id}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {jobResult.vacancy.summary}
                  </p>
                </div>

                {/* Weighted Skill Requirements (Summing to 100%) */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      // Required Skills & Strict 100% Importance Weight Distribution
                    </h4>
                    <span className="font-mono text-xs text-emerald-400">
                      {jobResult.requiredSkills.length} REQUIRED • {jobResult.preferredSkills.length} PREFERRED
                    </span>
                  </div>

                  <div className="space-y-3">
                    {jobResult.requiredSkills.map((skill) => (
                      <div
                        key={skill.skillId}
                        className="p-3 bg-zinc-950 border border-zinc-800 font-mono text-xs space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{skill.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 uppercase">
                              {skill.category}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase font-semibold">
                              {skill.importance}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-zinc-400 text-xs">Weight: </span>
                            <strong className="text-emerald-400 text-sm">
                              {Math.round(skill.weight * 100)}%
                            </strong>
                            <span className="text-zinc-500 text-[11px] ml-2">
                              ({skill.minimumYearsRequired}y min)
                            </span>
                          </div>
                        </div>

                        {/* Visual Weight Bar */}
                        <div className="w-full bg-zinc-900 h-2">
                          <div
                            className="bg-emerald-500 h-full transition-all"
                            style={{ width: `${skill.weight * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Preferred Skills */}
                  {jobResult.preferredSkills.length > 0 && (
                    <div className="pt-4 border-t border-zinc-800">
                      <span className="text-xs font-mono text-zinc-400 block mb-2 uppercase">
                        Preferred Competencies (Nice to Have):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {jobResult.preferredSkills.map((pref) => (
                          <span
                            key={pref.skillId}
                            className="px-2.5 py-1 bg-zinc-950 text-zinc-300 border border-zinc-800 font-mono text-xs"
                          >
                            + {pref.name} ({pref.minimumYearsRequired}y)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Responsibilities & Qualifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-3 font-mono text-xs">
                    <h5 className="font-bold text-white uppercase">// Key Responsibilities</h5>
                    <ul className="space-y-1.5 text-zinc-300">
                      {jobResult.vacancy.responsibilities.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">›</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-3 font-mono text-xs">
                    <h5 className="font-bold text-white uppercase">// Extracted Qualifications</h5>
                    <ul className="space-y-1.5 text-zinc-300">
                      {jobResult.vacancy.qualifications.map((q, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Raw JSON Accordion */}
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-zinc-400 uppercase">
                      // Raw Extracted Job JSON Payload
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(JSON.stringify(jobResult, null, 2), "job")
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
                    >
                      {copiedJobJson ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>COPY JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 max-h-72 overflow-y-auto leading-relaxed">
                    {JSON.stringify(jobResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CANONICAL NORMALIZER PLAYGROUND */}
        {/* ========================================================================= */}
        {activeTab === "normalizer" && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-5">
              <div>
                <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider">
                  // Deterministic Canonical Skill Normalizer Playground
                </h2>
                <p className="text-xs text-zinc-400">
                  Tests the 100+ standard alias dictionary with deterministic token boundary regex and category inference.
                </p>
              </div>

              <div className="max-w-md space-y-2">
                <label className="text-xs font-mono text-zinc-400 uppercase block">
                  Input Skill Name or Alias:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={testSkillInput}
                    onChange={(e) => setTestSkillInput(e.target.value)}
                    placeholder="Type: JS, Postgres, K8s, Py..."
                    className="flex-1 bg-zinc-950 border border-zinc-700 px-3 py-2 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Evaluation Box */}
              {(() => {
                const norm = normalizeSkillName(testSkillInput);
                return (
                  <div className="p-4 bg-zinc-950 border border-zinc-800 font-mono text-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <span className="text-zinc-500">Live Normalizer Resolution:</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 uppercase font-bold ${
                          norm.isAliasMatched
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-700"
                            : "bg-zinc-900 text-zinc-400 border border-zinc-700"
                        }`}
                      >
                        {norm.isAliasMatched ? "Alias Match" : "Standard Name"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Raw Input</span>
                        <strong className="text-white">"{norm.rawName}"</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Canonical Name</span>
                        <strong className="text-emerald-400">"{norm.canonicalName}"</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Category</span>
                        <strong className="text-white uppercase">{norm.category}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Generated ID</span>
                        <code className="text-zinc-400 text-[11px]">{norm.skillId}</code>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Common Alias Matrix */}
              <div className="pt-4 border-t border-zinc-800">
                <span className="text-xs font-mono text-zinc-400 block mb-3 uppercase">
                  Click to Test Standard Tech Aliases:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "JS",
                    "Postgres",
                    "Py",
                    "k8s",
                    "Docker",
                    "TS",
                    "AWS",
                    "GCP",
                    "Golang",
                    "React.js",
                    "Nextjs",
                    "Kafka",
                    "Redis",
                    "CI/CD",
                  ].map((alias) => (
                    <button
                      key={alias}
                      onClick={() => setTestSkillInput(alias)}
                      className="px-2.5 py-1 text-xs font-mono bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
                    >
                      {alias}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
