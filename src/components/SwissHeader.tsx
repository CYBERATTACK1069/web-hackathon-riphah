"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/types/platform";
import { useTheme } from "@/components/ThemeProvider";
import {
  ShieldCheck,
  RotateCcw,
  Database,
  Building2,
  UserCircle2,
  Briefcase,
  GitPullRequest,
  Calendar,
  BarChart3,
  Sparkles,
  User,
  LayoutDashboard,
  KeyRound,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Check,
  Zap,
} from "lucide-react";

interface SwissHeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onResetData: () => void;
  isResetting: boolean;
  dbType: "local_json" | "memory";
  blindMode?: boolean;
  onToggleBlindMode?: () => void;
}

const JUDGE_PERSONAS = [
  {
    role: "recruiter" as UserRole,
    id: "usr_recruiter_1",
    name: "Sarah Chen",
    title: "Lead Technical Recruiter",
    affiliation: "NexaCorp Talent Solutions",
    badge: "RECRUITER",
    badgeColor: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    targetRoute: "/recruiter",
  },
  {
    role: "candidate" as UserRole,
    id: "usr_candidate_1",
    candidateId: "cand_alex_rivera",
    name: "Alex Rivera",
    title: "Senior Full-Stack Engineer",
    affiliation: "93.5% Overall Fit // Top Candidate",
    badge: "93.5% FIT",
    badgeColor: "bg-indigo-50 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800",
    targetRoute: "/candidate",
  },
  {
    role: "candidate" as UserRole,
    id: "usr_candidate_2",
    candidateId: "cand_maya_lin",
    name: "Maya Lin",
    title: "Backend Developer",
    affiliation: "68% Overall Fit // Mid-level Candidate",
    badge: "68% FIT",
    badgeColor: "bg-cyan-50 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800",
    targetRoute: "/candidate",
  },
  {
    role: "candidate" as UserRole,
    id: "usr_candidate_3",
    candidateId: "cand_tariq_mahmood",
    name: "Tariq Mahmood",
    title: "Junior Software Developer",
    affiliation: "35% Overall Fit // Junior Developer",
    badge: "35% FIT",
    badgeColor: "bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    targetRoute: "/candidate",
  },
];

export const SwissHeader: React.FC<SwissHeaderProps> = ({
  currentRole,
  onRoleChange,
  onResetData,
  isResetting,
  dbType,
  blindMode = false,
  onToggleBlindMode,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [judgeMenuOpen, setJudgeMenuOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<{ name: string; title?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("talentiq_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setActiveUser({ name: u.name || u.fullName, title: u.title });
        } catch {
          setActiveUser(null);
        }
      } else {
        setActiveUser({
          name: currentRole === "recruiter" ? "Sarah Chen" : "Alex Rivera",
          title: currentRole === "recruiter" ? "Lead Technical Recruiter" : "Senior Full-Stack Engineer",
        });
      }
    }
  }, [currentRole]);

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isCandidateView = currentRole === "candidate" || pathname.startsWith("/candidate");

  // Precise primary tabs - role-adapted to eliminate horizontal scrollbar
  const primaryLinks = isCandidateView
    ? [
        { href: "/candidate", label: "Candidate Portal", icon: User },
        { href: "/jobs", label: "Vacancies", icon: Briefcase },
        { href: "/interviews", label: "Interview Studio", icon: Calendar },
        { href: "/ai-lab", label: "AI Verification Lab", icon: Sparkles },
      ]
    : [
        { href: "/recruiter", label: "Command", icon: Building2 },
        { href: "/jobs", label: "Vacancies", icon: Briefcase },
        { href: "/pipeline", label: "Pipeline", icon: GitPullRequest },
        { href: "/interviews", label: "Interviews", icon: Calendar },
        { href: "/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/talent", label: "Talent Intel", icon: Sparkles },
      ];

  // Secondary links tucked cleanly in the More dropdown
  const secondaryLinks = isCandidateView
    ? [
        { href: "/", label: "Landing Overview", icon: LayoutDashboard },
        { href: "/recruiter", label: "Recruiter Command", icon: Building2 },
        { href: "/pipeline", label: "Pipeline Management", icon: GitPullRequest },
        { href: "/analytics", label: "Recruitment Analytics", icon: BarChart3 },
        { href: "/talent", label: "Talent Intelligence", icon: Sparkles },
        { href: "/auth", label: "Auth / Switch Account", icon: KeyRound },
      ]
    : [
        { href: "/", label: "Landing Overview", icon: LayoutDashboard },
        { href: "/candidate", label: "Candidate Portal", icon: User },
        { href: "/ai-lab", label: "AI Verification Lab", icon: Sparkles },
        { href: "/auth", label: "Auth / Switch Account", icon: KeyRound },
      ];

  const isMoreActive = secondaryLinks.some((link) => pathname === link.href);

  const handleRoleToggle = (role: UserRole) => {
    onRoleChange(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("talentiq_role", role);
      document.cookie = `talentiq_role=${role}; path=/; max-age=86400; SameSite=Lax`;
    }
    if (role === "candidate" && !pathname.startsWith("/candidate")) {
      router.push("/candidate");
    } else if (role === "recruiter" && pathname.startsWith("/candidate")) {
      router.push("/recruiter");
    }
  };

  const handleSelectJudgePersona = (p: typeof JUDGE_PERSONAS[0]) => {
    setJudgeMenuOpen(false);
    onRoleChange(p.role);
    if (typeof window !== "undefined") {
      localStorage.setItem("talentiq_role", p.role);
      localStorage.setItem(
        "talentiq_user",
        JSON.stringify({
          id: p.id,
          candidateId: (p as any).candidateId,
          name: p.name,
          role: p.role.toUpperCase(),
          title: p.title,
          affiliation: p.affiliation,
        })
      );
      document.cookie = `talentiq_role=${p.role}; path=/; max-age=86400; SameSite=Lax`;
      window.dispatchEvent(new Event("talentiq_persona_change"));
    }
    setActiveUser({ name: p.name, title: p.title });
    router.push(p.targetRoute);
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("talentiq_role");
      localStorage.removeItem("talentiq_user");
      document.cookie = "talentiq_role=; path=/; max-age=0";
    }
    setActiveUser(null);
    router.push("/auth");
  };

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-40 transition-colors duration-150">
      {/* Top Institutional Micro-Ribbon */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-xs px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 font-mono tracking-tight text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SWISS-GRID RECRUITMENT ENGINE
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden xs:inline">STORE: {dbType === "local_json" ? "data/platform_db.json" : "IN-MEMORY FALLBACK"}</span>
          </div>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <button
            onClick={onResetData}
            disabled={isResetting}
            className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-white transition-colors disabled:opacity-50"
            title="Reset to initial pre-seeded Demo Scenario"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? "animate-spin text-emerald-500" : ""}`} />
            <span>{isResetting ? "RESETTING..." : "RESET DEMO DATA"}</span>
          </button>
        </div>
      </div>

      {/* Main Brand & Controls Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold text-xs tracking-wider shadow-sm transition-transform group-hover:scale-105 shrink-0">
              <Zap className="w-4 h-4 fill-current text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base tracking-tight font-mono text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  TALENTLENS
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  PRECISION V2.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Autonomous Talent Intelligence & Verification Engine
              </p>
            </div>
          </Link>
        </div>

        {/* Center / Right Controls: Quick Switch, Theme Toggle, Role Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* JUDGE QUICK-SWITCH BUTTON & DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setJudgeMenuOpen(!judgeMenuOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded-sm border border-emerald-600/40 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 transition-colors shadow-2xs"
              title="Judge & Evaluator Persona Quick-Switch"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" />
              <span className="font-semibold hidden sm:inline">Judge Quick-Switch</span>
              <span className="sm:hidden font-semibold">Switch</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${judgeMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {judgeMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                  <div className="text-[11px] font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-emerald-500" />
                    <span>Judge Demo Personas</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    1-Click fast-track switch between verified test profiles
                  </p>
                </div>

                <div className="space-y-1">
                  {JUDGE_PERSONAS.map((p) => {
                    const isSelected = activeUser?.name === p.name;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectJudgePersona(p)}
                        className={`w-full text-left p-2 rounded-sm text-xs transition-colors flex items-start justify-between gap-2 border ${
                          isSelected
                            ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-zinc-900 dark:text-white"
                            : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            <span>{p.name}</span>
                            <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${p.badgeColor}`}>
                              {p.badge}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                            {p.title}
                          </div>
                          <div className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                            {p.affiliation}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono px-1">
                  <Link
                    href="/auth"
                    onClick={() => setJudgeMenuOpen(false)}
                    className="text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    View All Credentials // 3.1 →
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Blind Screening Shield (Recruiter only) */}
          {onToggleBlindMode && currentRole === "recruiter" && (
            <button
              onClick={onToggleBlindMode}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded-sm border transition-colors ${
                blindMode
                  ? "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 border-purple-400 dark:border-purple-700 font-bold"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
              title="Toggle Blind Screening Shield (hides candidate names & pedigree)"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${blindMode ? "text-purple-600 dark:text-purple-400" : "text-zinc-400"}`} />
              <span className="hidden md:inline">BLIND SHIELD: {blindMode ? "ON" : "OFF"}</span>
            </button>
          )}

          {/* Theme Toggle (High Contrast Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode (WCAG High Contrast)`}
            aria-label="Toggle High-Contrast Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-800" />
            )}
          </button>

          {/* Role Toggle Switcher */}
          <div className="inline-flex p-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-sm">
            <button
              onClick={() => handleRoleToggle("recruiter")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-sm transition-all ${
                currentRole === "recruiter"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs border border-zinc-200 dark:border-zinc-700 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Recruiter</span>
            </button>
            <button
              onClick={() => handleRoleToggle("candidate")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-sm transition-all ${
                currentRole === "candidate"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs border border-zinc-200 dark:border-zinc-700 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <UserCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Candidate</span>
            </button>
          </div>

          <Link
            href="/ai-lab"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 border border-emerald-300 rounded-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>AI LAB</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Secondary Navigation Strip (Desktop) */}
      <div className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/60 hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs font-medium py-1">
          <div className="flex items-center gap-1">
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 font-semibold shadow-2xs border border-zinc-200 dark:border-zinc-800"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Compact More Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm transition-colors ${
                  isMoreActive
                    ? "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 font-semibold border border-zinc-200 dark:border-zinc-800"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                }`}
                title="Additional Platform Views"
              >
                <span>More</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${moreMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {moreMenuOpen && (
                <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-1 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                    Additional Portals
                  </div>
                  {secondaryLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreMenuOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                          isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>CONTEXT: {isCandidateView ? "CANDIDATE SUITE" : "RECRUITER ENTERPRISE"}</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Responsive Navigation) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
          <div>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
              {isCandidateView ? "Candidate Portal" : "Recruiter Workspace"}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {primaryLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
              Additional Views
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {secondaryLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500 dark:text-zinc-400">
              Active: <strong className="text-zinc-900 dark:text-white">{activeUser?.name || "User"}</strong>
            </span>
            <button
              onClick={handleSignOut}
              className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
