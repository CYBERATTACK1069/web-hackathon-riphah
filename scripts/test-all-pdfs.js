const fs = require('fs');
const path = require('path');

// Ensure worker initialized
if (!globalThis.pdfjsWorker) {
  try {
    globalThis.pdfjsWorker = require('pdfjs-dist/legacy/build/pdf.worker.mjs');
  } catch (e1) {
    try {
      globalThis.pdfjsWorker = require('pdfjs-dist/build/pdf.worker.mjs');
    } catch (e2) {
      console.warn('Worker require fallback failed:', e2.message);
    }
  }
}

const { PDFParse } = require('pdf-parse');

const demoDir = path.resolve(__dirname, '../demo_resumes');
const files = fs.readdirSync(demoDir).filter(f => f.endsWith('.pdf'));

async function testAll() {
  console.log(`Found ${files.length} demo PDFs to test:\n`);

  for (const file of files) {
    const filePath = path.join(demoDir, file);
    const buffer = fs.readFileSync(filePath);

    console.log(`--- Testing: ${file} (${buffer.length} bytes) ---`);

    const parser = new PDFParse({ data: buffer });
    const parsedData = await parser.getText();
    const rawText = parsedData?.text?.trim() || '';

    if (typeof parser.destroy === 'function') {
      await parser.destroy();
    }

    console.log(`Extracted characters: ${rawText.length}`);
    console.log(`First 120 chars: "${rawText.slice(0, 120).replace(/\n/g, ' ')}..."`);

    // Verify key candidate phrases
    if (file.includes('Candidate_1')) {
      const hasPython = /python/i.test(rawText);
      const hasDjango = /django/i.test(rawText);
      const hasDocker = /docker/i.test(rawText);
      const hasPostgres = /postgresql/i.test(rawText);
      console.log(`[Validation] Candidate 1 checks: Python=${hasPython}, Django=${hasDjango}, Postgres=${hasPostgres}, Docker=${hasDocker}`);
      if (!hasPython || !hasDjango || !hasDocker || !hasPostgres) {
        throw new Error('Candidate 1 missing core skills');
      }
    } else if (file.includes('Candidate_2')) {
      const hasDjangoAbsence = /0 production django projects/i.test(rawText);
      const hasContainerFamiliarity = /familiarity with containers/i.test(rawText);
      console.log(`[Validation] Candidate 2 checks: DjangoAbsence=${hasDjangoAbsence}, ContainerFamiliarity=${hasContainerFamiliarity}`);
      if (!hasDjangoAbsence || !hasContainerFamiliarity) {
        throw new Error('Candidate 2 missing gap triggers');
      }
    } else if (file.includes('Candidate_3')) {
      const hasJS = /\bJS\b/i.test(rawText);
      const hasTS = /\bTS\b/i.test(rawText);
      const hasPy = /\bPy\b/i.test(rawText);
      const hasPostgres = /\bPostgres\b/i.test(rawText);
      console.log(`[Validation] Candidate 3 checks: JS=${hasJS}, TS=${hasTS}, Py=${hasPy}, Postgres=${hasPostgres}`);
      if (!hasJS || !hasTS || !hasPy || !hasPostgres) {
        throw new Error('Candidate 3 missing normalization synonyms');
      }
    } else if (file.includes('Candidate_4')) {
      const hasClaim = /12 years/i.test(rawText);
      console.log(`[Validation] Candidate 4 checks: 12-year claim=${hasClaim}`);
    }

    console.log(`STATUS: PASS\n`);
  }

  console.log(`All ${files.length} demo PDFs parsed and verified successfully!`);
}

testAll().catch(err => {
  console.error('FATAL TEST ERROR:', err);
  process.exit(1);
});
