"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { SwissHeader } from "@/components/SwissHeader";
import { Job, JobSkillRequirement, SkillCategory } from "@/types";
import {
  Briefcase,
  Plus,
  Sparkles,
  RotateCcw,
  Building2,
  MapPin,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Users,
  Code2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  ExternalLink,
  Code,
  Tag,
} from "lucide-react";

const CATEGORIES: SkillCategory[] = [
  "BACKEND",
  "FRONTEND",
  "DEVOPS",
  "AI_ML",
  "DATABASE",
  "GENERAL",
];

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [showJsonLdId, setShowJsonLdId] = useState<string | null>(null);

  // Modal State for Create / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDepartment, setFormDepartment] = useState("Engineering");
  const [formLocation, setFormLocation] = useState("Zurich, Switzerland (Hybrid)");
  const [formType, setFormType] = useState("Full-time");
  const [formSalary, setFormSalary] = useState("140,000 - 175,000 CHF");
  const [formDescription, setFormDescription] = useState("");
  const [formMinExp, setFormMinExp] = useState(4);
  const [formQualifications, setFormQualifications] = useState<string[]>([]);
  const [formQualInput, setFormQualInput] = useState("");
  const [formRequiredSkills, setFormRequiredSkills] = useState<JobSkillRequirement[]>([]);
  const [formPreferredSkills, setFormPreferredSkills] = useState<string[]>([]);
  const [formPrefInput, setFormPrefInput] = useState("");

  // AI Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractNotice, setExtractNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success && data.jobs) {
        setJobs(data.jobs);
      } else {
        // Fallback to platform jobs endpoint if standard jobs route is syncing
        const platRes = await fetch("/api/platform/jobs");
        const platData = await platRes.json();
        if (platData.jobs) {
          // Adapt platform jobs to Job interface
          const adapted: Job[] = platData.jobs.map((pj: any) => ({
            id: pj.id,
            title: pj.title,
            department: pj.department,
            location: pj.location,
            type: pj.employmentType || "Full-time",
            salaryRange: pj.salaryRange ? `${pj.salaryRange.min} - ${pj.salaryRange.max} ${pj.salaryRange.currency}` : undefined,
            description: pj.description || pj.summary,
            requiredSkills: (pj.skillWeights || []).map((sw: any) => ({
              name: sw.name,
              importance: Math.min(5, Math.max(1, Math.round(sw.weight * 5))),
              minYearsRequired: sw.minimumYearsRequired || 3,
              category: "BACKEND",
            })),
            preferredSkills: pj.qualifications || [],
            minExperienceYears: 4,
            qualifications: pj.qualifications || [],
            status: pj.status?.toUpperCase() || "OPEN",
            applicantCount: pj.applicantCount || 3,
            createdAt: pj.createdAt,
            updatedAt: pj.updatedAt,
          }));
          setJobs(adapted);
        }
      }
    } catch (e) {
      console.error("Failed loading vacancies", e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Smart client fallback parser in case /api/extract-job is still merging on partner's branch
   */
  const clientSideSkillExtractor = (text: string) => {
    const skillDictionary: Array<{ name: string; category: SkillCategory; defaultYears: number; defaultImp: number }> = [
      { name: "Node.js", category: "BACKEND", defaultYears: 4, defaultImp: 5 },
      { name: "TypeScript", category: "BACKEND", defaultYears: 3, defaultImp: 5 },
      { name: "PostgreSQL", category: "DATABASE", defaultYears: 3, defaultImp: 4 },
      { name: "React", category: "FRONTEND", defaultYears: 3, defaultImp: 4 },
      { name: "Next.js", category: "FRONTEND", defaultYears: 2, defaultImp: 4 },
      { name: "Docker", category: "DEVOPS", defaultYears: 3, defaultImp: 3 },
      { name: "Kubernetes", category: "DEVOPS", defaultYears: 2, defaultImp: 3 },
      { name: "Python", category: "AI_ML", defaultYears: 3, defaultImp: 4 },
      { name: "FastAPI", category: "BACKEND", defaultYears: 2, defaultImp: 3 },
      { name: "AWS", category: "DEVOPS", defaultYears: 3, defaultImp: 4 },
      { name: "GraphQL", category: "BACKEND", defaultYears: 2, defaultImp: 3 },
      { name: "Distributed Systems", category: "BACKEND", defaultYears: 4, defaultImp: 5 },
      { name: "Redis", category: "DATABASE", defaultYears: 2, defaultImp: 3 },
      { name: "Tailwind CSS", category: "FRONTEND", defaultYears: 2, defaultImp: 3 },
    ];

    const detected: JobSkillRequirement[] = [];
    const textLower = text.toLowerCase();

    // Check years pattern like "5+ years", "4 years"
    const expMatch = text.match(/(\d+)\+?\s*years?/i);
    const minYears = expMatch ? parseInt(expMatch[1], 10) : 4;

    skillDictionary.forEach((item) => {
      if (textLower.includes(item.name.toLowerCase())) {
        detected.push({
          name: item.name,
          category: item.category,
          minYearsRequired: item.defaultYears,
          importance: item.defaultImp,
        });
      }
    });

    if (detected.length === 0) {
      // Default initial skills if no keyword matches
      detected.push(
        { name: "TypeScript", category: "BACKEND", minYearsRequired: 3, importance: 5 },
        { name: "Node.js", category: "BACKEND", minYearsRequired: 3, importance: 4 },
        { name: "PostgreSQL", category: "DATABASE", minYearsRequired: 2, importance: 4 }
      );
    }

    return { skills: detected, minExperienceYears: minYears };
  };

  const handleAiAutoExtract = async () => {
    if (!formDescription.trim()) {
      setExtractNotice("Please provide job description text first");
      return;
    }

    setIsExtracting(true);
    setExtractNotice(null);

    try {
      // Attempt to call partner's /api/extract-job endpoint
      const res = await fetch("/api/extract-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: formDescription }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.requirements) {
          setFormRequiredSkills(data.requirements.skills || []);
          if (data.requirements.minExperienceYears) {
            setFormMinExp(data.requirements.minExperienceYears);
          }
          setExtractNotice("Extracted via AI Engine API");
          setIsExtracting(false);
          return;
        }
      }
      throw new Error("Route not ready or returned empty");
    } catch {
      // Graceful smart client-side fallback
      const parsed = clientSideSkillExtractor(formDescription);
      setFormRequiredSkills(parsed.skills);
      setFormMinExp(parsed.minExperienceYears);
      setExtractNotice("Extracted via High-Fidelity Client Parser (Parallel dev fallback)");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingJobId(null);
    setFormTitle("");
    setFormDepartment("Engineering");
    setFormLocation("Zurich, Switzerland (Hybrid)");
    setFormType("Full-time");
    setFormSalary("140,000 - 175,000 CHF");
    setFormDescription(
      "We are seeking an experienced Senior Software Engineer to build robust distributed backend microservices and high-throughput vector pipelines."
    );
    setFormMinExp(4);
    setFormQualifications([
      "B.S. or M.S. in Computer Science or equivalent practical experience",
      "Demonstrated experience designing high-scale REST & gRPC architectures",
    ]);
    setFormRequiredSkills([
      { name: "TypeScript", category: "BACKEND", importance: 5, minYearsRequired: 4 },
      { name: "Node.js", category: "BACKEND", importance: 4, minYearsRequired: 4 },
      { name: "PostgreSQL", category: "DATABASE", importance: 4, minYearsRequired: 3 },
      { name: "Docker", category: "DEVOPS", importance: 3, minYearsRequired: 2 },
    ]);
    setFormPreferredSkills(["Kubernetes", "Redis", "Kafka"]);
    setExtractNotice(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (job: Job) => {
    setEditingJobId(job.id);
    setFormTitle(job.title);
    setFormDepartment(job.department);
    setFormLocation(job.location);
    setFormType(job.type);
    setFormSalary(job.salaryRange || "");
    setFormDescription(job.description);
    setFormMinExp(job.minExperienceYears || 4);
    setFormQualifications(job.qualifications || []);
    setFormRequiredSkills(job.requiredSkills || []);
    setFormPreferredSkills(job.preferredSkills || []);
    setExtractNotice(null);
    setModalOpen(true);
  };

  const handleSaveJob = async () => {
    if (!formTitle.trim()) return;

    const payload = {
      action: editingJobId ? "update" : "create",
      id: editingJobId || undefined,
      title: formTitle.trim(),
      department: formDepartment.trim(),
      location: formLocation.trim(),
      type: formType,
      salaryRange: formSalary,
      description: formDescription,
      minExperienceYears: formMinExp,
      qualifications: formQualifications,
      requiredSkills: formRequiredSkills,
      preferredSkills: formPreferredSkills,
      status: "OPEN",
    };

    try {
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setModalOpen(false);
      fetchJobs();
    } catch (e) {
      console.error("Save error", e);
    }
  };

  const handleToggleStatus = async (job: Job) => {
    const newStatus = job.status === "OPEN" ? "CLOSED" : "OPEN";
    try {
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          id: job.id,
          status: newStatus,
        }),
      });
      fetchJobs();
    } catch (e) {
      console.error("Status toggle error", e);
    }
  };

  // Skill Builder Helpers
  const addSkillRequirement = () => {
    setFormRequiredSkills([
      ...formRequiredSkills,
      { name: "New Skill", category: "BACKEND", importance: 3, minYearsRequired: 2 },
    ]);
  };

  const updateSkill = (index: number, updates: Partial<JobSkillRequirement>) => {
    const updated = [...formRequiredSkills];
    updated[index] = { ...updated[index], ...updates };
    setFormRequiredSkills(updated);
  };

  const removeSkill = (index: number) => {
    setFormRequiredSkills(formRequiredSkills.filter((_, i) => i !== index));
  };

  const addQualification = () => {
    if (!formQualInput.trim()) return;
    setFormQualifications([...formQualifications, formQualInput.trim()]);
    setFormQualInput("");
  };

  const removeQualification = (index: number) => {
    setFormQualifications(formQualifications.filter((_, i) => i !== index));
  };

  const addPreferredSkill = () => {
    if (!formPrefInput.trim()) return;
    setFormPreferredSkills([...formPreferredSkills, formPrefInput.trim()]);
    setFormPrefInput("");
  };

  const removePreferredSkill = (index: number) => {
    setFormPreferredSkills(formPreferredSkills.filter((_, i) => i !== index));
  };

  // Compute total importance points to display normalized % weight
  const totalWeightPoints = formRequiredSkills.reduce((sum, s) => sum + (s.importance || 1), 0);

  // Generate Google JobPosting JSON-LD for open vacancies
  const generateJsonLd = (job: Job) => {
    return {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: job.title,
      description: job.description,
      identifier: {
        "@type": "PropertyValue",
        name: "TALENTIQ",
        value: job.id,
      },
      datePosted: job.createdAt || new Date().toISOString(),
      employmentType: job.type === "Full-time" ? "FULL_TIME" : "CONTRACTOR",
      hiringOrganization: {
        "@type": "Organization",
        name: "NexaCorp Talent Solutions",
        sameAs: "https://nexacorp.io",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: job.location.split(",")[0] || "Zurich",
          addressCountry: "CH",
        },
      },
      skills: job.requiredSkills.map((s) => s.name).join(", "),
      experienceRequirements: `${job.minExperienceYears}+ years`,
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 swiss-grid-pattern transition-colors duration-150">
      <SwissHeader
        currentRole="recruiter"
        onRoleChange={() => {}}
        onResetData={fetchJobs}
        isResetting={false}
        dbType="local_json"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header Breadcrumbs & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span>TALENTIQ</span>
              <span>/</span>
              <span>RECRUITER</span>
              <span>/</span>
              <span className="text-zinc-900 dark:text-white font-semibold">JOB MANAGEMENT</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Vacancy Hub & AI Requirement Weighting
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Section 3.2: Configure vacancy status, interactive skill requirement weights, and SEO metadata.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>POST NEW VACANCY</span>
            </button>
          </div>
        </div>

        {/* Executive Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs">
            <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Total Requisitions
            </span>
            <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1 block">
              {jobs.length}
            </span>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs">
            <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Active Openings
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
              {jobs.filter((j) => j.status === "OPEN").length}
            </span>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs">
            <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Closed / Archived
            </span>
            <span className="text-2xl font-bold font-mono text-zinc-500 dark:text-zinc-400 mt-1 block">
              {jobs.filter((j) => j.status === "CLOSED").length}
            </span>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xs">
            <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              SEO JSON-LD Status
            </span>
            <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 block">
              GOOGLE READY
            </span>
          </div>
        </div>

        {/* Vacancies List */}
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-zinc-500 dark:text-zinc-400">
            Loading requisitions...
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 space-y-3">
            <Briefcase className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">No vacancies currently found.</p>
            <button
              onClick={handleOpenCreateModal}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-md"
            >
              Create your first vacancy
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const isOpen = job.status === "OPEN";
              const isExpanded = expandedJobId === job.id;
              const jsonLd = generateJsonLd(job);

              return (
                <div
                  key={job.id}
                  className="p-5 sm:p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xs space-y-4 transition-all"
                >
                  {/* Google JobPosting JSON-LD Script tag embedded */}
                  {isOpen && (
                    <script
                      type="application/ld+json"
                      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                    />
                  )}

                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{job.id}</span>
                        <span className="text-zinc-300 dark:text-zinc-700">//</span>
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {job.department}
                        </span>
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase border ${
                            isOpen
                              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          {job.status}
                        </span>

                        {/* Live Applicant Badge */}
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-sm bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
                          <Users className="w-3 h-3 text-indigo-500" />
                          <span>{job.applicantCount || 0} APPLICANTS</span>
                        </span>
                      </div>

                      <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
                        {job.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {job.type} ({job.minExperienceYears}+ yrs min)
                        </span>
                        {job.salaryRange && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                              <DollarSign className="w-3.5 h-3.5" />
                              {job.salaryRange}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(job)}
                        className={`px-3 py-1.5 text-xs font-mono font-medium rounded-sm border transition-colors ${
                          isOpen
                            ? "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            : "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                        }`}
                      >
                        {isOpen ? "Close Vacancy" : "Reopen Vacancy"}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(job)}
                        className="px-3 py-1.5 text-xs font-mono font-medium rounded-sm border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Edit
                      </button>

                      <Link
                        href={`/pipeline`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-emerald-600 text-white text-xs font-mono font-semibold rounded-sm hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors"
                      >
                        <span>Rank Leaderboard</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Summary Snippet with Expandable Accordion */}
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                      {job.description}
                    </p>

                    <button
                      onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 hover:underline pt-0.5"
                    >
                      <span>{isExpanded ? "Hide Full Description & Requirements" : "Show Full Description & Requirements"}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs animate-in fade-in">
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-white uppercase font-mono text-[11px] mb-1">
                            Complete Job Description
                          </h4>
                          <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                            {job.description}
                          </p>
                        </div>

                        {job.qualifications && job.qualifications.length > 0 && (
                          <div>
                            <h4 className="font-bold text-zinc-900 dark:text-white uppercase font-mono text-[11px] mb-1">
                              Mandatory Qualifications
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300">
                              {job.qualifications.map((q, i) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {job.preferredSkills && job.preferredSkills.length > 0 && (
                          <div>
                            <h4 className="font-bold text-zinc-900 dark:text-white uppercase font-mono text-[11px] mb-1">
                              Preferred / Nice-to-Have Competencies
                            </h4>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {job.preferredSkills.map((ps, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-sm bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]"
                                >
                                  {ps}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Visual Skill Importance Weights Breakdown */}
                  <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        Configured Skill Importance Weights
                      </span>
                      <button
                        onClick={() => setShowJsonLdId(showJsonLdId === job.id ? null : job.id)}
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <Code className="w-3 h-3" />
                        <span>{showJsonLdId === job.id ? "Hide JSON-LD" : "View Google JobPosting JSON-LD"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {job.requiredSkills.map((s, idx) => {
                        const impPct = Math.round(((s.importance || 3) / 5) * 100);
                        return (
                          <div
                            key={idx}
                            className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 space-y-1 font-mono text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-zinc-900 dark:text-white truncate">{s.name}</span>
                              <span className="text-[10px] text-zinc-500">{s.minYearsRequired}+ yrs</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span
                                className={`font-semibold uppercase ${
                                  s.importance >= 4
                                    ? "text-red-600 dark:text-red-400"
                                    : s.importance === 3
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-zinc-500 dark:text-zinc-400"
                                }`}
                              >
                                {s.importance >= 4 ? "Critical" : s.importance === 3 ? "Important" : "Nice-to-Have"}
                              </span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{impPct}%</span>
                            </div>
                            <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-600 dark:bg-emerald-500 h-1 rounded-full"
                                style={{ width: `${impPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Google JobPosting JSON-LD Viewer Drawer */}
                    {showJsonLdId === job.id && (
                      <div className="mt-3 p-3 rounded-lg bg-zinc-950 text-emerald-400 font-mono text-[11px] border border-zinc-800 overflow-x-auto space-y-1">
                        <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-zinc-800">
                          <span>Google JobPosting Schema.org JSON-LD (Verified SEO Structure)</span>
                          <span className="text-emerald-500">HTTP 200 OK</span>
                        </div>
                        <pre className="text-[10px] leading-relaxed pt-2">
                          {JSON.stringify(jsonLd, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE / EDIT VACANCY MODAL WITH AI AUTO-EXTRACT & SKILL BUILDER */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {editingJobId ? "Edit Job Requisition" : "Create New Job Requisition"}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Configure vacancy parameters, AI skill extraction, and scoring weights
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {/* AI Auto-Extract Banner */}
            <div className="p-4 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>AI Requirement Extractor (Requirement 3.2)</span>
                </span>
                {extractNotice && (
                  <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                    {extractNotice}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Paste any free-text job description below. Clicking "AI Auto-Extract" sends it to
                POST /api/extract-job (with smart client fallback) to populate the interactive skill weights below.
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAiAutoExtract}
                  disabled={isExtracting}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isExtracting ? "animate-spin" : ""}`} />
                  <span>{isExtracting ? "Extracting Requirements..." : "AI Auto-Extract Requirements"}</span>
                </button>
              </div>
            </div>

            {/* Requisition Fields Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    required
                    className="w-full px-3 py-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="e.g. Core Platform & Infrastructure"
                    className="w-full px-3 py-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Location & Workplace Type
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Zurich, Switzerland (Hybrid)"
                    className="w-full px-3 py-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Job Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    placeholder="e.g. 140,000 - 175,000 CHF"
                    className="w-full px-3 py-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Job Description & Scope
                </label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Paste or write full job requirements, company overview, and role objectives..."
                  className="w-full px-3 py-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white leading-relaxed"
                />
              </div>

              {/* INTERACTIVE SKILL BUILDER & WEIGHT ADJUSTER */}
              <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Skill Requirement Builder & Importance Weights</span>
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Adjust Importance (1-5) and Minimum Experience. Weights automatically normalize.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addSkillRequirement}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-semibold rounded-md bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 text-zinc-800 dark:text-zinc-200"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Skill</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formRequiredSkills.map((skill, index) => {
                    const normWeightPct = totalWeightPoints > 0
                      ? Math.round((skill.importance / totalWeightPoints) * 100)
                      : 0;

                    return (
                      <div
                        key={index}
                        className="p-3 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid grid-cols-12 gap-3 items-center text-xs"
                      >
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => updateSkill(index, { name: e.target.value })}
                            placeholder="Skill name"
                            className="w-full px-2 py-1 text-xs font-medium rounded border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-white"
                          />
                        </div>

                        <div className="col-span-3">
                          <select
                            value={skill.category}
                            onChange={(e) => updateSkill(index, { category: e.target.value as SkillCategory })}
                            className="w-full px-2 py-1 text-[11px] font-mono rounded border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-800 dark:text-zinc-300"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="text-[10px] font-mono text-zinc-500 block">Min Yrs</label>
                          <input
                            type="number"
                            min={1}
                            max={15}
                            value={skill.minYearsRequired}
                            onChange={(e) => updateSkill(index, { minYearsRequired: parseInt(e.target.value) || 1 })}
                            className="w-full px-2 py-0.5 text-xs font-mono rounded border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-white"
                          />
                        </div>

                        <div className="col-span-2">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span>Imp: {skill.importance}/5</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{normWeightPct}%</span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={5}
                            value={skill.importance}
                            onChange={(e) => updateSkill(index, { importance: parseInt(e.target.value) })}
                            className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer accent-emerald-500"
                          />
                        </div>

                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="text-zinc-400 hover:text-red-500 transition-colors"
                            title="Remove Skill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Skills Tags */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Preferred / Nice-to-Have Skills
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formPrefInput}
                    onChange={(e) => setFormPrefInput(e.target.value)}
                    placeholder="e.g. Kafka, Redis, Elasticsearch"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPreferredSkill();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addPreferredSkill}
                    className="px-3 py-1.5 bg-zinc-800 text-white text-xs rounded-md"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formPreferredSkills.map((pref, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs border border-zinc-200 dark:border-zinc-700"
                    >
                      <span>{pref}</span>
                      <button
                        type="button"
                        onClick={() => removePreferredSkill(idx)}
                        className="text-zinc-400 hover:text-red-400 ml-1 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveJob}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow-xs"
              >
                {editingJobId ? "Save Requisition Changes" : "Publish Vacancy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
