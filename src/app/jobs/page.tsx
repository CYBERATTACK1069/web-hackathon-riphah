"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { JobVacancy, JobVacancyStatus } from "@/types/platform";
import { SwissHeader } from "@/components/SwissHeader";
import {
  Briefcase,
  Plus,
  Sparkles,
  Lock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
  Sliders,
  DollarSign,
} from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [freeTextPrompt, setFreeTextPrompt] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDepartment, setNewDepartment] = useState("Platform Engineering");
  const [newLocation, setNewLocation] = useState("Zurich, Switzerland (Hybrid)");
  const [newSalary, setNewSalary] = useState("140,000 - 175,000 CHF");
  const [extractedSkills, setExtractedSkills] = useState<any[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/platform/jobs");
      const json = await res.json();
      if (json.jobs) {
        setJobs(json.jobs);
      }
    } catch (e) {
      console.error("Failed to load jobs", e);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractAI = async () => {
    if (!freeTextPrompt.trim()) return;
    setIsExtracting(true);
    try {
      const res = await fetch("/api/platform/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "extract",
          description: freeTextPrompt,
          title: newTitle,
        }),
      });
      const data = await res.json();
      if (data.extracted) {
        setExtractedSkills(data.extracted.skillWeights || []);
        if (!newTitle) setNewTitle(data.extracted.title);
      }
    } catch (e) {
      console.error("Extraction error", e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCreateJob = async () => {
    if (!newTitle.trim()) return;
    try {
      await fetch("/api/platform/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title: newTitle,
          department: newDepartment,
          location: newLocation,
          description: freeTextPrompt || `Requisition for ${newTitle}`,
          skillWeights: extractedSkills.length > 0 ? extractedSkills : undefined,
        }),
      });
      setShowCreateModal(false);
      setFreeTextPrompt("");
      setNewTitle("");
      setExtractedSkills([]);
      fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: JobVacancyStatus) => {
    try {
      await fetch("/api/platform/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          jobId,
          newStatus,
          changedBy: "Elena Vance",
          reason: `Recruiter manual status toggle to ${newStatus}`,
        }),
      });
      fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/60 swiss-grid-pattern">
      <SwissHeader
        currentRole="recruiter"
        onRoleChange={() => {}}
        onResetData={fetchJobs}
        isResetting={false}
        dbType="local_json"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Top Breadcrumb & Action Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 mb-1">
              <span>TALENTSWISS</span>
              <span>/</span>
              <span className="text-zinc-900 font-semibold">REQUISITIONS & WEIGHTING</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Job Vacancy Management & AI Requirements
            </h1>
            <p className="text-xs text-zinc-600 mt-1">
              Functional Spec 3.2: Configure vacancy status, status audit trails, and skill importance weighting.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-sm hover:bg-emerald-600 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI CREATE VACANCY</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-zinc-200 rounded-sm">
            <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider block">
              Total Vacancies
            </span>
            <span className="text-2xl font-bold font-mono text-zinc-900 mt-1 block">{jobs.length}</span>
          </div>
          <div className="p-4 bg-white border border-zinc-200 rounded-sm">
            <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider block">
              Open Requisitions
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">
              {jobs.filter((j) => j.status === "open" || j.status === "reopened").length}
            </span>
          </div>
          <div className="p-4 bg-white border border-zinc-200 rounded-sm">
            <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider block">
              Closed / Filled
            </span>
            <span className="text-2xl font-bold font-mono text-zinc-500 mt-1 block">
              {jobs.filter((j) => j.status === "closed").length}
            </span>
          </div>
          <div className="p-4 bg-white border border-zinc-200 rounded-sm">
            <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider block">
              Audit Compliance
            </span>
            <span className="text-2xl font-bold font-mono text-zinc-900 mt-1 block">100% ISO</span>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-zinc-200 rounded-sm p-6 space-y-4 transition-all hover:border-zinc-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight">{job.title}</h2>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 uppercase font-bold rounded-sm border ${
                        job.status === "open"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : job.status === "reopened"
                          ? "bg-indigo-50 text-indigo-800 border-indigo-300"
                          : "bg-zinc-100 text-zinc-600 border-zinc-300"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-1 font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {job.department}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location} ({job.workplaceType})
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      {job.salaryRange?.min != null
                        ? `${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max?.toLocaleString()} ${job.salaryRange.currency || "CHF"}`
                        : "Competitive Market Rate"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {job.status === "open" || job.status === "reopened" ? (
                    <button
                      onClick={() => handleStatusChange(job.id, "closed")}
                      className="px-3 py-1.5 border border-zinc-300 text-xs font-mono font-medium rounded-sm hover:bg-zinc-100 transition-colors"
                    >
                      Close Vacancy
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(job.id, "reopened")}
                      className="px-3 py-1.5 border border-emerald-400 bg-emerald-50 text-emerald-800 text-xs font-mono font-medium rounded-sm hover:bg-emerald-100 transition-colors"
                    >
                      Reopen Vacancy
                    </button>
                  )}

                  <Link
                    href={`/pipeline`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-900 text-white text-xs font-mono font-medium rounded-sm hover:bg-emerald-600 transition-colors"
                  >
                    <span>View Pipeline</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed max-w-4xl">{job.summary}</p>

              {/* Skill Importance Weights Breakdown */}
              <div className="border-t border-zinc-100 pt-4">
                <span className="font-mono text-[11px] font-bold text-zinc-700 block mb-2 uppercase tracking-wider">
                  Configured Skill Importance Weights (Sums to 1.0)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {job.skillWeights.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-50 border border-zinc-200 rounded-sm space-y-1.5 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-900">{s.name}</span>
                        <span className="text-[10px] text-zinc-500">{s.minimumYearsRequired}+ yrs</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold uppercase text-[10px] ${
                            s.importance === "critical"
                              ? "text-red-700"
                              : s.importance === "important"
                              ? "text-amber-700"
                              : "text-zinc-500"
                          }`}
                        >
                          {s.importance}
                        </span>
                        <span className="font-bold text-emerald-700">{(s.weight * 100).toFixed(0)}% wt</span>
                      </div>
                      <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${s.weight * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Audit History */}
              {job.statusHistory && job.statusHistory.length > 0 && (
                <div className="border-t border-zinc-100 pt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-400">
                  <span className="font-bold text-zinc-600">Audit History:</span>
                  {job.statusHistory.slice(-3).map((h, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">
                      <span>{h.status.toUpperCase()}</span>
                      <span className="text-zinc-400">by {h.changedBy}</span>
                      <span className="text-zinc-400">({new Date(h.changedAt).toLocaleDateString()})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AI Create Vacancy Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white border border-zinc-300 rounded-sm max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-zinc-900 uppercase font-mono tracking-wider">
                    AI Job Requirement Extractor (Spec 3.2)
                  </h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-zinc-400 hover:text-zinc-700 text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-zinc-600">
                Paste an unformatted free-text job description. The AI engine will parse required skills, calibrate importance weights (1.0 distribution), experience levels, and qualifications.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-mono text-zinc-700 block mb-1 font-semibold">Job Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Lead Distributed Cloud Architect"
                    className="w-full border border-zinc-300 rounded-sm px-3 py-2 text-zinc-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-mono text-zinc-700 block mb-1 font-semibold">
                    Free-Text Job Description
                  </label>
                  <textarea
                    rows={4}
                    value={freeTextPrompt}
                    onChange={(e) => setFreeTextPrompt(e.target.value)}
                    placeholder="Paste unformatted job text, e.g. We are looking for a Senior Backend engineer with 5+ years Python and Django. Must have deep PostgreSQL and Docker knowledge..."
                    className="w-full border border-zinc-300 rounded-sm p-3 text-zinc-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleExtractAI}
                    disabled={isExtracting || !freeTextPrompt.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-mono font-semibold rounded-sm hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isExtracting ? "Extracting Requirements..." : "Run AI Extraction"}</span>
                  </button>
                </div>

                {extractedSkills.length > 0 && (
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-sm space-y-2">
                    <span className="font-mono text-[11px] font-bold text-zinc-800 uppercase block">
                      Extracted Skill Weights:
                    </span>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      {extractedSkills.map((s, i) => (
                        <div key={i} className="p-2 bg-white border border-zinc-200 rounded flex justify-between">
                          <span className="font-bold text-zinc-900">{s.name}</span>
                          <span className="text-emerald-700 font-bold">{(s.weight * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-200 pt-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-zinc-300 text-xs font-mono rounded-sm hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateJob}
                  disabled={!newTitle.trim()}
                  className="px-4 py-2 bg-zinc-900 text-white text-xs font-mono font-semibold rounded-sm hover:bg-emerald-600 disabled:opacity-50"
                >
                  Publish Requisition
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
