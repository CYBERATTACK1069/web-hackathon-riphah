"use client";

import React, { useState } from "react";
import {
  PlatformDatabaseSchema,
  UserRole,
  ApplicationStage,
  ApplicationRecord,
  MatchEvaluation,
  ParsedResume,
  InterviewQuestion,
} from "@/types/platform";
import { SwissHeader } from "./SwissHeader";
import { JobRequisitionCard } from "./JobRequisitionCard";
import { CandidateSelector } from "./CandidateSelector";
import { CandidateDetailView } from "./CandidateDetailView";
import { CandidatePortalView } from "./CandidatePortalView";

interface PlatformDashboardProps {
  initialData: PlatformDatabaseSchema;
}

export const PlatformDashboard: React.FC<PlatformDashboardProps> = ({ initialData }) => {
  const [data, setData] = useState<PlatformDatabaseSchema>(initialData);
  const [currentRole, setCurrentRole] = useState<UserRole>("recruiter");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("usr-candidate-01");
  const [isResetting, setIsResetting] = useState(false);
  const [isAdvancingStage, setIsAdvancingStage] = useState(false);

  const activeJob = data.jobs[0]; // Exact Demo Scenario: The Backend Developer job
  const activeApplication =
    data.applications.find((a) => a.candidateId === selectedCandidateId) || data.applications[0];
  const activeEvaluation = data.evaluations.find(
    (e) => e.candidateId === selectedCandidateId && e.jobId === activeJob?.id
  );
  const activeResume = data.resumes.find((r) => r.candidateId === selectedCandidateId);
  const activeQuestions = data.questions.filter(
    (q) => !q.candidateId || q.candidateId === selectedCandidateId
  );
  const activeSchedule = data.schedules.find(
    (s) => s.candidateId === selectedCandidateId && s.jobId === activeJob?.id
  );

  // Reset database back to pristine demo state
  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to reset demo data:", err);
    } finally {
      setIsResetting(false);
    }
  };

  // Advance application stage
  const handleAdvanceStage = async (applicationId: string, nextStage: ApplicationStage, notes?: string) => {
    setIsAdvancingStage(true);
    try {
      const res = await fetch("/api/platform/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          newStage: nextStage,
          actor: { id: "usr-recruiter-01", name: "Elena Vance", role: "recruiter" },
          notes: notes || `Recruiter manually transitioned stage to ${nextStage}`,
        }),
      });
      const json = await res.json();
      if (json.success && json.application) {
        setData((prev) => ({
          ...prev,
          applications: prev.applications.map((app) =>
            app.id === applicationId ? json.application : app
          ),
        }));
      }
    } catch (err) {
      console.error("Failed to advance stage:", err);
    } finally {
      setIsAdvancingStage(false);
    }
  };

  const handleCandidateAdded = (candidateData: {
    application: ApplicationRecord;
    evaluation: MatchEvaluation;
    resume: ParsedResume;
    questions?: InterviewQuestion[];
  }) => {
    setData((prev) => ({
      ...prev,
      applications: [
        candidateData.application,
        ...prev.applications.filter(
          (a) =>
            a.id !== candidateData.application.id &&
            a.candidateId !== candidateData.application.candidateId
        ),
      ],
      evaluations: [
        candidateData.evaluation,
        ...prev.evaluations.filter(
          (e) =>
            e.id !== candidateData.evaluation.id &&
            e.candidateId !== candidateData.evaluation.candidateId
        ),
      ],
      resumes: [
        candidateData.resume,
        ...prev.resumes.filter(
          (r) =>
            r.id !== candidateData.resume.id &&
            r.candidateId !== candidateData.resume.candidateId
        ),
      ],
      questions: [
        ...(candidateData.questions || []),
        ...prev.questions,
      ],
    }));
    setSelectedCandidateId(candidateData.application.candidateId);
  };

  return (
    <div className="min-h-screen flex flex-col swiss-grid-pattern">
      <SwissHeader
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onResetData={handleResetData}
        isResetting={isResetting}
        dbType="local_json"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Requisition Overview */}
        {activeJob && <JobRequisitionCard job={activeJob} />}

        {/* Candidate Selector (visible in recruiter mode or for picking which candidate to view) */}
        <CandidateSelector
          applications={data.applications}
          evaluations={data.evaluations}
          selectedCandidateId={selectedCandidateId}
          onSelectCandidate={setSelectedCandidateId}
          onCandidateAdded={handleCandidateAdded}
        />

        {/* Dynamic View based on Active Role */}
        {currentRole === "recruiter" ? (
          activeApplication && (
            <CandidateDetailView
              application={activeApplication}
              evaluation={activeEvaluation}
              resume={activeResume}
              questions={activeQuestions}
              schedule={activeSchedule}
              currentRole={currentRole}
              onAdvanceStage={handleAdvanceStage}
              isAdvancingStage={isAdvancingStage}
            />
          )
        ) : (
          activeApplication && activeJob && (
            <CandidatePortalView
              application={activeApplication}
              job={activeJob}
              schedule={activeSchedule}
            />
          )
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between text-xs text-zinc-500 font-mono gap-2">
          <div>
            <span>TALENTSWISS PLATFORM</span>
            <span className="text-zinc-400 mx-2">//</span>
            <span>SWISS-GRID PRECISION ZINC & EMERALD ENTERPRISE THEME</span>
          </div>
          <div>
            <span>DATA STORE: data/platform_db.json</span>
            <span className="text-zinc-400 mx-2">//</span>
            <span>MODEL: swiss-recruiter-eval-v3</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

