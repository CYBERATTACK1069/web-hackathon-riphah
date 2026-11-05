"use client";

import React from "react";
import { RecruitmentAnalytics } from "@/types";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Briefcase,
  AlertCircle,
  Layers,
} from "lucide-react";

interface AnalyticsDashboardProps {
  analytics: RecruitmentAnalytics;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics }) => {
  const stages = [
    { label: "Submitted", count: analytics.stageDistribution.SUBMITTED, color: "bg-slate-500" },
    { label: "Parsed & Evaluated", count: analytics.stageDistribution.PARSED + analytics.stageDistribution.AI_ASSESSMENT, color: "bg-indigo-500" },
    { label: "Recruiter Review", count: analytics.stageDistribution.RECRUITER_REVIEW, color: "bg-cyan-500" },
    { label: "Shortlisted", count: analytics.stageDistribution.SHORTLISTED, color: "bg-emerald-500" },
    { label: "Interview", count: analytics.stageDistribution.INTERVIEW, color: "bg-purple-500" },
    { label: "Selected", count: analytics.stageDistribution.SELECTED, color: "bg-teal-400" },
    { label: "Rejected", count: analytics.stageDistribution.REJECTED, color: "bg-red-500" },
  ];

  const maxStageCount = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div className="space-y-6">
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>App-to-Shortlist Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{analytics.applicationToShortlistRate}%</p>
          <span className="text-[10px] text-slate-500">Industry benchmark: 20-30%</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Processing Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{analytics.avgProcessingTimeDays} days</p>
          <span className="text-[10px] text-slate-500">From submission to recruiter decision</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Interviews Scheduled</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">{analytics.interviewsScheduledCount}</p>
          <span className="text-[10px] text-slate-500">Live calendar bookings</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending Reviews</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{analytics.pendingReviewsCount}</p>
          <span className="text-[10px] text-slate-500">Requires human recruiter action</span>
        </div>
      </div>

      {/* Grid: Pipeline Stage Distribution + Common Skill Gaps Across Pool */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pipeline Funnel Distribution (Section 3.9) */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Pipeline Stage Funnel (Live Distribution)</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">{analytics.totalApplicationsCount} Total</span>
          </div>

          <div className="space-y-2.5">
            {stages.map((stage, idx) => {
              const widthPct = Math.max(8, (stage.count / maxStageCount) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{stage.label}</span>
                    <span className="font-mono text-slate-400">{stage.count} applicants</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${stage.color}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Common Skill Gaps Across Pool (Section 3.9) */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Top Missing Skill Gaps in Applicant Pool</span>
            </h4>
            <span className="text-[11px] font-mono text-amber-400">Market Intelligence</span>
          </div>

          <div className="space-y-3">
            {analytics.topSkillGapsAcrossPool.map((gap: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{gap.skill}</span>
                  <span className="font-mono font-bold text-amber-400">
                    {gap.count} candidates ({gap.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{ width: `${gap.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Identified as missing requirement across 2 of 3 applicants in the Backend Developer pool.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

