"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { RadarScorecardChart } from "@/components/RadarScorecardChart";
import { SwissHeader } from "@/components/SwissHeader";
import {
  Job,
  CandidateProfile,
  Application,
  MatchEvaluation,
  PipelineStage,
  InterviewQuestion,
} from "@/types";

export default function RecruiterCommandCenter() {
  const router = useRouter();

  // Core Data State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [applications, setApplications] = useState<
    (Application & { candidate?: CandidateProfile; evaluation?: MatchEvaluation })[]
  >([]);
  const [loading, setLoading] = useState(true);

  // UI Modes & Filters
  const [blindMode, setBlindMode] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState<string>("ALL");

  // AI Extraction Modal State
  const [isExtractorOpen, setIsExtractorOpen] = useState(false);
  const [jobDescriptionInput, setJobDescriptionInput] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState<any | null>(null);

  // Recruiter Note Input State
  const [newNoteText, setNewNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Manual Score Override State
  const [overrideScoreInput, setOverrideScoreInput] = useState<number | "">("");
  const [overrideReasonInput, setOverrideReasonInput] = useState("");
  const [isOverriding, setIsOverriding] = useState(false);

  // Reset State
  const [isResetting, setIsResetting] = useState(false);

  // Session check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("talentiq_role");
      if (role && role !== "recruiter" && role !== "RECRUITER") {
        // Optional notice: user can switch or view recruiter
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch jobs
      const jobsRes = await fetch("/api/jobs");
      const jobsData = await jobsRes.json();
      if (jobsData.success && jobsData.jobs.length > 0) {
        setJobs(jobsData.jobs);
        const activeId = jobsData.jobs[0].id;
        setSelectedJobId(activeId);

        // 2. Fetch applications for first job
        await fetchApplications(activeId);
      }
    } catch (e) {
      console.error("Failed loading recruiter data:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId: string) => {
    try {
      const appsRes = await fetch(`/api/applications?jobId=${jobId}`);
      const appsData = await appsRes.json();
      if (appsData.success) {
        setApplications(appsData.applications);
        if (appsData.applications.length > 0) {
          setSelectedAppId(appsData.applications[0].id);
        }
      }
    } catch (e) {
      console.error("Failed loading applications:", e);
    }
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    fetchApplications(jobId);
  };

  // 1-Click State Progression
  const handleStageTransition = async (applicationId: string, toStage: PipelineStage) => {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_stage",
          applicationId,
          toStage,
          actionBy: "Sarah Chen",
          role: "RECRUITER",
          note: `Recruiter transitioned application to ${toStage}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId
              ? {
                  ...app,
                  status: toStage,
                  auditTrail: data.application.auditTrail,
                }
              : app
          )
        );
      }
    } catch (e) {
      console.error("Stage transition failed:", e);
    }
  };

  // Add Recruiter Note
  const handleAddNote = async (applicationId: string) => {
    if (!newNoteText.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_note",
          applicationId,
          authorId: "usr_recruiter_1",
          authorName: "Sarah Chen",
          content: newNoteText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId
              ? {
                  ...app,
                  notes: data.application.notes,
                }
              : app
          )
        );
        setNewNoteText("");
      }
    } catch (e) {
      console.error("Failed adding note:", e);
    } finally {
      setIsAddingNote(false);
    }
  };

  // Manual Score Override
  const handleScoreOverride = async (applicationId: string) => {
    if (typeof overrideScoreInput !== "number" || !overrideReasonInput.trim()) return;
    setIsOverriding(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "override_score",
          applicationId,
          newScore: overrideScoreInput,
          reason: overrideReasonInput,
          overriddenBy: "Sarah Chen (Lead Recruiter)",
        }),
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId
              ? {
                  ...app,
                  evaluation: data.evaluation,
                }
              : app
          )
        );
        setOverrideScoreInput("");
        setOverrideReasonInput("");
      }
    } catch (e) {
      console.error("Score override failed:", e);
    } finally {
      setIsOverriding(false);
    }
  };

  // AI Requirement Extractor (Section 3.2)
  const handleRunAiExtractor = async () => {
    if (!jobDescriptionInput.trim()) return;
    setIsExtracting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "extract",
          description: jobDescriptionInput,
        }),
      });
      const data = await res.json();
      if (data.success && data.extracted) {
        setExtractedPreview(data.extracted);
      }
    } catch (e) {
      console.error("Extraction error:", e);
    } finally {
      setIsExtracting(false);
    }
  };

  // Judge 1-Click Reset
  const handleJudgeReset = async () => {
    setIsResetting(true);
    try {
      await fetch("/api/reset", { method: "POST" });
      await fetchData();
    } catch (e) {
      console.error("Reset failed:", e);
    } finally {
      setIsResetting(false);
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  const selectedApp = applications.find((a) => a.id === selectedAppId) || applications[0];
  const activeEval = selectedApp?.evaluation;
  const activeCand = selectedApp?.candidate;

  // Filtered & Ranked Leaderboard (Section 3.4)
  const rankedApplications = [...applications]
    .filter((app) => {
      if (pipelineFilter !== "ALL" && app.status !== pipelineFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const candName = app.candidate?.fullName.toLowerCase() || "";
      const skills = app.candidate?.skills.map((s) => s.normalizedName.toLowerCase()).join(" ") || "";
      return candName.includes(q) || skills.includes(q);
    })
    .sort((a, b) => (b.evaluation?.overallScore || 0) - (a.evaluation?.overallScore || 0));

  // Blind screening helper
  const anonymizeCandidateName = (fullName: string, index: number) => {
    if (!blindMode) return fullName;
    const hash = fullName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `Candidate #CAN-${(hash % 900 + 100).toString(16).toUpperCase()}`;
  };

  const anonymizeSchool = (school: string) => {
    if (!blindMode) return school;
    return "Accredited University // Institutional Degree";
  };

  const anonymizeCompany = (company: string) => {
    if (!blindMode) return company;
    return "Enterprise Tech Firm // Verified Employer";
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20 transition-colors duration-150">
      {/* Global Swiss Navigation Header */}
      <SwissHeader
        currentRole="recruiter"
        onRoleChange={(newRole) => {
          if (newRole === "candidate") {
            router.push("/candidate");
          }
        }}
        onResetData={handleJudgeReset}
        isResetting={isResetting}
        dbType="local_json"
        blindMode={blindMode}
        onToggleBlindMode={() => setBlindMode(!blindMode)}
      />

      {/* Vacancy Selector Strip */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 sm:px-6 py-2 overflow-x-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Active Vacancies:
          </span>
          <div className="flex items-center gap-2">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => handleSelectJob(job.id)}
                className={`px-3 py-1 rounded-sm text-xs font-medium transition-all flex items-center gap-2 shrink-0 ${
                  selectedJobId === job.id
                    ? "bg-zinc-900 dark:bg-zinc-800 text-white dark:text-emerald-400 border border-zinc-900 dark:border-emerald-500/50 shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <span>{job.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                  {job.applicantCount || applications.length} applicants
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/recruiter/jobs"
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 rounded-sm text-xs font-mono transition-colors shrink-0"
          >
            <Briefcase className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Manage Vacancies</span>
          </Link>
          {/* AI Requirement Extractor Trigger */}
          <button
            onClick={() => setIsExtractorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-white dark:text-emerald-300 border border-emerald-600 dark:border-emerald-700 rounded-sm text-xs font-mono transition-colors shrink-0 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200 dark:text-emerald-400" />
            <span>AI Job Extractor</span>
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <main className="max-w-7xl w-full mx-auto px-6 py-6 flex-1 flex flex-col gap-6">
        {/* Vacancy Overview Hero Card (Section 3.2) */}
        {selectedJob && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-zinc-100">{selectedJob.title}</h2>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {selectedJob.status}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {selectedJob.department} // {selectedJob.location}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-1 max-w-3xl line-clamp-2">
                  {selectedJob.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 text-right">
                  <div className="text-[10px] font-mono uppercase text-zinc-500">Salary Band</div>
                  <div className="text-xs font-mono font-semibold text-emerald-400">
                    {selectedJob.salaryRange}
                  </div>
                </div>
                <div className="bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 text-right">
                  <div className="text-[10px] font-mono uppercase text-zinc-500">Min Experience</div>
                  <div className="text-xs font-mono font-semibold text-zinc-200">
                    {selectedJob.minExperienceYears}+ Years
                  </div>
                </div>
              </div>
            </div>

            {/* Extracted Skill Requirements Tags */}
            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-400 mr-1">Required Skills:</span>
              {selectedJob.requiredSkills.map((req, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-200 font-mono"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <strong>{req.name}</strong>
                  <span className="text-zinc-500 text-[10px]">({req.minYearsRequired}y min • imp {req.importance}/5)</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard & Match Scorecard View (Section 3.4 & 3.5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Ranked Leaderboard (Section 3.4) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Filter & Search Bar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter candidate by skill, name or role..."
                  className="bg-transparent text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none w-full"
                />
              </div>

              {/* Stage Filter Pills */}
              <div className="flex items-center gap-1 text-[11px] font-mono">
                {["ALL", "SHORTLISTED", "RECRUITER_REVIEW", "INTERVIEW"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setPipelineFilter(st)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      pipelineFilter === st
                        ? "bg-emerald-600 text-white font-bold"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Cards List */}
            <div className="space-y-3">
              {rankedApplications.map((app, index) => {
                const evalItem = app.evaluation;
                const cand = app.candidate;
                const isSelected = selectedAppId === app.id;
                const displayName = cand ? anonymizeCandidateName(cand.fullName, index) : "Candidate";

                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedAppId(app.id);
                      setIsScorecardOpen(true);
                    }}
                    className={`bg-zinc-900 border rounded-xl p-4 transition-all cursor-pointer relative group ${
                      isSelected
                        ? "border-emerald-500/80 shadow-lg shadow-emerald-950/40 bg-zinc-900/90"
                        : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850"
                    }`}
                  >
                    {/* Rank Badge & Overall Score */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs text-zinc-300">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-emerald-400 transition-colors">
                              {displayName}
                            </h3>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.2 rounded font-medium border ${
                                app.status === "SHORTLISTED"
                                  ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                                  : app.status === "INTERVIEW"
                                  ? "bg-purple-950 text-purple-400 border-purple-800"
                                  : "bg-zinc-800 text-zinc-300 border-zinc-700"
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                            {cand?.summary}
                          </p>
                        </div>
                      </div>

                      {/* 50/25/15/10 Composite Score Pill */}
                      <div className="text-right shrink-0">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-2xl font-mono font-bold text-emerald-400">
                            {evalItem?.overallScore || 85}%
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">FIT</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">
                          50/25/15/10 Weighted
                        </span>
                      </div>
                    </div>

                    {/* Explainable 4-Bar Breakdown (Section 3.4) */}
                    {evalItem && (
                      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-zinc-800/80 text-[11px] font-mono">
                        <div>
                          <div className="text-zinc-500 flex justify-between">
                            <span>SKILLS (50%)</span>
                            <span className="text-emerald-400 font-semibold">{evalItem.skillsScore}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${evalItem.skillsScore}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500 flex justify-between">
                            <span>EXP (25%)</span>
                            <span className="text-blue-400 font-semibold">{evalItem.experienceScore}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${evalItem.experienceScore}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500 flex justify-between">
                            <span>PROJ (15%)</span>
                            <span className="text-purple-400 font-semibold">{evalItem.projectsScore}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${evalItem.projectsScore}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500 flex justify-between">
                            <span>QUAL (10%)</span>
                            <span className="text-amber-400 font-semibold">{evalItem.qualificationsScore}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${evalItem.qualificationsScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Matched & Missing Skills Snippets */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 text-[11px]">
                      {evalItem?.matchedSkills.slice(0, 4).map((m, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-mono text-[10px]"
                        >
                          ✓ {m}
                        </span>
                      ))}

                      {evalItem?.missingSkills.map((m, i) => (
                        <span
                          key={i}
                          className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                            m.status === "CONFIRMED_ABSENT"
                              ? "bg-red-950/60 text-red-300 border-red-800/60"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {m.status === "CONFIRMED_ABSENT" ? "✗ Absent: " : "○ Unverified: "}
                          {m.skillName}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deep Scorecard & Pipeline Stage Progression (Sections 3.5 & 3.6) */}
          <div className="lg:col-span-5 flex flex-col gap-5 sticky top-24">
            {selectedApp && activeEval && activeCand ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-5">
                {/* Scorecard Header */}
                <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      DEEP SCORECARD DRAWER // SECTION 3.5
                    </span>
                    <h3 className="font-bold text-base text-zinc-100 mt-0.5">
                      {anonymizeCandidateName(activeCand.fullName, 0)}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {blindMode ? "Sanitized Location" : activeCand.location}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-emerald-400">
                      {activeEval.overallScore}%
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Weighted Fit Score
                    </span>
                  </div>
                </div>

                {/* Apache ECharts Radar Chart */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold text-zinc-300 flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-emerald-400" />
                      Multi-Dimensional Radar Alignment
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">APACHE ECHARTS</span>
                  </div>
                  <RadarScorecardChart
                    candidateName={anonymizeCandidateName(activeCand.fullName, 0)}
                    scores={{
                      skills: activeEval.skillsScore,
                      experience: activeEval.experienceScore,
                      projects: activeEval.projectsScore,
                      qualifications: activeEval.qualificationsScore,
                    }}
                  />
                </div>

                {/* Grounded Resume Citations (Section 3.5 Anti-Hallucination) */}
                <div>
                  <span className="text-xs font-mono font-semibold text-zinc-300 flex items-center gap-1.5 mb-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Verified Resume Citations (Grounded Excerpts)
                  </span>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {activeEval.citations && activeEval.citations.length > 0 ? (
                      activeEval.citations.map((cite, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs"
                        >
                          <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 mb-1">
                            <span className="text-emerald-400 font-semibold">{cite.skillOrClaim}</span>
                            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {cite.sourceSection}
                            </span>
                          </div>
                          <p className="text-zinc-300 italic text-[11px] border-l-2 border-emerald-500 pl-2">
                            "{cite.excerptText}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No citations extracted.</p>
                    )}
                  </div>
                </div>

                {/* Missing Evidence vs Confirmed Absence Distinction */}
                {activeEval.missingSkills && activeEval.missingSkills.length > 0 && (
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                    <span className="text-xs font-mono font-semibold text-zinc-300 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Gaps: Missing Evidence vs Confirmed Absence
                    </span>

                    <div className="space-y-2">
                      {activeEval.missingSkills.map((gap, gIdx) => (
                        <div
                          key={gIdx}
                          className={`p-2 rounded text-xs border ${
                            gap.status === "CONFIRMED_ABSENT"
                              ? "bg-red-950/40 border-red-800/60 text-red-200"
                              : "bg-zinc-900 border-zinc-700 text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center justify-between font-mono text-[10px] mb-0.5">
                            <strong className="text-zinc-100">{gap.skillName}</strong>
                            <span
                              className={`px-1.5 py-0.2 rounded font-bold ${
                                gap.status === "CONFIRMED_ABSENT"
                                  ? "bg-red-900 text-red-200"
                                  : "bg-zinc-800 text-zinc-400"
                              }`}
                            >
                              {gap.status === "CONFIRMED_ABSENT"
                                ? "CONFIRMED ABSENCE"
                                : "MISSING EVIDENCE (PROBE REQUIRED)"}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400">{gap.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stage Progression & Audit Trail (Section 3.6) */}
                <div className="pt-3 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Application Pipeline Action (Section 3.6)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      Current: {selectedApp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStageTransition(selectedApp.id, "SHORTLISTED")}
                      disabled={selectedApp.status === "SHORTLISTED"}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
                        selectedApp.status === "SHORTLISTED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800 opacity-60"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      Shortlist
                    </button>

                    <button
                      onClick={() => handleStageTransition(selectedApp.id, "INTERVIEW")}
                      disabled={selectedApp.status === "INTERVIEW"}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
                        selectedApp.status === "INTERVIEW"
                          ? "bg-purple-950 text-purple-400 border border-purple-800 opacity-60"
                          : "bg-purple-600 hover:bg-purple-500 text-white"
                      }`}
                    >
                      Interview
                    </button>

                    <button
                      onClick={() => handleStageTransition(selectedApp.id, "SELECTED")}
                      disabled={selectedApp.status === "SELECTED"}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
                        selectedApp.status === "SELECTED"
                          ? "bg-blue-950 text-blue-400 border border-blue-800 opacity-60"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                      }`}
                    >
                      Offer
                    </button>
                  </div>

                  {/* Recruiter Notes Input */}
                  <div className="mt-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Add recruiter interview note or evaluation memo..."
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleAddNote(selectedApp.id)}
                        disabled={isAddingNote || !newNoteText.trim()}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-zinc-700"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Notes List */}
                    {selectedApp.notes && selectedApp.notes.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {selectedApp.notes.map((note, nIdx) => (
                          <div
                            key={nIdx}
                            className="p-2 rounded bg-zinc-950 border border-zinc-850 text-xs"
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                              <span className="text-zinc-300 font-semibold">{note.authorName}</span>
                              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-zinc-300 text-[11px] mt-0.5">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Verified Pipeline Audit Trail Log (Section 3.6 Requirement) */}
                  <div className="mt-4 pt-3 border-t border-zinc-800">
                    <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Pipeline Audit Trail Log ({selectedApp.auditTrail?.length || 0} Events)
                    </span>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {selectedApp.auditTrail && selectedApp.auditTrail.length > 0 ? (
                        selectedApp.auditTrail.map((audit, aIdx) => (
                          <div
                            key={aIdx}
                            className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px]"
                          >
                            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                              <span className="text-zinc-200 font-semibold">{audit.actionBy}</span>
                              <span>{new Date(audit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="text-zinc-300 mt-0.5 font-medium flex items-center gap-1 text-[11px]">
                              {audit.fromStage && <span className="text-zinc-500">{audit.fromStage} →</span>}
                              <span className="text-emerald-400 font-bold">{audit.toStage}</span>
                            </div>
                            {audit.note && (
                              <p className="text-[10px] text-zinc-400 italic mt-0.5">"{audit.note}"</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500 italic">No audit trail recorded yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-mono">Select a candidate on the left to inspect scorecard</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* AI Job Requirement Extractor Modal (Section 3.2) */}
      {isExtractorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsExtractorOpen(false);
                setExtractedPreview(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-zinc-100">
                AI Job Requirement Extractor (Section 3.2)
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Paste any raw, unstructured job description. The AI engine extracts required skills, importance weights,
              minimum years required, and normalized taxonomy tags.
            </p>

            <textarea
              rows={5}
              value={jobDescriptionInput}
              onChange={(e) => setJobDescriptionInput(e.target.value)}
              placeholder="Paste job description here... (e.g. We are looking for a Senior Full-Stack Engineer with 5+ years of experience in TypeScript, Next.js, PostgreSQL, Docker, and AWS...)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
            />

            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() =>
                  setJobDescriptionInput(
                    "We need a Senior Distributed Platform Engineer with at least 5 years of production TypeScript and Next.js experience. Must have 4 years of PostgreSQL query optimization, AWS container workflows (ECS/EKS), Docker, and knowledge of Apache Kafka event streams."
                  )
                }
                className="text-[11px] font-mono text-emerald-400 hover:underline"
              >
                + Insert Sample Description
              </button>

              <button
                onClick={handleRunAiExtractor}
                disabled={isExtracting || !jobDescriptionInput.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                {isExtracting ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Structured Weights...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract Requirements</span>
                  </>
                )}
              </button>
            </div>

            {/* Extracted Structured Requirements Preview */}
            {extractedPreview && (
              <div className="mt-5 p-4 rounded-lg bg-zinc-950 border border-emerald-900/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-emerald-400">
                    Extracted Structured Output
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Min Exp: {extractedPreview.minExperienceYears} yrs
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {extractedPreview.requiredSkills?.map((s: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 font-mono flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <strong>{s.name}</strong>
                      <span className="text-zinc-500 text-[10px]">
                        (Imp {s.importance}/5 • {s.minYearsRequired}y)
                      </span>
                    </span>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400">
                  <p className="font-semibold text-zinc-300">Preferred Skills:</p>
                  <p>{extractedPreview.preferredSkills?.join(", ") || "None specified"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 px-6 py-3 text-center text-xs font-mono text-zinc-500">
        TALENTIQ ENTERPRISE // SECTIONS 3.2, 3.4, 3.5, 3.6, 3.10 // RECRUITER COMMAND CENTER
      </footer>
    </div>
  );
}
