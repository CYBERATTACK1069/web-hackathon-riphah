"use client";

import React from "react";
import { ApplicationRecord, JobVacancy, InterviewSchedule } from "@/types/platform";
import { CheckCircle2, Clock, Calendar, Video, FileText, ArrowRight } from "lucide-react";

interface CandidatePortalViewProps {
  application: ApplicationRecord;
  job: JobVacancy;
  schedule?: InterviewSchedule;
}

export const CandidatePortalView: React.FC<CandidatePortalViewProps> = ({
  application,
  job,
  schedule,
}) => {
  return (
    <div className="space-y-6">
      <div className="swiss-card p-6 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-zinc-200">
          <div>
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
              // Candidate Self-Service Transparency Portal
            </span>
            <h2 className="text-xl font-bold text-zinc-900 mt-1">
              Welcome back, {application.candidateProfile.fullName}
            </h2>
            <p className="text-xs text-zinc-500">
              Tracking your application for <strong className="text-zinc-800">{job.title}</strong> at Apex Core Engineering.
            </p>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs text-zinc-500 uppercase block">Application Status</span>
            <span className="font-mono text-sm px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold uppercase">
              {application.currentStage.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Interview Schedule Callout if present */}
        {schedule && schedule.status === "scheduled" && (
          <div className="bg-emerald-50/70 border border-emerald-300 p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span className="font-mono text-xs font-bold text-emerald-900 uppercase">
                    Upcoming Technical Interview
                  </span>
                </div>
                <h4 className="text-base font-bold text-zinc-900">{schedule.title}</h4>
                <p className="text-xs text-zinc-600">
                  Interviewer: <strong>{schedule.interviewer.name}</strong> ({schedule.interviewer.title})
                </p>
                <div className="font-mono text-xs text-zinc-500 pt-1">
                  Scheduled for: <strong>{new Date(schedule.scheduledAt).toLocaleString()}</strong> ({schedule.durationMinutes} min)
                </div>
              </div>

              <div>
                <a
                  href={schedule.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-semibold rounded-sm transition-colors"
                >
                  <Video className="w-4 h-4" />
                  <span>JOIN VIDEO SESSION</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 7 Pipeline Stages Visualizer */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-wider">
            // Recruitment Milestones (Institutional Transparency)
          </h4>

          <div className="border border-zinc-200 divide-y divide-zinc-200">
            {application.auditTrail.map((audit) => (
              <div key={audit.id} className="p-3.5 bg-zinc-50/50 flex items-start gap-3">
                <div className="mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-900">{audit.action}</span>
                    <span className="font-mono text-[11px] text-zinc-400">
                      {new Date(audit.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {audit.notes && <p className="text-xs text-zinc-600 mt-0.5">{audit.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

