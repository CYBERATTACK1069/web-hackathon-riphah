/**
 * Comprehensive Automated Test Suite for AI Recruitment Pipelines
 * Tests:
 * 1. Deterministic & AI-Assisted Skill Normalizer (normalizer.ts)
 * 2. Deterministic AI Hallucination & Excerpt Verifier (verifier.ts)
 * 3. AI Job Requirement Extractor & Strict 1.0 (100%) Weight Distribution (job-extractor.ts)
 * 4. Hardened Resume Upload & Parsing Engine (resume-parser.ts)
 */

const assert = require("assert");
const path = require("path");
const jiti = require("jiti")(__filename, {
  alias: {
    "@": path.resolve(__dirname, "../../.."),
  },
});

const {
  normalizeSkillName,
  normalizeSkills,
  normalizeSkillWithAI,
  normalizeSkillsWithAI,
  toResumeSkillCategory,
} = jiti("../normalizer.ts");
const {
  verifyExcerptInText,
  verifyAllClaims,
  calculateCareerDurationYears,
} = jiti("../verifier.ts");
const { extractJobRequirements } = jiti("../job-extractor.ts");
const {
  parseResumeText,
  extractTextFromPdf,
  formatExperienceDuration,
} = jiti("../resume-parser.ts");

async function runTests() {
  console.log("=== STARTING AI PIPELINE VERIFICATION SUITE ===\n");
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`✗ FAIL: ${name}`);
      console.error(e);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`✗ FAIL: ${name}`);
      console.error(e);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST SUITE 1: CANONICAL SKILL NORMALIZATION
  // -------------------------------------------------------------
  console.log("--- Suite 1: Canonical Normalization ---");

  test("Normalizes 'JS' to 'JavaScript' (language)", () => {
    const res = normalizeSkillName("JS");
    assert.strictEqual(res.canonicalName, "JavaScript");
    assert.strictEqual(res.category, "language");
    assert.strictEqual(res.isAliasMatched, true);
  });

  test("Normalizes 'Postgres' to 'PostgreSQL' (database)", () => {
    const res = normalizeSkillName("Postgres");
    assert.strictEqual(res.canonicalName, "PostgreSQL");
    assert.strictEqual(res.category, "database");
    assert.strictEqual(res.isAliasMatched, true);
  });

  test("Normalizes 'k8s' to 'Kubernetes' (devops)", () => {
    const res = normalizeSkillName("k8s");
    assert.strictEqual(res.canonicalName, "Kubernetes");
    assert.strictEqual(res.category, "devops");
    assert.strictEqual(res.isAliasMatched, true);
  });

  test("Normalizes 'Py' to 'Python' (language)", () => {
    const res = normalizeSkillName("Py");
    assert.strictEqual(res.canonicalName, "Python");
    assert.strictEqual(res.category, "language");
    assert.strictEqual(res.isAliasMatched, true);
  });

  test("Normalizes 'Docker' correctly with isAliasMatched: false", () => {
    const res = normalizeSkillName("Docker");
    assert.strictEqual(res.canonicalName, "Docker");
    assert.strictEqual(res.category, "devops");
    assert.strictEqual(res.isAliasMatched, false);
  });

  test("Handles empty or null skill names safely", () => {
    const res = normalizeSkillName("");
    assert.strictEqual(res.canonicalName, "Unknown");
    assert.strictEqual(res.category, "other");
  });

  test("Bulk normalizes and deduplicates skills", () => {
    const res = normalizeSkills(["JS", "JavaScript", "postgres", "PostgreSQL", "k8s"]);
    assert.strictEqual(res.length, 3);
    assert.strictEqual(res[0].canonicalName, "JavaScript");
    assert.strictEqual(res[1].canonicalName, "PostgreSQL");
    assert.strictEqual(res[2].canonicalName, "Kubernetes");
  });

  test("toResumeSkillCategory maps soft_skill to 'other' for platform adherence", () => {
    assert.strictEqual(toResumeSkillCategory("soft_skill"), "other");
    assert.strictEqual(toResumeSkillCategory("database"), "database");
  });

  await asyncTest("normalizeSkillWithAI resolves known and unknown skills gracefully", async () => {
    const res = await normalizeSkillWithAI("TS");
    assert.strictEqual(res.canonicalName, "TypeScript");
    assert.strictEqual(res.category, "language");

    const bulk = await normalizeSkillsWithAI(["k8s", "Go", "golang"]);
    assert.strictEqual(bulk.length, 2);
  });

  // -------------------------------------------------------------
  // TEST SUITE 2: DETERMINISTIC HALLUCINATION VERIFIER
  // -------------------------------------------------------------
  console.log("\n--- Suite 2: Hallucination & Excerpt Verifier ---");

  const sampleDoc = "Lead Architect with 6 years experience in PostgreSQL and Kubernetes at Stripe from 2021 to Present.";

  test("Verifies exact verbatim excerpt with 1.0 confidence", () => {
    const check = verifyExcerptInText("6 years experience in PostgreSQL", sampleDoc);
    assert.strictEqual(check.verified, true);
    assert.strictEqual(check.confidence, 1.0);
    assert(check.characterStart >= 0);
    assert(check.characterEnd > check.characterStart);
    assert(check.contextSnippet.includes("PostgreSQL"));
  });

  test("Verifies case-insensitive verbatim excerpt", () => {
    const check = verifyExcerptInText("LEAD ARCHITECT WITH 6 YEARS", sampleDoc);
    assert.strictEqual(check.verified, true);
    assert(check.confidence >= 0.95);
  });

  test("Verifies multi-line wrapped excerpt across line breaks and extra whitespace", () => {
    const multiLineDoc = "Alex Morgan\nSenior Cloud Architect at\nStripe Platform Services\nSan Francisco, CA";
    const excerpt = "Senior Cloud Architect at Stripe Platform Services";
    const check = verifyExcerptInText(excerpt, multiLineDoc);
    assert.strictEqual(check.verified, true, "Must verify excerpt wrapped across newlines");
    assert(check.confidence >= 0.90);
    assert(check.characterStart >= 0);
  });

  test("Fails and flags ungrounded / hallucinated excerpt", () => {
    const check = verifyExcerptInText("Architected QuantumFlux quantum database cluster", sampleDoc);
    assert.strictEqual(check.verified, false);
    assert.strictEqual(check.confidence, 0);
    assert.strictEqual(check.characterStart, -1);
  });

  test("Detects temporal impossibility for ongoing jobs (12y claimed vs 6y total career)", () => {
    const report = verifyAllClaims(
      sampleDoc,
      [
        {
          targetField: "skill",
          identifier: "Kubernetes",
          sourceExcerpt: "Kubernetes at Stripe",
          claimedYears: 12, // Impossible given career starts 2021
        },
      ],
      [{ startDate: "2021", endDate: "Present", isCurrent: true }]
    );

    assert.strictEqual(report.overallRiskLevel, "critical");
    const temporalFlag = report.flags.find((f) => f.claimType === "temporal_impossibility");
    assert(temporalFlag !== undefined, "Expected temporal_impossibility flag");
    assert.strictEqual(temporalFlag.severity, "critical");
    assert.strictEqual(temporalFlag.status, "verified_hallucination");
    assert(temporalFlag.reason.includes("documented employment history spans"));
  });

  test("Detects temporal impossibility for past-only completed jobs (2018-2021 = 4y, claimed 7y)", () => {
    const duration = calculateCareerDurationYears([{ startDate: "2018", endDate: "2021" }]);
    assert.strictEqual(duration, 4, `Expected 4 years duration for 2018-2021, got ${duration}`);

    const pastDoc = "Software Engineer at Acme Corp from 2018 to 2021 with Python.";
    const report = verifyAllClaims(
      pastDoc,
      [
        {
          targetField: "skill",
          identifier: "Python",
          sourceExcerpt: "Python",
          claimedYears: 7, // 7y claimed vs 4y duration
        },
      ],
      [{ startDate: "2018", endDate: "2021", isCurrent: false }]
    );

    const temporalFlag = report.flags.find((f) => f.claimType === "temporal_impossibility");
    assert(temporalFlag !== undefined, "Must flag temporal impossibility on past-only job");
    assert.strictEqual(temporalFlag.severity, "critical");
  });

  test("Calculates clean report for fully grounded claims", () => {
    const report = verifyAllClaims(
      sampleDoc,
      [
        {
          targetField: "skill",
          identifier: "PostgreSQL",
          sourceExcerpt: "PostgreSQL and Kubernetes",
          claimedYears: 4,
        },
      ],
      [{ startDate: "2020", endDate: "Present", isCurrent: true }]
    );

    assert.strictEqual(report.overallRiskLevel, "clean");
    assert.strictEqual(report.verifiedCount, 1);
    assert.strictEqual(report.unverifiedCount, 0);
    assert.strictEqual(report.flags.length, 0);
  });

  // -------------------------------------------------------------
  // TEST SUITE 3: JOB REQUIREMENT EXTRACTOR & WEIGHTS
  // -------------------------------------------------------------
  console.log("\n--- Suite 3: Job Requirement Extractor ---");

  await asyncTest("Extracts job requirements with strict 1.0 (100%) weight sum and deduplication", async () => {
    const jobText = `
Role: Senior Cloud Infrastructure Engineer
Department: Cloud Systems
Location: San Francisco, CA (Hybrid)
We are looking for a Senior Cloud Engineer with 5+ years experience.
Must have deep knowledge of TypeScript, React, PostgreSQL, Docker, and Kubernetes.
Preferred: GraphQL, Terraform.
Responsibilities:
- Build cloud microservices
- Maintain CI/CD pipelines
Qualifications:
- Bachelor's in CS
- 5+ years building backend systems
`;

    const result = await extractJobRequirements({ description: jobText });

    assert(result.vacancy.title.includes("Cloud"));
    assert(result.requiredSkills.length >= 3);

    // Verify weights sum strictly to 1.0 (100%)
    const sum = result.requiredSkills.reduce((acc, curr) => acc + curr.weight, 0);
    const roundedSum = Math.round(sum * 100) / 100;
    assert.strictEqual(roundedSum, 1.0, `Weights must sum to exactly 1.0, got ${roundedSum}`);

    // Verify canonical normalization occurred
    const postgresReq = result.requiredSkills.find((s) => s.name === "PostgreSQL");
    assert(postgresReq !== undefined, "Expected PostgreSQL in required skills");
    assert.strictEqual(postgresReq.category, "database");

    // Verify no overlap between required and preferred skills
    const requiredNames = new Set(result.requiredSkills.map((s) => s.name.toLowerCase()));
    for (const pref of result.preferredSkills) {
      assert(!requiredNames.has(pref.name.toLowerCase()), `Preferred skill ${pref.name} should not duplicate required`);
    }
  });

  await asyncTest("Rejects empty job description gracefully", async () => {
    try {
      await extractJobRequirements({ description: "" });
      assert.fail("Should have thrown error on empty description");
    } catch (e) {
      assert(e.message.includes("cannot be empty"));
    }
  });

  // -------------------------------------------------------------
  // TEST SUITE 4: HARDENED RESUME PARSING PIPELINE
  // -------------------------------------------------------------
  console.log("\n--- Suite 4: Resume Parsing Pipeline ---");

  test("extractTextFromPdf rejects non-PDF header", async () => {
    try {
      await extractTextFromPdf(Buffer.from("invalid plain text without pdf header"));
      assert.fail("Should have thrown on non-PDF buffer");
    } catch (e) {
      assert(e.message.includes("INVALID_PDF_HEADER"));
    }
  });

  test("extractTextFromPdf rejects empty buffer", async () => {
    try {
      await extractTextFromPdf(Buffer.from(""));
      assert.fail("Should have thrown on empty buffer");
    } catch (e) {
      assert(e.message.includes("EMPTY_BUFFER"));
    }
  });

  await asyncTest("extractTextFromPdf parses real PDF buffer and strips page markers", async () => {
    const pdfContent = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 120>>stream\nBT /F1 12 Tf 100 700 Td (Alex Morgan Senior Cloud Architect at Stripe with PostgreSQL and Kubernetes from 2021 to Present) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000216 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n386\n%%EOF';
    const text = await extractTextFromPdf(Buffer.from(pdfContent));
    assert(text.includes("Alex Morgan"));
    assert(!text.includes("-- 1 of 1 --"), "Page marker '-- 1 of 1 --' should be stripped");

    // Also verify parseResumeText correctly extracts Alex Morgan (not page footer or title)
    const parsed = await parseResumeText(text);
    assert.strictEqual(parsed.resume.contactInfo.fullName, "Alex Morgan");
    assert(!parsed.resume.candidateId.includes("1-of-1"), "Candidate ID must not contain page markers");
  });

  test("formatExperienceDuration formats ongoing and past positions correctly", () => {
    const ongoing = formatExperienceDuration("2021", "Present", true);
    assert(ongoing.includes("2021 – Present"));
    assert(ongoing.includes("yr"));

    const past = formatExperienceDuration("2018", "2021", false);
    assert.strictEqual(past, "2018 – 2021 (~3 yrs)");
  });

  await asyncTest("Parses full resume text into structured ParsedResume", async () => {
    const resumeText = `Sarah Jenkins
Senior Staff Engineer
Email: sarah.jenkins@gmail.com | Phone: +1 415 555 0192
Location: San Francisco, CA | LinkedIn: linkedin.com/in/sarahjenkins

SUMMARY
Senior software engineer with 6 years experience specializing in PostgreSQL, React, and TypeScript.

EXPERIENCE
Staff Engineer | GitHub
San Francisco, CA | 2020 - Present
- Architected high throughput distributed systems in TypeScript.
- Maintained high-availability PostgreSQL databases.

EDUCATION
Stanford University | 2016 - 2020
Bachelor of Science in Computer Science
`;

    const result = await parseResumeText(resumeText, {
      fileName: "sarah_jenkins.txt",
      mimeType: "text/plain",
    });

    assert.strictEqual(result.resume.contactInfo.fullName, "Sarah Jenkins");
    assert.strictEqual(result.resume.contactInfo.email, "sarah.jenkins@gmail.com");
    assert(result.resume.normalizedSkills.length >= 2);
    assert(result.resume.excerptMapping.length > 0);
    assert(result.resume.parsingConfidence > 0.8);
    assert.strictEqual(result.verificationReport.overallRiskLevel, "clean");
  });

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n===============================================");
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("===============================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution aborted:", err);
  process.exit(1);
});
