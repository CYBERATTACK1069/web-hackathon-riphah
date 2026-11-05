"use client";

import React, { useState, useEffect } from "react";
import {
  PlatformDatabaseSchema,
  InterviewSchedule,
  InterviewQuestion,
  InterviewStatus,
} from "@/types/platform";
import { SwissHeader } from "@/components/SwissHeader";
import {
  Calendar,
  Sparkles,
  Clock,
  Video,
  AlertTriangle,
  CheckCircle2,
  User,
  Plus,
  Send,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  BookOpen,
} from "lucide-react";

export default function InterviewsPage() {
  const [data, setData] = useState<PlatformDatabaseSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"schedules" | "questions">("schedules");

  // Scheduling Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedCandidateId, setSchedCandidateId] = useState("usr-candidate-01");
  const [schedDate, setSchedDate] = useState("2026-11-12");
  const [schedTime, setSchedTime] = useState("14:00");
  const [schedType, setSchedType] = useState<any>("technical_deep_dive");
  const [schedInterviewer, setSchedInterviewer] = useState("Elena Vance");
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Feedback Modal
  const [feedbackSchedule, setFeedbackSchedule] = useState<InterviewSchedule | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(4);
  const [feedbackRec, setFeedbackRec] = useState<any>("hire");
  const [feedbackNotes, setFeedbackNotes] = useState("");

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

  const handleScheduleSubmit = async (allowConflict: boolean = false) => {
    try {
      const combinedDateTime = `${schedDate}T${schedTime}:00Z`;
      const res = await fetch("/api/platform/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule",
          candidateId: schedCandidateId,
          scheduledAt: combinedDateTime,
          interviewType: schedType,
          allowConflict,
          interviewer: {
            id: "usr-recruiter-01",
            name: schedInterviewer,
            email: "elena.vance@talentswiss.io",
            title: "Lead Technical Talent Partner",
          },
        }),
      });
      const json = await res.json();
      if (!json.success && json.conflictDetected) {
        setConflictWarning(json.conflictMessage);
      } else {
        setShowScheduleModal(false);
        setConflictWarning(null);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackSchedule) return;
    try {
      await fetch("/api/platform/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "feedback",
          scheduleId: feedbackSchedule.id,
          feedback: {
            submittedAt: new Date().toISOString(),
            interviewerId: "usr-recruiter-01",
            overallScore: feedbackRating,
            recommendation: feedbackRec,
            assessedSkills: [
              {
                skillName: "Python Concurrency",
                claimedEvidenceState: "confirmed_present",
                verifiedState: "confirmed_present",
                technicalScore: feedbackRating,
                interviewerComments: "Demonstrated strong mastery of asyncio and GIL thread models.",
              },
            ],
            verifiedHallucinationClaims: [],
            strengths: ["Clean code organization", "Solid architectural trade-off analysis"],
            weaknesses: ["Needs slight ramp-up on Docker Swarm clustering"],
            detailedFeedback: feedbackNotes || "Strong candidate demonstrating thorough system design fundamentals.",
          },
        }),
      });
      setFeedbackSchedule(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/60 swiss-grid-pattern">
      <SwissHeader
        currentRole="recruiter"
        onRoleChange={() => {}}
        onResetData={fetchData}
        isResetting={false}
        dbType="local_json"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 mb-1">
              <span>TALENTSWISS</span>
              <span>/</span>
              <span className="text-zinc-900 font-semibold">INTERVIEW INTELLIGENCE</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Interview Scheduling, Conflict Alerts & AI Question Generation
            </h1>
            <p className="text-xs text-zinc-600 mt-1">
              Functional Specs 3.7 & 3.8: Conflict-checked calendar scheduling and project-tailored probe questions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white text-xs font-mono font-semibold rounded-sm hover:bg-emerald-600 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>SCHEDULE INTERVIEW</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 font-mono text-xs">
          <button
            onClick={() => setActiveTab("schedules")}
            className={`py-2.5 px-4 border-b-2 font-semibold transition-colors ${
              activeTab === "schedules"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Scheduled Calendar ({data?.schedules.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`py-2.5 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "questions"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Tailored Questions ({data?.questions.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: SCHEDULES */}
        {activeTab === "schedules" && (
          <div className="space-y-4">
            {data?.schedules.map((sch) => {
              const candidate = data.applications.find((a) => a.candidateId === sch.candidateId);
              return (
                <div
                  key={sch.id}
                  className="bg-white border border-zinc-200 rounded-sm p-5 space-y-3 transition-all hover:border-zinc-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-zinc-900">{sch.title}</span>
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded-sm uppercase font-bold border ${
                            sch.status === "completed"
                              ? "bg-zinc-100 text-zinc-700 border-zinc-300"
                              : "bg-emerald-50 text-emerald-800 border-emerald-300"
                          }`}
                        >
                          {sch.status}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-600 font-mono mt-1">
                        Candidate: <strong className="text-zinc-900">{candidate?.candidateProfile.fullName || sch.candidateId}</strong> • Interviewer: {sch.interviewer.name}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={sch.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 text-xs font-mono font-medium rounded-sm transition-colors border border-zinc-200"
                      >
                        <Video className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Join Meeting</span>
                      </a>
                      {sch.status !== "completed" && (
                        <button
                          onClick={() => setFeedbackSchedule(sch)}
                          className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-mono font-semibold rounded-sm hover:bg-emerald-600 transition-colors"
                        >
                          Submit Feedback
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500 border-t border-zinc-100 pt-3">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {new Date(sch.scheduledAt).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {new Date(sch.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({sch.durationMinutes} mins)
                    </span>
                  </div>

                  {/* Feedback Summary if completed */}
                  {sch.feedback && (
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-sm space-y-1 text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-zinc-800">
                          Interviewer Recommendation:{" "}
                          <span className="text-emerald-700 uppercase">{sch.feedback.recommendation}</span>
                        </span>
                        <span className="font-bold text-zinc-900">Score: {sch.feedback.overallScore}/5</span>
                      </div>
                      <p className="text-zinc-600 text-xs mt-1 leading-relaxed">
                        &ldquo;{sch.feedback.detailedFeedback}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: AI TAILORED QUESTIONS */}
        {activeTab === "questions" && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-sm text-xs text-emerald-900 font-mono">
              <span className="font-bold block mb-1">DYNAMIC AI INTERVIEW PROBE GENERATOR (SPEC 3.7):</span>
              Questions are tailored directly to the candidate&apos;s project resume claims, verifying evidence states and assessing system architecture depth.
            </div>

            <div className="space-y-4">
              {data?.questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white border border-zinc-200 rounded-sm p-6 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="px-2 py-0.5 bg-zinc-900 text-white font-bold rounded-sm uppercase">
                        {q.category.replace("_", " ")}
                      </span>
                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-sm uppercase font-semibold">
                        Target: {q.targetSkillOrTopic}
                      </span>
                    </div>

                    <span className="font-mono text-xs px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-sm font-bold uppercase">
                      Difficulty: {q.difficulty}
                    </span>
                  </div>

                  <p className="font-bold text-zinc-900 text-sm leading-relaxed">{q.questionText}</p>

                  <div className="p-3 bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 font-mono space-y-1">
                    <span className="font-bold text-zinc-800 block">AI Context Reasoning:</span>
                    <p>{q.contextReasoning}</p>
                  </div>

                  {/* Rubric Signals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                    <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-sm space-y-1">
                      <span className="font-mono text-[11px] font-bold text-emerald-800 block uppercase">
                        ✓ Expected Candidate Signals:
                      </span>
                      <ul className="list-disc list-inside text-zinc-700 text-[11px] space-y-0.5">
                        {q.expectedSignals.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-red-50/50 border border-red-200 rounded-sm space-y-1">
                      <span className="font-mono text-[11px] font-bold text-red-800 block uppercase">
                        ⚠ Red Flag Indicators:
                      </span>
                      <ul className="list-disc list-inside text-zinc-700 text-[11px] space-y-0.5">
                        {q.redFlagIndicators.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white border border-zinc-300 rounded-sm max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <h3 className="font-bold text-sm font-mono text-zinc-900 uppercase">
                  Schedule Candidate Interview (Spec 3.8)
                </h3>
                <button onClick={() => setShowScheduleModal(false)} className="text-zinc-400 font-mono">✕</button>
              </div>

              {conflictWarning && (
                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{conflictWarning}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-mono text-zinc-700 block mb-1 font-semibold">Select Candidate</label>
                  <select
                    value={schedCandidateId}
                    onChange={(e) => setSchedCandidateId(e.target.value)}
                    className="w-full border border-zinc-300 rounded-sm p-2 text-zinc-900 font-mono"
                  >
                    {data?.applications.map((a) => (
                      <option key={a.candidateId} value={a.candidateId}>
                        {a.candidateProfile.fullName} ({a.candidateProfile.headline.split(".")[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-mono text-zinc-700 block mb-1 font-semibold">Date</label>
                    <input
                      type="date"
                      value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                      className="w-full border border-zinc-300 rounded-sm p-2 text-zinc-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-zinc-700 block mb-1 font-semibold">Time (UTC)</label>
                    <input
                      type="time"
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                      className="w-full border border-zinc-300 rounded-sm p-2 text-zinc-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono text-zinc-700 block mb-1 font-semibold">Interview Type</label>
                  <select
                    value={schedType}
                    onChange={(e) => setSchedType(e.target.value)}
                    className="w-full border border-zinc-300 rounded-sm p-2 text-zinc-900 font-mono"
                  >
                    <option value="technical_deep_dive">Technical Deep Dive</option>
                    <option value="system_architecture">System Architecture</option>
                    <option value="behavioral_screening">Behavioral Screening</option>
                    <option value="executive_final">Executive Final</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-200 pt-3">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-1.5 border border-zinc-300 text-xs font-mono rounded-sm"
                >
                  Cancel
                </button>
                {conflictWarning ? (
                  <button
                    onClick={() => handleScheduleSubmit(true)}
                    className="px-4 py-1.5 bg-amber-600 text-white text-xs font-mono font-semibold rounded-sm hover:bg-amber-700"
                  >
                    Force Schedule (Override)
                  </button>
                ) : (
                  <button
                    onClick={() => handleScheduleSubmit(false)}
                    className="px-4 py-1.5 bg-zinc-900 text-white text-xs font-mono font-semibold rounded-sm hover:bg-emerald-600"
                  >
                    Confirm & Check Conflict
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {feedbackSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white border border-zinc-300 rounded-sm max-w-lg w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <h3 className="font-bold text-sm font-mono text-zinc-900 uppercase">
                  Structured Interviewer Feedback (Spec 3.8)
                </h3>
                <button onClick={() => setFeedbackSchedule(null)} className="text-zinc-400 font-mono">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-mono text-zinc-700 block mb-1 font-semibold">Overall Rating (1 - 5)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFeedbackRating(num)}
                        className={`w-9 h-9 font-mono font-bold text-xs rounded-sm border ${
                          feedbackRating === num
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-zinc-700 block mb-1 font-semibold">Recommendation</label>
                  <select
                    value={feedbackRec}
                    onChange={(e) => setFeedbackRec(e.target.value)}
                    className="w-full border border-zinc-300 rounded-sm p-2 text-zinc-900 font-mono"
                  >
                    <option value="strong_hire">Strong Hire</option>
                    <option value="hire">Hire</option>
                    <option value="weak_hire">Weak Hire</option>
                    <option value="no_hire">No Hire</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-zinc-700 block mb-1 font-semibold">Interviewer Notes</label>
                  <textarea
                    rows={4}
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="Enter thorough evaluation feedback on technical competency, communication, and system design..."
                    className="w-full border border-zinc-300 rounded-sm p-3 text-zinc-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-200 pt-3">
                <button
                  onClick={() => setFeedbackSchedule(null)}
                  className="px-3 py-1.5 border border-zinc-300 text-xs font-mono rounded-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  className="px-4 py-1.5 bg-zinc-900 text-white text-xs font-mono font-semibold rounded-sm hover:bg-emerald-600"
                >
                  Submit Final Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
