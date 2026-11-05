const http = require('http');
const fs = require('fs');
const path = require('path');

const files = [
  'Candidate_1_Strong_Match.pdf',
  'Candidate_2_Partial_Gap.pdf',
  'Candidate_3_Skill_Normalization_Test.pdf',
  'Candidate_4_Hallucination_Stress_Test.pdf',
];

async function check() {
  for (const f of files) {
    const buf = fs.readFileSync(path.join(__dirname, '../demo_resumes', f));
    const boundary = '----b' + Math.random().toString(36);
    const pre = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${f}"\r\n` +
      `Content-Type: application/pdf\r\n\r\n`
    );
    const post = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([pre, buf, post]);

    const res = await new Promise((resolve) => {
      const req = http.request(
        {
          hostname: 'localhost',
          port: 3000,
          path: '/api/parse-resume',
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length,
          },
        },
        (r) => {
          let d = '';
          r.on('data', (c) => (d += c));
          r.on('end', () => {
            try {
              resolve(JSON.parse(d));
            } catch (e) {
              resolve({ raw: d });
            }
          });
        }
      );
      req.write(body);
      req.end();
    });

    console.log('==================================================');
    console.log(`FILE: ${f}`);
    const ev = res.data?.evaluation;
    if (!ev) {
      console.log('NO EVALUATION RETURNED:', res);
      continue;
    }
    console.log(`Candidate: ${res.data?.resume?.contactInfo?.fullName}`);
    console.log(`Composite Score: ${ev.scoreBreakdown?.compositeScore}%`);
    console.log(`Verdict: ${ev.verdict}`);
    console.log(`Score Breakdown (50/25/15/10):`, ev.scoreBreakdown);
    console.log('Skill Evidence Matrix:');
    (ev.skillAssessments || []).forEach((s) => {
      console.log(`  - ${s.skillName.padEnd(12)} -> ${s.evidenceState.padEnd(18)} (${s.score} pts) | ${s.justification.slice(0, 70)}...`);
    });
    console.log(`Hallucination Flags: ${ev.hallucinationFlags?.length || 0}`);
    if (ev.hallucinationFlags?.length > 0) {
      ev.hallucinationFlags.forEach((fl) => {
        console.log(`  [FLAG] ${fl.claimType} (${fl.severity}): ${fl.suspectClaim} - ${fl.reason.slice(0, 75)}...`);
      });
    }
  }
}

check().catch((e) => console.error(e));
