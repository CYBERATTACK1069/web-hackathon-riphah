"use client";

import React, { useState } from "react";
import { JobVacancy, JobVacancyStatus } from "@/types/platform";
import { Briefcase, MapPin, History, CheckCircle, ChevronDown, ChevronUp, Layers, Clock } from "lucide-react";

interface JobRequisitionCardProps {
  job: JobVacancy;
}

export const JobRequisitionCard: React.FC<JobRequisitionCardProps> = ({ job }) => {
  const [showHistory, setShowHistory] = useState(false);

  const getStatusBadge = (status: JobVacancyStatus) => {
    switch (status) {
      case "open":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "reopened":
        return "bg-emerald-100/70 text-emerald-900 border-emerald-400 font-semibold";
      case "closed":
        return "bg-zinc-100 text-zinc-700 border-zinc-300";
      case "draft":
        return "bg-amber-50 text-amber-800 border-amber-300";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-300";
    }
  };

  return (
    <div className="swiss-card mb-8">
      {/* Header Bar */}
      <div className="swiss-card-header flex flex-wrap items-center justify-between gap-4 bg-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-zinc-900 text-white flex items-center justify-center font-mono font-bold text-base border border-zinc-700 shrink-0">
            <Briefcase className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">{job.id}</span>
              <span className="text-zinc-300">//</span>
              <span className="text-xs font-medium text-zinc-600">{job.department}</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 border rounded-sm uppercase tracking-wide ${getStatusBadge(job.status)}`}>
                STATUS: {job.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight mt-0.5">{job.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-emerald-600" />
            <span>AUDIT TRAIL ({job.statusHistory.length} EVENTS)</span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Audit History Dropdown Panel */}
      {showHistory && (
        <div className="bg-zinc-900 text-zinc-200 p-4 border-b border-zinc-800 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
            <span className="text-emerald-400 font-semibold tracking-wider uppercase">
              // REQUISITION LIFECYCLE AUDIT TRAIL
            </span>
            <span className="text-zinc-500 text-[11px]">IMMUTABLE TIMESTAMPS</span>
          </div>

          <div className="space-y-2.5">
            {job.statusHistory.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 pl-2 border-l-2 border-zinc-700">
                <span className="text-zinc-500 shrink-0 text-[11px]">{new Date(item.changedAt).toLocaleString()}</span>
                <span className="text-emerald-400 font-medium uppercase text-[11px] px-1.5 py-0.2 bg-zinc-800 rounded-sm">
                  {item.status}
                </span>
                <span className="text-zinc-300 text-xs">{item.reason || "Status updated"}</span>
                <span className="text-zinc-500 text-[10px] ml-auto">ACTOR: {item.changedBy}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Details & Metrics Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Summary & Requirements */}
        <div className="lg:col-span-7 space-y-4">
          <p className="text-sm text-zinc-700 leading-relaxed">{job.summary}</p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-zinc-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>{job.location}</span>
            </div>
            <span>//</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{job.employmentType.replace("_", " ").toUpperCase()}</span>
            </div>
            <span>//</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-900">
                {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
              </span>
              <span>/{job.salaryRange.period}</span>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
              Mandatory Deliverables
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-700">
              {job.responsibilities.slice(0, 3).map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">›</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Skill Importance Weights Matrix */}
        <div className="lg:col-span-5 bg-zinc-50 p-4 border border-zinc-200">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-900 uppercase">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Skill Importance Weights</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 font-semibold">
              TOTAL: 100%
            </span>
          </div>

          <p className="text-[11px] text-zinc-500 mb-3 font-mono">
            Configured target skill weights used by the 50% technical match evaluator:
          </p>

          <div className="space-y-3">
            {job.skillWeights.map((skill) => {
              const percentage = Math.round(skill.weight * 100);
              return (
                <div key={skill.skillId} className="bg-white p-2.5 border border-zinc-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-900">{skill.name}</span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1 py-0.2 rounded-sm ${
                          skill.importance === "critical"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {skill.importance}
                      </span>
                    </div>
                    <div className="font-mono text-xs font-bold text-zinc-900">
                      {percentage}% (Min {skill.minimumYearsRequired}y)
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-100 h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-500"
                      style={{ width: `${percentage * 2}%` }}
                    />
                  </div>

                  {skill.description && (
                    <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1 font-mono">
                      {skill.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

