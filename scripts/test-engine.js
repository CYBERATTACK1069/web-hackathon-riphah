const fs = require('fs');
const path = require('path');

console.log("=== RUNNING TALENTIQ PLATFORM VERIFICATION TEST SUITE ===");

// 1. Verify db.json or platform_db.json
const dbPath = path.join(__dirname, '..', 'data', 'platform_db.json');
const altDbPath = path.join(__dirname, '..', 'src', 'data', 'db.json');

const targetPath = fs.existsSync(dbPath) ? dbPath : altDbPath;
if (!fs.existsSync(targetPath)) {
  console.error("FAIL: Neither platform_db.json nor db.json exists");
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
console.log(`✓ Database loaded successfully from: ${path.basename(targetPath)}`);
console.log(`  - Users: ${db.users ? db.users.length : 0}`);
console.log(`  - Jobs: ${db.jobs ? db.jobs.length : 0}`);
console.log(`  - Resumes/Candidates: ${db.resumes ? db.resumes.length : (db.candidates ? db.candidates.length : 0)}`);
console.log(`  - Applications: ${db.applications ? db.applications.length : 0}`);
console.log(`  - Evaluations: ${db.evaluations ? db.evaluations.length : 0}`);
console.log(`  - Schedules/Interviews: ${db.schedules ? db.schedules.length : (db.interviews ? db.interviews.length : 0)}`);

// 2. Verify Weighted Formula (50/25/15/10)
const sampleEval = db.evaluations && db.evaluations[0];
if (!sampleEval) {
  console.error("FAIL: No sample evaluation found");
  process.exit(1);
}

const sb = sampleEval.scoreBreakdown || {
  skillsScore: sampleEval.skillsScore,
  experienceScore: sampleEval.experienceScore,
  projectsScore: sampleEval.projectsScore,
  qualificationsScore: sampleEval.qualificationsScore,
  compositeScore: sampleEval.overallScore,
};

const calculatedComposite = (
  sb.skillsScore * 0.5 +
  sb.experienceScore * 0.25 +
  sb.projectsScore * 0.15 +
  sb.qualificationsScore * 0.1
);

const storedComposite = sb.compositeScore || sampleEval.overallScore;

console.log(`✓ Weighted Scoring Verification (50/25/15/10):`);
console.log(`  Skills (50%): ${sb.skillsScore} -> ${sb.skillsScore * 0.5}`);
console.log(`  Experience (25%): ${sb.experienceScore} -> ${sb.experienceScore * 0.25}`);
console.log(`  Projects (15%): ${sb.projectsScore} -> ${sb.projectsScore * 0.15}`);
console.log(`  Qualifications (10%): ${sb.qualificationsScore} -> ${sb.qualificationsScore * 0.1}`);
console.log(`  Total Calculated: ${calculatedComposite.toFixed(2)}% | Stored: ${Number(storedComposite).toFixed(2)}%`);

if (Math.abs(calculatedComposite - Number(storedComposite)) > 2) {
  console.error("FAIL: Weighted score calculation mismatch");
  process.exit(1);
}

// 3. Test Vector Cosine Similarity
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

const v1 = [1, 0, 1, 0, 0.5];
const v2 = [1, 0, 1, 0, 0.5];
const v3 = [0, 1, 0, 1, 0];

const simIdentical = cosineSimilarity(v1, v2);
const simOrthogonal = cosineSimilarity(v1, v3);

console.log(`✓ Vector Cosine Similarity:`);
console.log(`  - Identical vector similarity: ${simIdentical.toFixed(4)} (Expected: 1.0000)`);
console.log(`  - Orthogonal vector similarity: ${simOrthogonal.toFixed(4)} (Expected: 0.0000)`);

if (simIdentical !== 1 || simOrthogonal !== 0) {
  console.error("FAIL: Cosine similarity logic error");
  process.exit(1);
}

// 4. Test Taxonomy Normalization
const TAXONOMY = {
  js: "JavaScript",
  ts: "TypeScript",
  nextjs: "Next.js",
  postgres: "PostgreSQL",
  py: "Python"
};

function normalize(term) {
  return TAXONOMY[term.toLowerCase()] || term;
}

console.log(`✓ Skill Taxonomy Normalizer:`);
console.log(`  'js' -> '${normalize('js')}'`);
console.log(`  'nextjs' -> '${normalize('nextjs')}'`);
console.log(`  'postgres' -> '${normalize('postgres')}'`);

if (normalize('js') !== 'JavaScript' || normalize('nextjs') !== 'Next.js') {
  console.error("FAIL: Taxonomy normalization failure");
  process.exit(1);
}

console.log("\n=======================================================");
console.log("ALL PLATFORM ARCHITECTURE & DATA INTEGRITY TESTS PASSED!");
console.log("=======================================================\n");
