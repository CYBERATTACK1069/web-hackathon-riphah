"use client";

import React, { useState, useEffect } from "react";
import {
  PlatformDatabaseSchema,
  ApplicationRecord,
  ApplicationStage,
  MatchEvaluation,
} from "@/types/platform";
import { SwissHeader } from "@/components/SwissHeader";
import {
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  User,
  Clock,
  FileText,
  ChevronRight,
  Filter,
  MessageSquare,
  Plus,
} from "lucide-react";

const PIPELINE_COLUMNS: { stage: ApplicationStage; label: string }[] = [
  { stage: "applied", label: "1. Applied" },
  { stage: "screening", label: "2. Screening" },
  { stage: "ai_evaluated", label: "3. AI Evaluated" },
  { stage: "interview_scheduled", label: "4. Scheduled" },
  { stage: "interview_completed", label: "5. Interviewed" },
  { stage: "offer_extended", label: "6. Offer" },
  { stage: "hired", label: "7. Hired" },
];

export default function PipelinePage() {
  const [data, setData] = useState<PlatformDatabaseSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [blindMode, setBlindMode] = useState(false);
  const [selectedAppAudit, setSelectedAppAudit] = useState<ApplicationRecord | null>(null);
  const [movingAppId, setMovingAppId] = useState<string | null>(null);

  // Recruiter Note State (Spec 3.6)
  const [activeNoteApp, setActiveNoteApp] = useState<ApplicationRecord | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

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
      console.error("Failed to load pipeline data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStage = async (appId: string, currentStage: ApplicationStage) => {
    const currentIndex = PIPELINE_COLUMNS.findIndex((c) => c.stage === currentStage);
    if (currentIndex === -1 || currentIndex >= PIPELINE_COLUMNS.length - 1) return;

    const nextStage = PIPELINE_COLUMNS[currentIndex + 1].stage;
    setMovingAppId(appId);

    try {
      const res = await fetch("/api/platform/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appId,
          newStage: nextStage,
          actor: { id: "usr-recruiter-01", name: "Elena Vance", role: "recruiter" },
          notes: `Recruiter advanced application from ${currentStage} to ${nextStage}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMovingAppId(null);
    }
  };

  const handleSaveNote = async () => {
    if (!activeNoteApp || !noteInput.trim()) return;
    setIsSavingNote(true);
    try {
      const res = await fetch("/api/platform/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_note",
          applicationId: activeNoteApp.id,
          note: noteInput.trim(),
          actor: { id: "usr-recruiter-01", name: "Elena Vance", role: "recruiter" },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNoteInput("");
        setActiveNoteApp(null);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingNote(false);
    }
  };

  const getEvaluationForCandidate = (candId: string) => {
    return data?.evaluations.find((e) => e.candidateId === candId);
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

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8 space-y-6">
        {/* Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 mb-1">
              <span>TALENTSWISS</span>
              <span>/</span>
              <span className="text-zinc-900 font-semibold">APPLICATION PIPELINE</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Visual 7-Stage Pipeline Kanban & Audit Trail
            </h1>
            <p className="text-xs text-zinc-600 mt-1">
              Functional Spec 3.6: Multi-stage pipeline with strict chronological ISO audit logging and recruiter notes.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-500">Applications Active:</span>
            <span className="font-bold text-zinc-900 bg-white border border-zinc-200 px-2.5 py-1 rounded-sm">
              {data?.applications.length || 0} Candidates
            </span>
          </div>
        </div>

        {/* Visual Pipeline Board */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map((col, colIdx) => {
            const appsInCol =
              data?.applications.filter((a) => a.currentStage === col.stage) || [];

            return (
              <div
                key={col.stage}
                className="bg-white border border-zinc-200 rounded-sm flex flex-col min-w-[210px] min-h-[480px]"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-zinc-200 bg-zinc-50/80 flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-zinc-800">{col.label}</span>
                  <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center text-[10px] font-bold">
                    {appsInCol.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-2 flex-1 space-y-2.5 overflow-y-auto">
                  {appsInCol.map((app) => {
                    const evalItem = getEvaluationForCandidate(app.candidateId);
                    const displayName = blindMode
                      ? `Candidate #${app.candidateId.slice(-4).toUpperCase()}`
                      : app.candidateProfile.fullName;

                    return (
                      <div
                        key={app.id}
                        className="p-3 bg-white border border-zinc-200 rounded-sm shadow-2xs space-y-2 hover:border-zinc-400 transition-all text-xs"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <div className="font-bold text-zinc-900 leading-tight">
                              {displayName}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate max-w-[130px]">
                              {app.candidateProfile.headline.split(".")[0]}
                            </div>
                          </div>
                          {evalItem && (
                            <span
                              className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                evalItem.scoreBreakdown.compositeScore >= 85
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                                  : "bg-amber-50 text-amber-800 border border-amber-300"
                              }`}
                            >
                              {evalItem.scoreBreakdown.compositeScore}%
                            </span>
                          )}
                        </div>

                        {/* Hallucination / Risk Indicator */}
                        {evalItem?.isHallucinationFlagged && (
                          <div className="inline-flex items-center gap-1 text-[10px] font-mono text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                            <ShieldAlert className="w-3 h-3 text-red-600" />
                            <span>Risk Flag Detected</span>
                          </div>
                        )}

                        {/* Recruiter Notes Snippet if present */}
                        {app.recruiterNotes && (
                          <div className="p-1.5 bg-zinc-50 border border-zinc-200 rounded text-[11px] text-zinc-700 font-mono italic">
                            &ldquo;{app.recruiterNotes}&rdquo;
                          </div>
                        )}

                        {/* Action buttons: Audit + Recruiter Notes */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-zinc-100 pt-1.5">
                          <button
                            onClick={() => setSelectedAppAudit(app)}
                            className="text-zinc-500 hover:text-zinc-900 underline flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            <span>{app.auditTrail.length} Events</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveNoteApp(app);
                              setNoteInput(app.recruiterNotes || "");
                            }}
                            className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{app.recruiterNotes ? "Edit Note" : "+ Note"}</span>
                          </button>
                        </div>

                        {/* Advance Action */}
                        {colIdx < PIPELINE_COLUMNS.length - 1 && (
                          <button
                            onClick={() => handleAdvanceStage(app.id, app.currentStage)}
                            disabled={movingAppId === app.id}
                            className="w-full flex items-center justify-center gap-1 py-1 bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-800 border border-zinc-200 text-[11px] font-mono font-medium transition-colors"
                          >
                            <span>Move to Next Stage</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {appsInCol.length === 0 && (
                    <div className="h-28 flex items-center justify-center text-[11px] font-mono text-zinc-400 border border-dashed border-zinc-200 rounded m-1">
                      Empty Stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Audit Trail Timeline Modal */}
        {selectedAppAudit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white border border-zinc-300 rounded-sm max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 font-mono uppercase tracking-wider">
                    Application Audit Trail (Spec 3.6)
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    {selectedAppAudit.candidateProfile.fullName} • ID: {selectedAppAudit.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAppAudit(null)}
                  className="text-zinc-400 hover:text-zinc-700 text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              {selectedAppAudit.recruiterNotes && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded text-xs font-mono">
                  <span className="font-bold text-emerald-900 block mb-1">Current Recruiter Notes:</span>
                  <p className="text-zinc-800">&ldquo;{selectedAppAudit.recruiterNotes}&rdquo;</p>
                </div>
              )}

              <div className="space-y-3 font-mono text-xs">
                {selectedAppAudit.auditTrail.map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="p-3 bg-zinc-50 border border-zinc-200 rounded-sm space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-zinc-900">{entry.action}</span>
                      <span className="text-zinc-500">
                        {new Date(entry.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="text-zinc-600 text-[11px]">
                      Actor: <span className="text-zinc-900 font-semibold">{entry.actor.name}</span> ({entry.actor.role})
                    </div>
                    {entry.notes && (
                      <div className="p-1.5 bg-white border border-zinc-200 text-zinc-700 text-[11px] mt-1">
                        &ldquo;{entry.notes}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end border-t border-zinc-200 pt-3">
                <button
                  onClick={() => setSelectedAppAudit(null)}
                  className="px-4 py-1.5 bg-zinc-900 text-white text-xs font-mono font-semibold rounded-sm hover:bg-zinc-800"
                >
                  Close Audit Log
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recruiter Note Modal (Spec 3.6) */}
        {activeNoteApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white border border-zinc-300 rounded-sm max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-zinc-900 font-mono uppercase tracking-wider">
                    Recruiter Note // Spec 3.6
                  </h3>
                </div>
                <button
                  onClick={() => setActiveNoteApp(null)}
                  className="text-zinc-400 hover:text-zinc-700 text-sm font-mono"
                >
                  ✕
                </button>
              </div>

              <div>
                <span className="text-xs font-mono text-zinc-500 block mb-1">
                  Candidate: <strong className="text-zinc-900">{activeNoteApp.candidateProfile.fullName}</strong>
                </span>
                <textarea
                  rows={4}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Enter evaluation notes, observations, or verification follow-up items..."
                  className="w-full border border-zinc-300 rounded-sm p-3 text-xs text-zinc-900 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-200 pt-3">
                <button
                  onClick={() => setActiveNoteApp(null)}
                  className="px-3 py-1.5 border border-zinc-300 text-xs font-mono rounded-sm hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={isSavingNote || !noteInput.trim()}
                  className="px-4 py-1.5 bg-zinc-900 text-white text-xs font-mono font-semibold rounded-sm hover:bg-emerald-600 disabled:opacity-50"
                >
                  {isSavingNote ? "Saving..." : "Save Note to Audit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
