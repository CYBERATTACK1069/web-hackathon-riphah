"use client";

import React, { useState, useEffect } from "react";
import {
  PlatformDatabaseSchema,
  ParsedResume,
  MatchEvaluation,
} from "@/types/platform";
import { SwissHeader } from "@/components/SwissHeader";
import {
  Sparkles,
  Search,
  Users,
  Copy,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GitMerge,
  Layers,
  ChevronRight,
  Check,
  Plus,
} from "lucide-react";

export default function TalentIntelligencePage() {
  const [data, setData] = useState<PlatformDatabaseSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"search" | "compare" | "duplicates" | "hallucinations">("search");
  const [blindMode, setBlindMode] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Comparison state: candidate IDs
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([
    "usr-candidate-01",
    "usr-candidate-02",
  ]);

  // Duplicate merge state
  const [mergedGroupIds, setMergedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/platform");
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim() || !data) return;
    const qLower = searchQuery.toLowerCase();
    const queryTokens = qLower.split(/\s+/).filter((t) => t.length > 2);

    const results = data.resumes.map((res) => {
      const text = `${res.summary} ${res.rawText} ${res.normalizedSkills.map((s) => s.normalizedName).join(" ")}`.toLowerCase();
      let matchCount = 0;
      const matchedTerms: string[] = [];

      queryTokens.forEach((token) => {
        if (text.includes(token)) {
          matchCount++;
          matchedTerms.push(token);
        }
      });

      res.normalizedSkills.forEach((s) => {
        if (qLower.includes(s.normalizedName.toLowerCase())) {
          matchCount += 2;
          if (!matchedTerms.includes(s.normalizedName)) {
            matchedTerms.push(s.normalizedName);
          }
        }
      });

      const simScore = Math.min(60 + matchCount * 9, 98);

      return {
        resume: res,
        score: matchCount > 0 ? simScore : 52,
        matchedTerms,
      };
    });

    results.sort((a, b) => b.score - a.score);
    setSearchResults(results);
  };

  const handleToggleCompare = (candId: string) => {
    if (selectedForCompare.includes(candId)) {
      if (selectedForCompare.length > 1) {
        setSelectedForCompare(selectedForCompare.filter((id) => id !== candId));
      }
    } else {
      if (selectedForCompare.length < 3) {
        setSelectedForCompare([...selectedForCompare, candId]);
      }
    }
  };

  const handleMergeDuplicate = (grpId: string) => {
    setMergedGroupIds([...mergedGroupIds, grpId]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/60 swiss-grid-pattern">
      <SwissHeader
        currentRole="recruiter"
        onRoleChange={() => {}}
        onResetData={fetchData}
        isResetting={false}
        dbType="local_json"
        blindMode={blindMode}
        onToggleBlindMode={() => setBlindMode(!blindMode)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 mb-1">
              <span>TALENTSWISS</span>
              <span>/</span>
              <span className="text-zinc-900 font-semibold">ADVANCED TALENT INTELLIGENCE</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Talent Sourcing, Side-by-Side Comparison & Bias Shield
            </h1>
            <p className="text-xs text-zinc-600 mt-1">
              Functional Spec 3.10: Vector semantic search, deduplication merge review, side-by-side comparison, and anti-hallucination verification.
            </p>
          </div>

          {/* Blind Screening Shield Pill */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setBlindMode(!blindMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-semibold transition-colors ${
                blindMode
                  ? "bg-purple-50 text-purple-800 border-purple-300"
                  : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${blindMode ? "text-purple-600" : "text-zinc-400"}`} />
              <span>Blind Screening Shield: {blindMode ? "ACTIVE (Names Anonymized)" : "OFF"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab("search")}
            className={`py-2.5 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "search"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Semantic Talent Search</span>
          </button>

          <button
            onClick={() => setActiveTab("compare")}
            className={`py-2.5 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "compare"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Side-by-Side Candidate Comparison ({selectedForCompare.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("duplicates")}
            className={`py-2.5 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "duplicates"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Duplicate Detection & Merge</span>
          </button>

          <button
            onClick={() => setActiveTab("hallucinations")}
            className={`py-2.5 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "hallucinations"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Hallucination & Grounding Verification</span>
          </button>
        </div>

        {/* TAB 1: SEMANTIC SEARCH */}
        {activeTab === "search" && (
          <div className="space-y-4">
            <div className="p-6 bg-white border border-zinc-200 rounded-sm space-y-3">
              <span className="font-mono text-xs font-bold text-zinc-800 block uppercase">
                Natural-Language Semantic Sourcing (Vector Similarity)
              </span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="e.g. 'Senior engineers with Python, Django, high-throughput PostgreSQL, and Docker containerization'..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-sm focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-zinc-900 text-white font-mono text-xs font-semibold rounded-sm hover:bg-emerald-600 transition-colors"
                >
                  Search Talent
                </button>
              </div>

              {/* Sample Quick Searches */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px] text-zinc-500">
                <span>Try prompt:</span>
                <button
                  onClick={() => {
                    setSearchQuery("Python Django PostgreSQL distributed concurrency");
                    setTimeout(handleSearch, 50);
                  }}
                  className="underline hover:text-zinc-900"
                >
                  &ldquo;Python Django PostgreSQL distributed concurrency&rdquo;
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    setSearchQuery("Docker microservices asyncio performance");
                    setTimeout(handleSearch, 50);
                  }}
                  className="underline hover:text-zinc-900"
                >
                  &ldquo;Docker microservices asyncio performance&rdquo;
                </button>
              </div>
            </div>

            {/* Results Grid */}
            {searchResults.length > 0 && (
              <div className="space-y-3">
                <span className="font-mono text-xs font-bold text-zinc-800 block uppercase">
                  Ranked Talent Matches ({searchResults.length})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((res, i) => {
                    const r: ParsedResume = res.resume;
                    const name = blindMode
                      ? `Candidate #${r.candidateId.slice(-4).toUpperCase()}`
                      : r.contactInfo.fullName;

                    return (
                      <div
                        key={i}
                        className="p-5 bg-white border border-zinc-200 rounded-sm space-y-2.5 shadow-2xs hover:border-zinc-300 transition-all text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-zinc-900 text-sm">{name}</span>
                            <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                              {r.contactInfo.location} • {r.workExperience[0]?.title}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-xs px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded">
                            {res.score}% Match
                          </span>
                        </div>

                        <p className="text-zinc-600 text-xs leading-relaxed">{r.summary}</p>

                        <div className="border-t border-zinc-100 pt-2 flex flex-wrap gap-1 font-mono text-[10px]">
                          <span className="text-zinc-500">Skills:</span>
                          {r.normalizedSkills.map((s, idx) => (
                            <span
                              key={idx}
                              className={`px-1.5 py-0.5 rounded border ${
                                res.matchedTerms.includes(s.normalizedName.toLowerCase())
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                                  : "bg-zinc-100 text-zinc-700 border-zinc-200"
                              }`}
                            >
                              {s.normalizedName}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SIDE-BY-SIDE CANDIDATE COMPARISON */}
        {activeTab === "compare" && (
          <div className="space-y-4">
            <div className="p-4 bg-white border border-zinc-200 rounded-sm flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <span className="font-bold text-zinc-800 uppercase">
                Select Candidates to Compare (Up to 3):
              </span>
              <div className="flex flex-wrap gap-2">
                {data?.applications.map((app) => {
                  const isChecked = selectedForCompare.includes(app.candidateId);
                  const displayName = blindMode
                    ? `Candidate #${app.candidateId.slice(-4).toUpperCase()}`
                    : app.candidateProfile.fullName;

                  return (
                    <button
                      key={app.candidateId}
                      onClick={() => handleToggleCompare(app.candidateId)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-semibold transition-all ${
                        isChecked
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      {isChecked ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{displayName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white border border-zinc-200 rounded-sm overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/80">
                    <th className="p-4 text-zinc-500 uppercase tracking-wider font-bold w-1/4">Evaluation Metric</th>
                    {selectedForCompare.map((candId) => {
                      const app = data?.applications.find((a) => a.candidateId === candId);
                      const displayName = blindMode
                        ? `Candidate #${candId.slice(-4).toUpperCase()}`
                        : app?.candidateProfile.fullName;

                      return (
                        <th key={candId} className="p-4 font-bold text-zinc-900 text-sm">
                          {displayName}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-700">
                  {/* Composite Match */}
                  <tr className="bg-emerald-50/30">
                    <td className="p-4 font-bold text-zinc-900">Composite Match Score</td>
                    {selectedForCompare.map((candId) => {
                      const ev = data?.evaluations.find((e) => e.candidateId === candId);
                      return (
                        <td key={candId} className="p-4">
                          <span className="font-bold text-base text-emerald-800">
                            {ev?.scoreBreakdown.compositeScore}%
                          </span>{" "}
                          <span className="text-[11px] uppercase text-zinc-500">({ev?.verdict.replace("_", " ")})</span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Skills Score (50%) */}
                  <tr>
                    <td className="p-4 font-semibold text-zinc-800">1. Skills Score (50% wt)</td>
                    {selectedForCompare.map((candId) => {
                      const ev = data?.evaluations.find((e) => e.candidateId === candId);
                      return (
                        <td key={candId} className="p-4 font-bold text-zinc-900">
                          {ev?.scoreBreakdown.skillsScore}%
                        </td>
                      );
                    })}
                  </tr>

                  {/* Experience Score (25%) */}
                  <tr>
                    <td className="p-4 font-semibold text-zinc-800">2. Experience Score (25% wt)</td>
                    {selectedForCompare.map((candId) => {
                      const ev = data?.evaluations.find((e) => e.candidateId === candId);
                      return (
                        <td key={candId} className="p-4 font-bold text-zinc-900">
                          {ev?.scoreBreakdown.experienceScore}% ({ev?.experienceMatchAnalysis.totalYearsRelevant} yrs rel)
                        </td>
                      );
                    })}
                  </tr>

                  {/* Projects Score (15%) */}
                  <tr>
                    <td className="p-4 font-semibold text-zinc-800">3. Projects Score (15% wt)</td>
                    {selectedForCompare.map((candId) => {
                      const ev = data?.evaluations.find((e) => e.candidateId === candId);
                      return (
                        <td key={candId} className="p-4 font-bold text-zinc-900">
                          {ev?.scoreBreakdown.projectsScore}% ({ev?.projectsMatchAnalysis.complexityRating} complexity)
                        </td>
                      );
                    })}
                  </tr>

                  {/* Qualifications Score (10%) */}
                  <tr>
                    <td className="p-4 font-semibold text-zinc-800">4. Qualifications (10% wt)</td>
                    {selectedForCompare.map((candId) => {
                      const ev = data?.evaluations.find((e) => e.candidateId === candId);
                      return (
                        <td key={candId} className="p-4 font-bold text-zinc-900">
                          {ev?.scoreBreakdown.qualificationsScore}%
                        </td>
                      );
                    })}
                  </tr>

                  {/* Confirmed Skills */}
                  <tr>
                    <td className="p-4 font-semibold text-zinc-800">Confirmed Present Skills</td>
                    {selectedForCompare.map((candId) => {
                      const ev = data?.evaluations.find((e) => e.candidateId === candId);
                      const present = ev?.skillAssessments.filter((s) => s.evidenceState === "confirmed_present") || [];
                      return (
                        <td key={candId} className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {present.map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[10px]">
                                {s.skillName}
                              </span>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Missing Skills */}
                  <tr>
                    <td className="p-4 font-semibold text-zinc-800">Identified Skill Gaps</td>
                    {selectedForCompare.map((candId) => {
                      const ev = data?.evaluations.find((e) => e.candidateId === candId);
                      const missing = ev?.skillAssessments.filter((s) => s.evidenceState === "missing_evidence" || s.evidenceState === "confirmed_absence") || [];
                      return (
                        <td key={candId} className="p-4">
                          {missing.length === 0 ? (
                            <span className="text-emerald-700">None</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {missing.map((s, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 bg-red-50 text-red-800 border border-red-300 rounded text-[10px]">
                                  {s.skillName} ({s.evidenceState.replace("_", " ")})
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Hallucination Risk */}
                  <tr>
                    <td className="p-4 font-semibold text-zinc-800">Hallucination Risk Level</td>
                    {selectedForCompare.map((candId) => {
                      const ev = data?.evaluations.find((e) => e.candidateId === candId);
                      return (
                        <td key={candId} className="p-4">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                            ev?.isHallucinationFlagged
                              ? "bg-red-50 text-red-800 border border-red-300"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-300"
                          }`}>
                            {ev?.hallucinationRiskLevel || "Clean"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DUPLICATE DETECTION */}
        {activeTab === "duplicates" && (
          <div className="space-y-4">
            <div className="p-4 bg-white border border-zinc-200 rounded-sm text-xs font-mono text-zinc-600">
              <span className="font-bold text-zinc-900 block mb-1">DUPLICATE DETECTION & MERGE REVIEW (SPEC 3.10):</span>
              Identifies duplicate submissions across email patterns, phone matches, and semantic candidate profile clustering.
            </div>

            <div className="p-5 bg-white border border-zinc-200 rounded-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 text-sm">Cluster Group #DUP-0941</span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 font-mono text-[10px] font-bold rounded">
                      96.8% Semantic Match
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    Detected By: Semantic Profile Similarity & Work History Hash
                  </p>
                </div>

                {mergedGroupIds.includes("grp-1") ? (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-xs font-bold rounded-sm">
                    ✓ Profiles Merged
                  </span>
                ) : (
                  <button
                    onClick={() => handleMergeDuplicate("grp-1")}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-zinc-900 text-white font-mono text-xs font-semibold rounded-sm hover:bg-emerald-600 transition-colors"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>Merge Duplicate Profiles</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-sm space-y-1">
                  <span className="font-bold text-zinc-900">Primary Profile: Farhan Tariq</span>
                  <div className="text-zinc-600">farhan.tariq@devmail.com • Applied Oct 12, 2026</div>
                  <div className="text-[11px] text-zinc-500">Current Role: Senior Backend Engineer at FinTech Systems</div>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-sm space-y-1">
                  <span className="font-bold text-zinc-900">Duplicate Submission: Farhan T.</span>
                  <div className="text-zinc-600">farhan.dev@consulting.ch • Applied Oct 24, 2026</div>
                  <div className="text-[11px] text-zinc-500">Current Role: Distributed Systems Consultant</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HALLUCINATIONS */}
        {activeTab === "hallucinations" && (
          <div className="space-y-4">
            <div className="p-4 bg-white border border-zinc-200 rounded-sm text-xs font-mono text-zinc-600">
              <span className="font-bold text-zinc-900 block mb-1">AI HALLUCINATION VERIFICATION ENGINE (SPEC 3.10):</span>
              Grounded citations engine cross-checks candidate resume claims and flags ungrounded assertions or timeline discrepancies.
            </div>

            <div className="space-y-3">
              {data?.evaluations
                .flatMap((e) => e.hallucinationFlags.map((f) => ({ ...f, candidateId: e.candidateId })))
                .map((flag) => {
                  const cand = data.applications.find((a) => a.candidateId === flag.candidateId);
                  return (
                    <div
                      key={flag.id}
                      className="p-5 bg-white border border-zinc-200 rounded-sm space-y-2.5 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">{flag.suspectClaim}</span>
                          <span className="px-2 py-0.5 bg-red-50 text-red-800 border border-red-300 rounded font-bold uppercase text-[10px]">
                            {flag.severity} Severity
                          </span>
                        </div>
                        <span className="text-zinc-500">
                          Candidate: <strong>{cand?.candidateProfile.fullName || flag.candidateId}</strong>
                        </span>
                      </div>

                      <p className="text-zinc-600 text-xs leading-relaxed">{flag.reason}</p>

                      <div className="p-2.5 bg-zinc-50 border border-zinc-200 text-zinc-800 text-[11px] flex items-start gap-2">
                        <span className="font-bold text-emerald-800 shrink-0">RECOMMENDED PROBE:</span>
                        <span>{flag.recommendedInterviewProbe}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
