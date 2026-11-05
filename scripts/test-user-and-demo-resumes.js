const path = require("path");
const fs = require("fs");
const { NextRequest } = require("next/server");

const jiti = require("jiti")(__filename, {
  alias: {
    "@": path.resolve(__dirname, "../src"),
  },
});

const { POST: postParseResume } = jiti("../src/app/api/parse-resume/route.ts");

async function main() {
  const dir = path.resolve(__dirname, "../demo_resumes");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".pdf"));

  console.log(`Testing all ${files.length} PDF resumes in demo_resumes...\n`);

  for (const f of files) {
    const filePath = path.join(dir, f);
    const buf = fs.readFileSync(filePath);
    const formData = new FormData();
    const file = new File([buf], f, { type: "application/pdf" });
    formData.append("file", file);
    formData.append("saveToStore", "true");

    const req = new NextRequest("http://localhost:3000/api/parse-resume", {
      method: "POST",
      body: formData,
    });

    const res = await postParseResume(req);
    const json = await res.json();

    console.log("----------------------------------------------------------------");
    console.log(`FILE: ${f}`);
    console.log(`Status: ${res.status}`);
    if (res.status !== 200) {
      console.log(`Error:`, json);
      continue;
    }

    const { resume, verificationReport, evaluation, dynamicQuestions } = json.data;
    console.log(`Candidate Name: ${resume?.contactInfo?.fullName}`);
    console.log(`Extracted Skills: ${resume?.normalizedSkills?.map(s => `${s.normalizedName} (${s.claimedYears || 0}y)`).join(", ")}`);
    console.log(`Composite Score: ${evaluation?.scoreBreakdown?.compositeScore}% | Verdict: ${evaluation?.verdict}`);
    console.log(`Skills Score (50%): ${evaluation?.scoreBreakdown?.skillsScore}%`);
    console.log(`Skill Evidence Matrix:`);
    evaluation?.skillAssessments?.forEach(s => {
      console.log(`   * ${s.skillName.padEnd(12)} -> [${s.evidenceState.padEnd(18)}] (${s.score} pts) | ${s.justification.slice(0, 60)}...`);
    });
    console.log(`Hallucination Flags: ${evaluation?.hallucinationFlags?.length || 0}`);
    evaluation?.hallucinationFlags?.forEach(h => {
      console.log(`   ! [${h.severity}] ${h.claimType}: ${h.suspectClaim} - ${h.reason}`);
    });
    console.log(`Dynamic Rubric Questions Generated: ${dynamicQuestions?.length || 0}`);
    dynamicQuestions?.forEach(q => {
      console.log(`   ? [${q.category}] Target: ${q.targetSkillOrTopic} -> "${q.questionText.slice(0, 70)}..."`);
    });
  }
}

main().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
