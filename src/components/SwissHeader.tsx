"use client";

import React from "react";
import Link from "next/link";
import { UserRole } from "@/types/platform";
import { ShieldCheck, RotateCcw, Database, Building2, UserCircle2, Sparkles } from "lucide-react";

interface SwissHeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onResetData: () => void;
  isResetting: boolean;
  dbType: "local_json" | "memory";
}

export const SwissHeader: React.FC<SwissHeaderProps> = ({
  currentRole,
  onRoleChange,
  onResetData,
  isResetting,
  dbType,
}) => {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-30">
      {/* Top micro ribbon */}
      <div className="border-b border-zinc-100 bg-zinc-950 text-zinc-300 text-xs px-6 py-1.5 flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-3 font-mono tracking-tight text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            SWISS-GRID RECRUITMENT ENGINE
          </span>
          <span className="text-zinc-600">//</span>
          <span className="text-zinc-400">SPEC: ISO-AUDIT 2026.4</span>
          <span className="text-zinc-600">//</span>
          <span className="text-zinc-400">CONTRACT: STRICT SHARED TYPES</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>STORE: {dbType === "local_json" ? "data/platform_db.json" : "IN-MEMORY FALLBACK"}</span>
          </div>
          <span className="text-zinc-600">|</span>
          <button
            onClick={onResetData}
            disabled={isResetting}
            className="inline-flex items-center gap-1 text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
            title="Reset to initial Demo Scenario"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isResetting ? "RESETTING..." : "RESET DEMO DATA"}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-zinc-900 text-white flex items-center justify-center font-mono font-bold text-sm border border-zinc-700">
            CH
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-base text-zinc-900 tracking-tight">TALENTSWISS PLATFORM</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm font-medium">
                V3.8 ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-zinc-500">Autonomous Talent Evaluation & Hallucination Verification Service</p>
          </div>
        </div>

        {/* Role Toggle Switcher */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-zinc-800">
              {currentRole === "recruiter" ? "Elena Vance (Lead Recruiter)" : "Candidate Portal View"}
            </p>
            <p className="text-[10px] font-mono text-zinc-500">
              {currentRole === "recruiter" ? "APEX CORE ENGINEERING" : "PORTAL ACCESS ONLY"}
            </p>
          </div>

          <div className="inline-flex p-0.5 bg-zinc-100 border border-zinc-200 rounded-sm">
            <button
              onClick={() => onRoleChange("recruiter")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${
                currentRole === "recruiter"
                  ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Recruiter Mode
            </button>
            <button
              onClick={() => onRoleChange("candidate")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${
                currentRole === "candidate"
                  ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <UserCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Candidate Mode
            </button>
          </div>

          <Link
            href="/ai-lab"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI LAB & PDF TESTING</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

