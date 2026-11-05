const http = require('http');
const fs = require('fs');
const path = require('path');

const demoDir = path.resolve(__dirname, '../demo_resumes');
const files = [
  'Candidate_1_Strong_Match.pdf',
  'Candidate_2_Partial_Gap.pdf',
  'Candidate_3_Skill_Normalization_Test.pdf',
  'Candidate_4_Hallucination_Stress_Test.pdf',
];

function uploadPdf(fileName) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(demoDir, fileName);
    const pdfBuffer = fs.readFileSync(filePath);
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    const pre = Buffer.from(
      '--' + boundary + '\r\n' +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
      'Content-Type: application/pdf\r\n\r\n'
    );
    const post = Buffer.from('\r\n--' + boundary + '--\r\n');
    const body = Buffer.concat([pre, pdfBuffer, post]);

    const req = http.request({
      hostname: 'localhost',
      port: parseInt(process.env.PORT || '3000', 10),
      path: '/api/parse-resume',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': body.length,
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  console.log('Testing upload of all 4 demo PDF resumes to POST /api/parse-resume...\n');

  for (const fileName of files) {
    console.log(`Uploading: ${fileName}...`);
    const res = await uploadPdf(fileName);
    console.log(`Status: ${res.status}`);
    if (res.status === 200 && res.data.success) {
      const resume = res.data.data.resume;
      console.log(`  Candidate: ${resume.contactInfo?.fullName}`);
      console.log(`  Skills Count: ${resume.normalizedSkills?.length}`);
      console.log(`  Skills: ${resume.normalizedSkills?.map(s => s.name).join(', ')}`);
      console.log(`  Verification Ratio: ${res.data.data.verification?.verificationRatio}`);
      console.log(`  Model: ${res.data.data.modelUsed} (isFallback=${res.data.data.isFallback})`);
      console.log(`  [PASS]\n`);
    } else {
      console.error(`  [FAIL]`, res);
      process.exit(1);
    }
  }

  console.log('ALL 4 DEMO PDF RESUMES TESTED AND PASSED WITH 200 OK!');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
