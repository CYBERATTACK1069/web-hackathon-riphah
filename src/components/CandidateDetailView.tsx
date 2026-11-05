"use client";

import React, { useState } from "react";
import {
  ApplicationRecord,
  ApplicationStage,
  MatchEvaluation,
  ParsedResume,
  InterviewQuestion,
  InterviewSchedule,
  UserRole,
  EvidenceState,
} from "@/types/platform";
import { RadarScorecardChart } from "./RadarScorecardChart";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
} from "lucide-react";

interface CandidateDetailViewProps {
  application: ApplicationRecord;
  evaluation?: MatchEvaluation;
  resume?: ParsedResume;
  questions: InterviewQuestion[];
  schedule?: InterviewSchedule;
  currentRole: UserRole;
  onAdvanceStage: (applicationId: string, nextStage: ApplicationStage, notes?: string) => Promise<void>;
  isAdvancingStage: boolean;
}

const PIPELINE_STAGES: { stage: ApplicationStage; label: string; index: number }[] = [
  { stage: "applied", label: "Applied", index: 1 },
  { stage: "screening", label: "Screening", index: 2 },
  { stage: "ai_evaluated", label: "AI Evaluated", index: 3 },
  { stage: "interview_scheduled", label: "Scheduled", index: 4 },
  { stage: "interview_completed", label: "Interviewed", index: 5 },
  { stage: "offer_extended", label: "Offer", index: 6 },
  { stage: "hired", label: "Hired", index: 7 },
];

export const CandidateDetailView: React.FC<CandidateDetailViewProps> = ({
  application,
  evaluation,
  resume,
  questions,
  schedule,
  currentRole,
  onAdvanceStage,
  isAdvancingStage,
}) => {
  const [activeTab, setActiveTab] = useState<"match" | "excerpts" | "questions" | "audit">("match");
  const [selectedExcerptId, setSelectedExcerptId] = useState<string | null>(null);

  // Helper for rendering evidence state badges
  const renderEvidenceBadge = (state: EvidenceState) => {
    switch (state) {
      case "confirmed_present":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            CONFIRMED PRESENT
          </span>
        );
      case "partial_evidence":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 font-semibold">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            PARTIAL EVIDENCE
          </span>
        );
      case "missing_evidence":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-300 font-semibold">
            <HelpCircle className="w-3 h-3 text-zinc-500" />
            MISSING EVIDENCE (UNCONFIRMED)
          </span>
        );
      case "confirmed_absence":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-300 font-semibold">
            <XCircle className="w-3 h-3 text-rose-600" />
            CONFIRMED ABSENCE
          </span>
        );
    }
  };

  const currentStageIndex = PIPELINE_STAGES.find((s) => s.stage === application.currentStage)?.index || 1;

  return (
    <div className="space-y-6">
      {/* 1. Header Profile Banner & 7 Pipeline Stages */}
      <div className="swiss-card">
        <div className="swiss-card-header flex flex-wrap items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-zinc-950 text-emerald-400 flex items-center justify-center font-mono font-bold text-lg border border-zinc-700">
              {application.candidateProfile.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-zinc-900">{application.candidateProfile.fullName}</h2>
                <span className="font-mono text-xs text-zinc-400">({application.candidateProfile.email})</span>
              </div>
              <p className="text-xs text-zinc-600">{application.candidateProfile.headline}</p>
            </div>
          </div>

          {/* Quick Action for Recruiter: Stage Advance */}
          {currentRole === "recruiter" && (
            <div className="flex items-center gap-2">
              {currentStageIndex < 7 && (
                <button
                  disabled={isAdvancingStage}
                  onClick={() => {
                    const nextStage = PIPELINE_STAGES[currentStageIndex].stage;
                    onAdvanceStage(application.id, nextStage);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-white bg-emerald-700 hover:bg-emerald-800 border border-emerald-800 transition-colors disabled:opacity-50"
                >
                  <span>ADVANCE TO: {PIPELINE_STAGES[currentStageIndex].label.toUpperCase()}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 7 Pipeline Stages Ribbon */}
        <div className="p-4 bg-zinc-50 border-b border-zinc-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] font-semibold text-zinc-500 uppercase">
              // Strict 7-Stage Governance Pipeline
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              STAGE {currentStageIndex} OF 7:{" "}
              <strong className="text-zinc-900 uppercase">{application.currentStage.replace("_", " ")}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1">
            {PIPELINE_STAGES.map((s) => {
              const isPast = s.index < currentStageIndex;
              const isCurrent = s.index === currentStageIndex;

              return (
                <div
                  key={s.stage}
                  className={`p-2 border text-center transition-all ${
                    isCurrent
                      ? "bg-emerald-700 text-white border-emerald-800 shadow-sm"
                      : isPast
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : "bg-white text-zinc-400 border-zinc-200"
                  }`}
                >
                  <div className="font-mono text-[10px] opacity-75">{s.index}.0</div>
                  <div className="text-xs font-semibold tracking-tight truncate">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-zinc-200 bg-white px-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab("match")}
            className={`py-3 px-4 border-b-2 font-medium transition-colors ${
              activeTab === "match"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            MATCH EVALUATION (50/25/15/10)
          </button>
          <button
            onClick={() => setActiveTab("excerpts")}
            className={`py-3 px-4 border-b-2 font-medium transition-colors ${
              activeTab === "excerpts"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            GROUNDED EXCERPTS ({resume?.excerptMapping.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`py-3 px-4 border-b-2 font-medium transition-colors ${
              activeTab === "questions"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            DYNAMIC INTERVIEW RUBRICS ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`py-3 px-4 border-b-2 font-medium transition-colors ${
              activeTab === "audit"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            AUDIT TRAIL LOG ({application.auditTrail.length})
          </button>
        </div>
      </div>

      {/* 2. Hallucination Risk Alert Banner */}
      {evaluation?.isHallucinationFlagged && (
        <div className="border border-rose-400 bg-rose-50/80 p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-sm font-bold text-rose-900 tracking-tight font-mono">
                  CRITICAL HALLUCINATION & TEMPORAL DISCREPANCY DETECTED
                </h4>
                <span className="font-mono text-[11px] px-2 py-0.5 bg-rose-200 text-rose-900 font-bold uppercase rounded-sm">
                  RISK LEVEL: {evaluation.hallucinationRiskLevel}
                </span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                The automated verification engine uncovered mathematical contradictions and ungrounded seniority claims.
              </p>

              <div className="space-y-2 pt-2">
                {evaluation.hallucinationFlags.map((flag) => (
                  <div key={flag.id} className="p-3 bg-white border border-rose-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-rose-700 uppercase text-[11px]">
                        [{flag.claimType.replace("_", " ")}]
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">
                        CONFIDENCE: {Math.round(flag.detectedConfidence * 100)}%
                      </span>
                    </div>
                    <div className="text-zinc-900 font-medium mb-1">"{flag.suspectClaim}"</div>
                    <p className="text-zinc-600 text-[11px] mb-1.5">{flag.reason}</p>
                    <div className="bg-zinc-50 p-2 border-l-2 border-rose-500 text-[11px] text-zinc-700 font-mono">
                      <strong>MANDATORY PROBE:</strong> {flag.recommendedInterviewProbe}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 1: Match Evaluation & 50/25/15/10 Score Breakdown */}
      {activeTab === "match" && evaluation && (
        <div className="space-y-6">
          {/* Strict 50 / 25 / 15 / 10 Formula Ribbon */}
          <div className="swiss-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 mb-4 border-b border-zinc-200">
              <div>
                <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
                  // Composite Score Calculation
                </span>
                <h3 className="text-base font-bold text-zinc-900">
                  Strict Weighted Formula: (50% Skills) + (25% Experience) + (15% Projects) + (10% Qualifications)
                </h3>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-zinc-500 uppercase block">FINAL COMPOSITE SCORE</span>
                <span className="font-mono text-3xl font-extrabold text-emerald-800">
                  {evaluation.scoreBreakdown.compositeScore.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 bg-zinc-50 border border-zinc-200">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-600">1. Skills (50%)</span>
                  <span className="font-bold text-zinc-900">{evaluation.scoreBreakdown.skillsScore.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 mb-2">
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${evaluation.scoreBreakdown.skillsScore}%` }}
                  />
                </div>
                <div className="text-[11px] font-mono text-zinc-500">
                  Contribution: <strong>{(evaluation.scoreBreakdown.skillsScore * 0.5).toFixed(1)} pts</strong>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 border border-zinc-200">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-600">2. Experience (25%)</span>
                  <span className="font-bold text-zinc-900">{evaluation.scoreBreakdown.experienceScore.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 mb-2">
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${evaluation.scoreBreakdown.experienceScore}%` }}
                  />
                </div>
                <div className="text-[11px] font-mono text-zinc-500">
                  Contribution: <strong>{(evaluation.scoreBreakdown.experienceScore * 0.25).toFixed(1)} pts</strong>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 border border-zinc-200">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-600">3. Projects (15%)</span>
                  <span className="font-bold text-zinc-900">{evaluation.scoreBreakdown.projectsScore.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 mb-2">
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${evaluation.scoreBreakdown.projectsScore}%` }}
                  />
                </div>
                <div className="text-[11px] font-mono text-zinc-500">
                  Contribution: <strong>{(evaluation.scoreBreakdown.projectsScore * 0.15).toFixed(1)} pts</strong>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 border border-zinc-200">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-600">4. Qualifications (10%)</span>
                  <span className="font-bold text-zinc-900">
                    {evaluation.scoreBreakdown.qualificationsScore.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-200 h-2 mb-2">
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${evaluation.scoreBreakdown.qualificationsScore}%` }}
                  />
                </div>
                <div className="text-[11px] font-mono text-zinc-500">
                  Contribution: <strong>{(evaluation.scoreBreakdown.qualificationsScore * 0.1).toFixed(1)} pts</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Recharts Multi-Axis Radar Scorecard */}
          <RadarScorecardChart
            candidateName={application.candidateProfile.fullName}
            scores={{
              skills: evaluation.scoreBreakdown.skillsScore,
              experience: evaluation.scoreBreakdown.experienceScore,
              projects: evaluation.scoreBreakdown.projectsScore,
              qualifications: evaluation.scoreBreakdown.qualificationsScore,
            }}
          />

          {/* Skill Evidence Matrix: Separating Missing Evidence from Confirmed Absence */}
          <div className="swiss-card">
            <div className="swiss-card-header flex items-center justify-between bg-white">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 font-mono uppercase tracking-wider">
                  // Skill Evidence Verification Matrix
                </h3>
                <p className="text-xs text-zinc-500">
                  Separating verified evidence, unmentioned claims (missing evidence), and confirmed contradictions (confirmed absence).
                </p>
              </div>
              <span className="font-mono text-xs text-zinc-400">4 CORE REQUIREMENTS</span>
            </div>

            <div className="divide-y divide-zinc-200">
              {evaluation.skillAssessments.map((skill) => (
                <div key={skill.skillName} className="p-4 bg-white">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-zinc-900">{skill.skillName}</span>
                      <span className="font-mono text-xs text-zinc-500">
                        (Weight: {Math.round(skill.requiredWeight * 100)}%)
                      </span>
                      {renderEvidenceBadge(skill.evidenceState)}
                    </div>

                    <div className="font-mono text-xs text-right">
                      <span className="text-zinc-500">Tenure: </span>
                      <strong>
                        {skill.candidateYearsFound}y found / {skill.requiredYears}y required
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-700 leading-relaxed mb-2.5">{skill.justification}</p>

                  {/* Probing Alert if Missing Evidence */}
                  {skill.verificationNeeded && skill.suggestedProbingQuestion && (
                    <div className="bg-amber-50/60 p-2.5 border-l-2 border-amber-500 text-xs text-zinc-800 font-mono mb-2">
                      <span className="text-amber-800 font-bold uppercase text-[10px] block mb-0.5">
                        [AUTOMATED INTERVIEW VERIFICATION PROBE]
                      </span>
                      {skill.suggestedProbingQuestion}
                    </div>
                  )}

                  {/* Grounded Citation Links */}
                  {skill.relevantExcerptIds.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-[11px] font-mono text-zinc-400">Grounded Citations:</span>
                      {skill.relevantExcerptIds.map((cid) => (
                        <button
                          key={cid}
                          onClick={() => {
                            setActiveTab("excerpts");
                            setSelectedExcerptId(cid);
                          }}
                          className="font-mono text-[10px] px-1.5 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 rounded-sm inline-flex items-center gap-1 transition-colors"
                        >
                          <span>{cid}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Executive Summary */}
          <div className="swiss-card p-5 bg-white">
            <h4 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              // Executive Evaluation Synthesis
            </h4>
            <p className="text-xs text-zinc-800 leading-relaxed mb-4">{evaluation.executiveSummary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
              <div>
                <h5 className="font-mono text-[11px] font-bold text-zinc-600 uppercase mb-2">
                  Recommendation Rationale
                </h5>
                <ul className="space-y-1 text-xs text-zinc-700">
                  {evaluation.recommendationReasoning.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">›</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-mono text-[11px] font-bold text-zinc-600 uppercase mb-2">
                  Targeted Interview Focus
                </h5>
                <ul className="space-y-1 text-xs text-zinc-700">
                  {evaluation.targetedInterviewFocusAreas.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">›</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: Grounded Excerpt Mapping */}
      {activeTab === "excerpts" && resume && (
        <div className="swiss-card">
          <div className="swiss-card-header flex items-center justify-between bg-white">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 font-mono uppercase tracking-wider">
                // Grounded Excerpt Mapping ({resume.excerptMapping.length} Citations)
              </h3>
              <p className="text-xs text-zinc-500">
                Direct character-indexed references extracted from raw resume text for hallucination verification.
              </p>
            </div>
            <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
              PARSING CONFIDENCE: {Math.round(resume.parsingConfidence * 100)}%
            </span>
          </div>

          <div className="divide-y divide-zinc-200">
            {resume.excerptMapping.map((cit) => {
              const isSelected = cit.id === selectedExcerptId;
              return (
                <div
                  key={cit.id}
                  className={`p-4 transition-colors ${
                    isSelected ? "bg-emerald-50/40 border-l-4 border-emerald-600" : "bg-white hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-900">{cit.id}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-200 uppercase">
                        {cit.targetField.replace("_", " ")}
                      </span>
                      <span className="text-xs font-semibold text-emerald-800">
                        {cit.associatedIdentifier}
                      </span>
                    </div>

                    <div className="font-mono text-[11px] text-zinc-400">
                      Chars: [{cit.characterStart} - {cit.characterEnd}] // Confidence:{" "}
                      {Math.round(cit.confidence * 100)}%
                    </div>
                  </div>

                  <blockquote className="text-xs text-zinc-800 bg-zinc-50 p-2.5 border-l-2 border-zinc-300 font-mono italic mb-1.5">
                    "{cit.excerptText}"
                  </blockquote>

                  <p className="text-[11px] text-zinc-500">
                    <strong className="text-zinc-600 font-mono">Surrounding Context:</strong> {cit.contextSnippet}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TAB 3: Dynamic Interview Rubrics */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          <div className="swiss-card p-4 bg-white flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 font-mono uppercase tracking-wider">
                // Dynamic AI Interview Questions & Scoring Rubrics
              </h3>
              <p className="text-xs text-zinc-500">
                Generated dynamically to verify claims, probe missing evidence, and evaluate architectural depth.
              </p>
            </div>
            {schedule && (
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  INTERVIEW SCHEDULED: {new Date(schedule.scheduledAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="swiss-card bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-3 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-900">{q.id}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-200 uppercase">
                      {q.category.replace("_", " ")}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 font-mono">
                      TOPIC: {q.targetSkillOrTopic}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] px-2 py-0.5 bg-zinc-100 text-zinc-800 font-semibold uppercase">
                    DIFFICULTY: {q.difficulty}
                  </span>
                </div>

                <div className="text-sm font-medium text-zinc-900 mb-3 leading-relaxed">
                  "{q.questionText}"
                </div>

                <div className="p-2.5 bg-zinc-50 border-l-2 border-emerald-600 text-xs text-zinc-700 font-mono mb-4">
                  <strong className="text-emerald-800 uppercase text-[10px] block mb-0.5">
                    // AI Generation Rationale
                  </strong>
                  {q.contextReasoning}
                </div>

                {/* Expected Signals & Red Flags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
                  <div className="p-3 bg-emerald-50/50 border border-emerald-200">
                    <h5 className="font-mono text-[11px] font-bold text-emerald-800 uppercase mb-2">
                      ✓ Expected Positive Signals
                    </h5>
                    <ul className="space-y-1 text-zinc-700">
                      {q.expectedSignals.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-rose-50/50 border border-rose-200">
                    <h5 className="font-mono text-[11px] font-bold text-rose-800 uppercase mb-2">
                      ⚠ Red Flag Indicators
                    </h5>
                    <ul className="space-y-1 text-zinc-700">
                      {q.redFlagIndicators.map((rf, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-600 font-bold">•</span>
                          <span>{rf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Rubric Levels */}
                <div className="border-t border-zinc-200 pt-3">
                  <span className="font-mono text-[11px] font-bold text-zinc-500 uppercase block mb-2">
                    Scoring Rubric: {q.rubric.criteria}
                  </span>
                  <div className="space-y-2">
                    {q.rubric.levels.map((lvl) => (
                      <div key={lvl.score} className="p-2.5 bg-zinc-50 border border-zinc-200 text-xs flex gap-3">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 bg-white border border-zinc-300 text-zinc-900 shrink-0">
                          {lvl.score} / 5
                        </span>
                        <div>
                          <p className="text-zinc-800 font-medium mb-1">{lvl.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {lvl.signalsToLookFor.map((sig, i) => (
                              <span
                                key={i}
                                className="font-mono text-[10px] px-1.5 py-0.2 bg-white text-zinc-600 border border-zinc-200"
                              >
                                {sig}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 4: Timestamped Audit Trail Log */}
      {activeTab === "audit" && (
        <div className="swiss-card">
          <div className="swiss-card-header flex items-center justify-between bg-white">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 font-mono uppercase tracking-wider">
                // Application Audit Trail Log ({application.auditTrail.length} Immutable Entries)
              </h3>
              <p className="text-xs text-zinc-500">
                ISO-compliant event history tracking every stage change, model evaluation, and actor interaction.
              </p>
            </div>
            <span className="font-mono text-xs text-zinc-400">IMMUTABLE LOG</span>
          </div>

          <div className="divide-y divide-zinc-200 font-mono text-xs">
            {application.auditTrail.map((entry) => (
              <div key={entry.id} className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-bold">{entry.action}</span>
                    <span className="text-zinc-300">//</span>
                    <span className="text-[11px] px-1.5 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-200 uppercase">
                      STAGE: {entry.newStage}
                    </span>
                  </div>
                  {entry.notes && <p className="text-zinc-600 font-sans text-xs">{entry.notes}</p>}
                </div>

                <div className="text-right shrink-0 text-zinc-500 text-[11px]">
                  <div>{new Date(entry.timestamp).toLocaleString()}</div>
                  <div className="text-zinc-400 text-[10px]">
                    ACTOR: {entry.actor.name} ({entry.actor.role})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

