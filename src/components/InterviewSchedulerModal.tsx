"use client";

import React, { useState } from "react";
import { CandidateProfile, Job, InterviewSchedule } from "@/types";
import { Calendar, Clock, AlertTriangle, CheckCircle, User, Video, X } from "lucide-react";

interface InterviewSchedulerModalProps {
  candidate: CandidateProfile;
  job: Job;
  applicationId: string;
  existingInterviews: InterviewSchedule[];
  onClose: () => void;
  onScheduled: (interview: InterviewSchedule) => void;
}

export const InterviewSchedulerModal: React.FC<InterviewSchedulerModalProps> = ({
  candidate,
  job,
  applicationId,
  existingInterviews,
  onClose,
  onScheduled,
}) => {
  const [date, setDate] = useState("2026-11-10");
  const [time, setTime] = useState("14:00");
  const [interviewerName, setInterviewerName] = useState("Sarah Chen");
  const [interviewType, setInterviewType] = useState<"TECHNICAL" | "BEHAVIORAL" | "SYSTEM_DESIGN">("TECHNICAL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Conflict Detection (Section 3.8 requirement)
  const conflictingInterview = existingInterviews.find(
    (i) => i.scheduledDate === date && i.scheduledTime === time && i.status === "SCHEDULED"
  );

  const hasConflict = !!conflictingInterview;

  const handleSchedule = async (allowConflict = false) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SCHEDULE",
          applicationId,
          candidateId: candidate.id,
          jobId: job.id,
          scheduledDate: date,
          scheduledTime: time,
          interviewerName,
          interviewType,
          meetingLink: `https://meet.nexacorp.io/interview-${candidate.id.slice(-6)}`,
          allowConflict,
        }),
      });

      const data = await res.json();
      if (data.interview) {
        onScheduled(data.interview);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">3.8 Interview Scheduling & Conflict UI</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Candidate Target */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-white">{candidate.fullName}</span>
            <span className="text-indigo-400 font-mono text-[11px]">{job.title}</span>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3.5 text-xs">
          {/* Interviewer */}
          <div>
            <label className="text-slate-300 block mb-1 font-medium">Interviewer</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Time Slot</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              >
                <option value="10:00">10:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="14:00">02:00 PM (Demo Busy Slot)</option>
                <option value="15:30">03:30 PM</option>
                <option value="17:00">05:00 PM</option>
              </select>
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <label className="text-slate-300 block mb-1 font-medium">Interview Format</label>
            <div className="grid grid-cols-3 gap-2">
              {(["TECHNICAL", "SYSTEM_DESIGN", "BEHAVIORAL"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setInterviewType(t)}
                  className={`py-1.5 rounded-lg font-mono text-[10px] font-semibold border transition ${
                    interviewType === t
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Conflict Warning Banner (Section 3.8 requirement) */}
          {hasConflict ? (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-red-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Scheduling Conflict Detected!</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Interviewer <strong>{interviewerName}</strong> is already booked for an interview on{" "}
                <strong>{date}</strong> at <strong>{time}</strong>. Please select another slot to avoid double-booking.
              </p>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Time slot is available. No calendar conflicts found.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
          >
            Cancel
          </button>
          {hasConflict && (
            <button
              onClick={() => handleSchedule(true)}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
            >
              <span>Override Conflict</span>
            </button>
          )}
          <button
            onClick={() => handleSchedule(false)}
            disabled={isSubmitting || hasConflict}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Video className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Confirming..." : "Confirm Schedule"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

