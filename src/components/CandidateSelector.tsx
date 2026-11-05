"use client";

import React, { useRef, useState } from "react";
import { ApplicationRecord, MatchEvaluation, ParsedResume, InterviewQuestion } from "@/types/platform";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Award,
  UploadCloud,
  FileText,
  Sparkles,
  RefreshCw,
  Plus,
} from "lucide-react";
import { ALL_DEMO_RESUMES, DemoResumeItem } from "@/lib/demo-resumes";

interface CandidateSelectorProps {
  applications: ApplicationRecord[];
  evaluations: MatchEvaluation[];
  selectedCandidateId: string;
  onSelectCandidate: (candidateId: string) => void;
  onCandidateAdded?: (candidateData: {
    application: ApplicationRecord;
    evaluation: MatchEvaluation;
    resume: ParsedResume;
    questions?: InterviewQuestion[];
  }) => void;
}

export const CandidateSelector: React.FC<CandidateSelectorProps> = ({
  applications,
  evaluations,
  selectedCandidateId,
  onSelectCandidate,
  onCandidateAdded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus(`Parsing & Evaluating ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("saveToStore", "true");

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data) {
        const candidateId = json.data.resume.candidateId || `cand-${Date.now().toString(36)}`;
        setUploadStatus(`Evaluated ${json.data.resume.contactInfo?.fullName || file.name}!`);

        if (onCandidateAdded) {
          const application: ApplicationRecord = {
            id: `app-${candidateId}`,
            candidateId,
            jobId: "job-backend-001",
            resumeId: json.data.resume.id || `res-${candidateId}`,
            evaluationId: json.data.evaluation?.id,
            appliedDate: new Date().toISOString(),
            currentStage:
              json.data.evaluation?.verdict === "strong_match"
                ? "interview_scheduled"
                : "ai_evaluated",
            lastUpdated: new Date().toISOString(),
            candidateProfile: {
              fullName: json.data.resume.contactInfo?.fullName || "Candidate",
              email: json.data.resume.contactInfo?.email || "",
              phone: json.data.resume.contactInfo?.phone,
              location: json.data.resume.contactInfo?.location || "",
              headline:
                json.data.resume.workExperience?.[0]?.title ||
                json.data.resume.summary?.slice(0, 60) ||
                "Backend Engineer",
            },
            auditTrail: [
              {
                id: `aud-upload-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: `Resume Uploaded (${file.name})`,
                previousStage: undefined,
                newStage: "applied",
                actor: {
                  id: candidateId,
                  name: json.data.resume.contactInfo?.fullName || "Candidate",
                  role: "candidate",
                },
                notes: `Uploaded ${file.name} (${json.data.resume.fileMetadata?.fileSizeKB || 10}KB). Computed 50/25/15/10 match score: ${json.data.evaluation?.scoreBreakdown?.compositeScore}%.`,
              },
            ],
            tags: [
              "Direct Upload",
              json.data.evaluation?.verdict?.replace("_", " ").toUpperCase() || "EVALUATED",
            ],
          };

          onCandidateAdded({
            application,
            evaluation: json.data.evaluation,
            resume: json.data.resume,
            questions: json.data.dynamicQuestions,
          });
        }
      } else {
        setUploadStatus(`Upload failed: ${json.error || "Unknown error"}`);
      }
    } catch (err: unknown) {
      setUploadStatus(`Upload error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadDemoResume = async (demo: DemoResumeItem) => {
    // If candidate with this name is already in applications, just select them
    const existing = applications.find(
      (a) => a.candidateProfile.fullName.toLowerCase() === demo.name.toLowerCase()
    );
    if (existing) {
      onSelectCandidate(existing.candidateId);
      return;
    }

    setIsUploading(true);
    setUploadStatus(`Evaluating ${demo.name}...`);

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: demo.rawText,
          fileName: demo.targetFileName,
          saveToStore: true,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const candidateId = json.data.resume.candidateId || `cand-${Date.now().toString(36)}`;
        setUploadStatus(`Evaluated ${demo.name} (${json.data.evaluation?.scoreBreakdown?.compositeScore}%)`);

        if (onCandidateAdded) {
          const application: ApplicationRecord = {
            id: `app-${candidateId}`,
            candidateId,
            jobId: "job-backend-001",
            resumeId: json.data.resume.id || `res-${candidateId}`,
            evaluationId: json.data.evaluation?.id,
            appliedDate: new Date().toISOString(),
            currentStage:
              json.data.evaluation?.verdict === "strong_match"
                ? "interview_scheduled"
                : "ai_evaluated",
            lastUpdated: new Date().toISOString(),
            candidateProfile: {
              fullName: json.data.resume.contactInfo?.fullName || demo.name,
              email: json.data.resume.contactInfo?.email || "",
              phone: json.data.resume.contactInfo?.phone,
              location: json.data.resume.contactInfo?.location || "",
              headline:
                json.data.resume.workExperience?.[0]?.title ||
                json.data.resume.summary?.slice(0, 60) ||
                "Backend Engineer",
            },
            auditTrail: [
              {
                id: `aud-demo-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: `Section 6 Demo Ingested (${demo.targetFileName})`,
                previousStage: undefined,
                newStage: "applied",
                actor: { id: candidateId, name: demo.name, role: "candidate" },
                notes: `Loaded mandatory demo scenario: ${demo.description}`,
              },
            ],
            tags: [
              "Section 6 Demo",
              json.data.evaluation?.verdict?.replace("_", " ").toUpperCase() || "EVALUATED",
            ],
          };

          onCandidateAdded({
            application,
            evaluation: json.data.evaluation,
            resume: json.data.resume,
            questions: json.data.dynamicQuestions,
          });
        }
      }
    } catch (err: unknown) {
      setUploadStatus(`Load error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-6 space-y-3">
      {/* Header Bar with Direct Upload & Demo Loaders */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-zinc-900 uppercase">
              // Candidate Pipeline & Live PDF Upload
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-zinc-100 text-zinc-600 border border-zinc-200">
              {applications.length} Profiles Active
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Select an applicant to view Match Breakdown (50/25/15/10), Grounded Excerpts, Dynamic Rubrics, and Audit Log.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              e.target.value = "";
            }}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-semibold rounded-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {isUploading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
            <span>UPLOAD RESUME (PDF / TXT)</span>
          </button>
        </div>
      </div>

      {/* Quick 1-Click Mandatory Demo Candidates Ribbon */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-zinc-50 border border-zinc-200 text-xs font-mono">
        <span className="text-zinc-500 font-bold shrink-0">// SECTION 6 DEMOS:</span>
        {ALL_DEMO_RESUMES.map((demo) => {
          const isCurrentActive =
            applications.find((a) => a.candidateId === selectedCandidateId)
              ?.candidateProfile.fullName.toLowerCase() === demo.name.toLowerCase();

          return (
            <button
              key={demo.id}
              onClick={() => handleLoadDemoResume(demo)}
              disabled={isUploading}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-medium border transition-colors ${
                isCurrentActive
                  ? "bg-emerald-700 text-white border-emerald-800 font-bold"
                  : "bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300"
              }`}
            >
              <FileText className="w-3 h-3 text-zinc-400" />
              <span>{demo.name}</span>
              <span className="text-[10px] opacity-75">({demo.badge.split(" ")[0]})</span>
            </button>
          );
        })}

        {uploadStatus && (
          <span className="ml-auto text-emerald-700 font-mono text-[11px] truncate max-w-xs">
            {uploadStatus}
          </span>
        )}
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {applications.map((app) => {
          const evalMatch = evaluations.find((e) => e.candidateId === app.candidateId);
          const isSelected = app.candidateId === selectedCandidateId;

          let verdictColor = "border-zinc-200 bg-white hover:border-zinc-300";
          let scoreColor = "text-zinc-900";

          if (evalMatch?.verdict === "strong_match") {
            scoreColor = "text-emerald-700";
          } else if (evalMatch?.verdict === "potential_match") {
            scoreColor = "text-amber-700";
          } else if (evalMatch?.verdict === "requires_investigation") {
            scoreColor = "text-rose-700";
          } else if (evalMatch?.verdict === "mismatch") {
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
                    <span className="font-semibold text-sm text-zinc-900">
                      {app.candidateProfile.fullName}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-1">
                    {app.candidateProfile.headline}
                  </p>
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
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    <Award className="w-3 h-3 text-emerald-600" />
                    BENCHMARK FIT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
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
