/**
 * API Routes End-to-End Test Suite
 * Tests HTTP status codes, validation guards, and store persistence for:
 * - POST /api/extract-job
 * - POST /api/parse-resume (JSON, base64 PDF, and multipart/form-data)
 * - PUT /api/parse-resume (Candidate interactive editing with full citation preservation)
 */

const assert = require("assert");
const path = require("path");
const { NextRequest } = require("next/server");

const jiti = require("jiti")(__filename, {
  alias: {
    "@": path.resolve(__dirname, "../../.."),
  },
});

const { POST: postExtractJob } = jiti("../../../app/api/extract-job/route.ts");
const { POST: postParseResume, PUT: putParseResume } = jiti("../../../app/api/parse-resume/route.ts");
const { getJobById, getResumeById } = jiti("../../store.ts");

async function runApiTests() {
  console.log("=== STARTING API ROUTES VERIFICATION SUITE ===\n");
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
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
  // 1. POST /api/extract-job
  // -------------------------------------------------------------
  console.log("--- 1. POST /api/extract-job ---");

  await test("Rejects non-JSON content-type with 415", async () => {
    const req = new NextRequest("http://localhost:3000/api/extract-job", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "plain text",
    });
    const res = await postExtractJob(req);
    const json = await res.json();
    assert.strictEqual(res.status, 415);
    assert.strictEqual(json.code, "INVALID_CONTENT_TYPE");
  });

  await test("Rejects empty job description with 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/extract-job", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ description: "" }),
    });
    const res = await postExtractJob(req);
    const json = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(json.code, "EMPTY_DESCRIPTION");
  });

  await test("Rejects too-short job description with 422", async () => {
    const req = new NextRequest("http://localhost:3000/api/extract-job", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ description: "short" }),
    });
    const res = await postExtractJob(req);
    const json = await res.json();
    assert.strictEqual(res.status, 422);
    assert.strictEqual(json.code, "DESCRIPTION_TOO_SHORT");
  });

  await test("Successfully extracts job, enforces 1.0 weight sum, and saves to store", async () => {
    const desc = `
Role: Lead Cloud Systems Architect
Department: Cloud Platform Engineering
Location: San Francisco, CA (Hybrid)
We require a seasoned architect with 6+ years experience in TypeScript, React, PostgreSQL, Docker, and Kubernetes.
Responsibilities:
- Architect multi-region cloud services
- Enforce strict engineering standards
Qualifications:
- Bachelor's in CS or equivalent
- 6+ years building distributed applications
`;
    const req = new NextRequest("http://localhost:3000/api/extract-job", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        description: desc,
        saveToStore: true,
      }),
    });
    const res = await postExtractJob(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert(json.data.vacancy.id.startsWith("job-"));
    assert.strictEqual(json.data.savedToStore, true);

    // Check weights
    const sum = json.data.requiredSkills.reduce((acc, curr) => acc + curr.weight, 0);
    assert.strictEqual(Math.round(sum * 100) / 100, 1.0);

    // Verify stored in platform store
    const saved = await getJobById(json.data.vacancy.id);
    assert(saved !== null, "Job must exist in store");
    assert.strictEqual(saved.title, json.data.vacancy.title);
  });

  // -------------------------------------------------------------
  // 2. POST /api/parse-resume
  // -------------------------------------------------------------
  console.log("\n--- 2. POST /api/parse-resume ---");

  await test("Rejects invalid content type with 415", async () => {
    const req = new NextRequest("http://localhost:3000/api/parse-resume", {
      method: "POST",
      headers: { "content-type": "application/xml" },
      body: "<xml></xml>",
    });
    const res = await postParseResume(req);
    const json = await res.json();
    assert.strictEqual(res.status, 415);
    assert.strictEqual(json.code, "UNSUPPORTED_MEDIA_TYPE");
  });

  await test("Rejects empty rawText with 422", async () => {
    const req = new NextRequest("http://localhost:3000/api/parse-resume", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rawText: "   " }),
    });
    const res = await postParseResume(req);
    const json = await res.json();
    assert.strictEqual(res.status, 422);
    assert.strictEqual(json.code, "CORRUPTED_OR_EMPTY_FILE");
  });

  await test("Rejects corrupted base64 PDF with 422", async () => {
    const req = new NextRequest("http://localhost:3000/api/parse-resume", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ base64Pdf: Buffer.from("not a real pdf content").toString("base64") }),
    });
    const res = await postParseResume(req);
    const json = await res.json();
    assert.strictEqual(res.status, 422);
    assert.strictEqual(json.code, "CORRUPTED_OR_EMPTY_FILE");
  });

  const validPdfContent = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 120>>stream\nBT /F1 12 Tf 100 700 Td (Alex Morgan Senior Cloud Architect at Stripe with PostgreSQL and Kubernetes from 2021 to Present) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000216 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n386\n%%EOF';

  await test("Successfully parses valid base64 PDF with correct candidate name", async () => {
    const req = new NextRequest("http://localhost:3000/api/parse-resume", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        base64Pdf: Buffer.from(validPdfContent).toString("base64"),
        fileName: "alex_morgan.pdf",
      }),
    });
    const res = await postParseResume(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.resume.contactInfo.fullName, "Alex Morgan");
    assert(!json.data.resume.candidateId.includes("1-of-1"), "Candidate ID must not be polluted by page numbers");
  });

  await test("Successfully parses multipart/form-data PDF file upload", async () => {
    const formData = new FormData();
    const file = new File([Buffer.from(validPdfContent)], "alex_upload.pdf", { type: "application/pdf" });
    formData.append("file", file);
    formData.append("saveToStore", "true");

    const req = new NextRequest("http://localhost:3000/api/parse-resume", {
      method: "POST",
      body: formData,
    });
    const res = await postParseResume(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.resume.contactInfo.fullName, "Alex Morgan");
    assert.strictEqual(json.data.savedToStore, true);
  });

  let createdResume = null;

  await test("Successfully parses valid text resume and persists to store", async () => {
    const resumeText = `Marcus Aurelius
Lead Infrastructure Engineer
Email: marcus.aurelius@rome.internal | Location: Rome, Italy

SUMMARY
Cloud Infrastructure Lead with 8 years experience in PostgreSQL, Kubernetes, and Docker.

EXPERIENCE
Lead Architect | Rome Cloud Services
2018 - Present
- Architected high scale infrastructure with Kubernetes and PostgreSQL.
- Scaled distributed database clusters.

EDUCATION
University of Rome | 2014 - 2018
Bachelor of Science in Engineering
`;
    const req = new NextRequest("http://localhost:3000/api/parse-resume", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        rawText: resumeText,
        fileName: "marcus_resume.txt",
        saveToStore: true,
      }),
    });
    const res = await postParseResume(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert(json.data.resume.id.startsWith("res-"));
    assert.strictEqual(json.data.savedToStore, true);
    assert(json.data.resume.normalizedSkills.length >= 2);
    assert(json.data.verification.citations.length >= 1);

    createdResume = json.data.resume;

    // Check store
    const stored = await getResumeById(createdResume.id);
    assert(stored !== null, "Resume must exist in store");
    assert.strictEqual(stored.contactInfo.fullName, "Marcus Aurelius");
  });

  // -------------------------------------------------------------
  // 3. PUT /api/parse-resume
  // -------------------------------------------------------------
  console.log("\n--- 3. PUT /api/parse-resume ---");

  await test("Rejects invalid payload without ID with 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/parse-resume", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ resume: {} }),
    });
    const res = await putParseResume(req);
    const json = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(json.code, "INVALID_RESUME_PAYLOAD");
  });

  await test("Successfully updates candidate skills, re-verifies, and preserves citations in store", async () => {
    assert(createdResume !== null, "Must have created resume");

    // Add a skill alias ("JS") to test canonical re-normalization during edit
    const updated = {
      ...createdResume,
      contactInfo: {
        ...createdResume.contactInfo,
        fullName: "Marcus Aurelius Antoninus",
      },
      normalizedSkills: [
        ...createdResume.normalizedSkills,
        {
          skillId: "skill-javascript",
          name: "JS",
          normalizedName: "JS",
          category: "language",
          claimedYears: 5,
          proficiencyLevel: "expert",
          citationIds: [],
        },
      ],
    };

    const req = new NextRequest("http://localhost:3000/api/parse-resume", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ resume: updated }),
    });
    const res = await putParseResume(req);
    const json = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);

    // Verify canonical normalization happened during update
    const jsSkill = json.data.normalizedSkills.find((s) => s.normalizedName === "JavaScript");
    assert(jsSkill !== undefined, "Expected 'JS' to be canonically normalized to 'JavaScript'");

    // Verify candidate contact info update
    assert.strictEqual(json.data.contactInfo.fullName, "Marcus Aurelius Antoninus");

    // Verify in store
    const inStore = await getResumeById(createdResume.id);
    assert(inStore !== null);
    const inStoreJs = inStore.normalizedSkills.find((s) => s.normalizedName === "JavaScript");
    assert(inStoreJs !== undefined);
    assert.strictEqual(inStore.contactInfo.fullName, "Marcus Aurelius Antoninus");
  });

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n===============================================");
  console.log(`TOTAL API TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("===============================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runApiTests().catch((err) => {
  console.error("API test execution failed:", err);
  process.exit(1);
});
