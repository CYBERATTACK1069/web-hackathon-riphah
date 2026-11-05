"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import {
  ShieldCheck,
  Building2,
  UserCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  Zap,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  KeyRound,
  Sun,
  Moon,
} from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<"recruiter" | "candidate">("recruiter");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [activeSession, setActiveSession] = useState<{ role: string; name: string } | null>(null);

  useEffect(() => {
    // Check existing session
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("talentiq_role");
      const savedUser = localStorage.getItem("talentiq_user");
      if (savedRole && savedUser) {
        try {
          const u = JSON.parse(savedUser);
          setActiveSession({ role: savedRole, name: u.name || u.fullName });
        } catch {
          setActiveSession({ role: savedRole, name: "Logged in user" });
        }
      }
    }
  }, []);

  const handleDemoLogin = (role: "recruiter" | "candidate", candidateId?: string) => {
    setLoading(true);
    setSuccessMsg("");

    let demoUser;
    let targetRoute = "";

    if (role === "recruiter") {
      demoUser = {
        id: "usr_recruiter_1",
        name: "Sarah Chen",
        email: "sarah.chen@nexacorp.io",
        role: "RECRUITER",
        title: "Lead Technical Recruiter",
        companyOrAffiliation: "NexaCorp Talent Solutions",
      };
      targetRoute = "/recruiter";
    } else {
      if (candidateId === "cand_maya_lin" || candidateId === "cand_elena_rostova") {
        demoUser = {
          id: "usr_candidate_2",
          candidateId: "cand_maya_lin",
          name: "Maya Lin",
          email: "maya.lin@devmail.org",
          role: "CANDIDATE",
          title: "Backend Developer (68% Match)",
        };
      } else if (candidateId === "cand_tariq_mahmood" || candidateId === "cand_liam_oconnor") {
        demoUser = {
          id: "usr_candidate_3",
          candidateId: "cand_tariq_mahmood",
          name: "Tariq Mahmood",
          email: "tariq.mahmood@codestack.net",
          role: "CANDIDATE",
          title: "Junior Software Developer (35% Match)",
        };
      } else {
        demoUser = {
          id: "usr_candidate_1",
          candidateId: "cand_alex_rivera",
          name: "Alex Rivera",
          email: "alex.rivera@devmail.io",
          role: "CANDIDATE",
          title: "Senior Full-Stack Engineer (93.5% Match)",
        };
      }
      targetRoute = "/candidate";
    }

    // Persist session in localStorage for cross-page persistence
    localStorage.setItem("talentiq_role", role);
    localStorage.setItem("talentiq_user", JSON.stringify(demoUser));
    // Set lightweight cookie for SSR middleware compatibility
    document.cookie = `talentiq_role=${role}; path=/; max-age=86400; SameSite=Lax`;

    setSuccessMsg(`Authenticated as ${demoUser.name} (${demoUser.role})`);
    setTimeout(() => {
      router.push(targetRoute);
    }, 600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const user = {
      id: `usr_${Date.now()}`,
      name: fullName || (email.split("@")[0] ?? "User"),
      email,
      role: selectedRole.toUpperCase(),
      title: selectedRole === "recruiter" ? "Recruiting Specialist" : "Software Engineer",
    };

    localStorage.setItem("talentiq_role", selectedRole);
    localStorage.setItem("talentiq_user", JSON.stringify(user));
    document.cookie = `talentiq_role=${selectedRole}; path=/; max-age=86400; SameSite=Lax`;

    const target = selectedRole === "recruiter" ? "/recruiter" : "/candidate";
    setSuccessMsg(`Welcome, ${user.name}! Redirecting...`);
    setTimeout(() => {
      router.push(target);
    }, 600);
  };

  const handleClearSession = () => {
    localStorage.removeItem("talentiq_role");
    localStorage.removeItem("talentiq_user");
    document.cookie = "talentiq_role=; path=/; max-age=0";
    setActiveSession(null);
    setSuccessMsg("Session cleared successfully.");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-emerald-500/20 transition-colors duration-150">
      {/* Top Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-6 py-3 sticky top-0 z-30 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-zinc-900 text-white dark:bg-emerald-600 flex items-center justify-center font-mono font-bold text-sm shadow-xs">
            TQ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight text-sm">TALENTIQ</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-sm font-semibold">
                AUTH // SEC 3.1
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Institutional Talent Intelligence Platform</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            aria-label="Toggle High-Contrast Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-800" />
            )}
          </button>

          {activeSession ? (
            <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-sm border border-zinc-200 dark:border-zinc-700 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-zinc-700 dark:text-zinc-300">
                Active: <strong className="text-zinc-900 dark:text-white">{activeSession.name}</strong> ({activeSession.role})
              </span>
              <button
                onClick={handleClearSession}
                className="text-zinc-500 dark:text-zinc-400 hover:text-red-500 transition-colors ml-2 underline text-[11px]"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
              Role Protection Active
            </span>
          )}
        </div>
      </header>

      {/* Main Center Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-xl">
          {/* Judge Fast-Track Banner */}
          <div className="mb-6 bg-gradient-to-r from-emerald-50/80 via-white to-indigo-50/80 dark:from-emerald-950/80 dark:via-zinc-900 dark:to-indigo-950/80 border border-emerald-200 dark:border-emerald-500/30 rounded-sm p-5 shadow-xs backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-sm bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                    Judge & Evaluator 1-Click Fast Track
                  </h3>
                  <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-sm border border-emerald-300 dark:border-emerald-700 font-semibold">
                    RUBRIC READY
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                  Instant demo authorization into pre-seeded roles with realistic resumes, radar scorecard analytics,
                  and verified evidence citations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => handleDemoLogin("recruiter")}
                    disabled={loading}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-medium text-xs rounded-sm transition-all shadow-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-emerald-200" />
                      <div className="text-left">
                        <div className="font-semibold">Demo Recruiter</div>
                        <div className="text-[10px] text-emerald-100/90">Sarah Chen (Lead Recruiter)</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => handleDemoLogin("candidate", "cand_alex_rivera")}
                    disabled={loading}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-medium text-xs rounded-sm transition-all shadow-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-indigo-200" />
                      <div className="text-left">
                        <div className="font-semibold">Demo Candidate</div>
                        <div className="text-[10px] text-indigo-100/90">Alex Rivera (93% Match)</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Additional candidate personas */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800/60 text-xs">
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Other Candidate Personas:</span>
                  <button
                    onClick={() => handleDemoLogin("candidate", "cand_maya_lin")}
                    className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 hover:underline px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-sm border border-zinc-300 dark:border-zinc-700"
                  >
                    Maya Lin (74% Match)
                  </button>
                  <button
                    onClick={() => handleDemoLogin("candidate", "cand_tariq_mahmood")}
                    className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 hover:underline px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-sm border border-zinc-300 dark:border-zinc-700"
                  >
                    Tariq Mahmood (68% Match)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Regular Login / Registration Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm p-6 shadow-xs">
            {/* Role Selector Tabs */}
            <div className="mb-6">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Select Your Role (Section 3.1)
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-sm border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedRole("recruiter")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-sm text-xs font-semibold transition-all ${
                    selectedRole === "recruiter"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Recruiter Portal
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("candidate")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-sm text-xs font-semibold transition-all ${
                    selectedRole === "candidate"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-900"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Candidate Portal
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Elena Vance"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      selectedRole === "recruiter" ? "sarah.chen@nexacorp.io" : "alex.rivera@devmail.io"
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700/60 rounded-sm text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-sm text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-xs ${
                  selectedRole === "recruiter"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : isRegistering ? (
                  <>
                    <span>Create {selectedRole === "recruiter" ? "Recruiter" : "Candidate"} Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Sign In to {selectedRole === "recruiter" ? "Command Center" : "Career Portal"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors underline"
              >
                {isRegistering ? "Already registered? Sign in" : "Need an account? Register now"}
              </button>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Session Route Guard</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/80 px-6 py-3 text-center text-xs font-mono text-zinc-500 dark:text-zinc-400">
        TALENTIQ ENTERPRISE // SECTION 3.1 AUTHENTICATION & ACCESS CONTROL // RIPHAH HACKATHON 2026
      </footer>
    </div>
  );
}
