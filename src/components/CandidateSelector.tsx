"use client";

import React from "react";
import { ApplicationRecord, MatchEvaluation } from "@/types/platform";
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, Award } from "lucide-react";

interface CandidateSelectorProps {
  applications: ApplicationRecord[];
  evaluations: MatchEvaluation[];
  selectedCandidateId: string;
  onSelectCandidate: (candidateId: string) => void;
}

export const CandidateSelector: React.FC<CandidateSelectorProps> = ({
  applications,
  evaluations,
  selectedCandidateId,
  onSelectCandidate,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
          // Pipeline Candidates (3 Pre-Seeded Profiles)
        </h3>
        <span className="text-[11px] font-mono text-zinc-400">
          SELECT CANDIDATE PROFILE TO INSPECT CONTRACT & EVALUATION
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {applications.map((app) => {
          const evalMatch = evaluations.find((e) => e.candidateId === app.candidateId);
          const isSelected = app.candidateId === selectedCandidateId;

          let verdictColor = "border-zinc-200 bg-white hover:border-zinc-300";
          let badgeColor = "bg-zinc-100 text-zinc-800 border-zinc-200";
          let scoreColor = "text-zinc-900";

          if (evalMatch?.verdict === "strong_match") {
            badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-300";
            scoreColor = "text-emerald-700";
          } else if (evalMatch?.verdict === "potential_match") {
            badgeColor = "bg-amber-50 text-amber-800 border-amber-300";
            scoreColor = "text-amber-700";
          } else if (evalMatch?.verdict === "mismatch") {
            badgeColor = "bg-rose-50 text-rose-800 border-rose-300";
            scoreColor = "text-rose-700";
          }

          if (isSelected) {
            verdictColor = "border-emerald-600 ring-1 ring-emerald-600 bg-emerald-50/20";
          }

          return (
            <button
              key={app.id}
              onClick={() => onSelectCandidate(app.candidateId)}
              className={`p-3.5 text-left border transition-all relative ${verdictColor}`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-600" />
              )}

              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-zinc-400">{app.id}</span>
                    <span className="text-zinc-300">//</span>
                    <span className="font-semibold text-sm text-zinc-900">{app.candidateProfile.fullName}</span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-1">{app.candidateProfile.headline}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-mono text-base font-bold ${scoreColor}`}>
                    {evalMatch ? `${evalMatch.scoreBreakdown.compositeScore.toFixed(1)}%` : "N/A"}
                  </span>
                </div>
              </div>

              {/* Status Ribbon & Indicators */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[11px] font-mono">
                <span className="text-zinc-600 uppercase">
                  STAGE: <strong className="text-zinc-900">{app.currentStage.replace("_", " ")}</strong>
                </span>

                {evalMatch?.isHallucinationFlagged ? (
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                    <ShieldAlert className="w-3 h-3 text-rose-600" />
                    HALLUCINATION ALERT
                  </span>
                ) : evalMatch?.verdict === "strong_match" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Award className="w-3 h-3 text-emerald-600" />
                    BENCHMARK FIT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    EVIDENCE GAP
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

