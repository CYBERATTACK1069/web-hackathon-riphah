const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function loadTs(file) {
  const code = fs.readFileSync(file, 'utf8');
  const js = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  const mod = { exports: {} };
  const customRequire = (id) => {
    if (id === './ai' || id.endsWith('/ai')) {
      return loadTs(path.join(__dirname, '..', 'src', 'lib', 'ai.ts'));
    }
    return require(id);
  };
  const fn = new Function('require', 'exports', 'module', '__dirname', '__filename', js);
  fn(customRequire, mod.exports, mod, path.dirname(file), file);
  return mod.exports;
}

const { extractTextFromPdfBuffer, parseResumeContent } = loadTs(path.join(__dirname, '..', 'src', 'lib', 'pdf.ts'));

const f1 = fs.readFileSync(path.join(__dirname, '..', 'demo_resumes', 'Candidate 1 - Strong Match (Ali Raza).pdf'));
const text1 = extractTextFromPdfBuffer(f1);
const p1 = parseResumeContent(text1);
console.log('✓ Candidate 1:', p1.fullName, '|', p1.email, '| Skills:', p1.skills.map(s => s.normalizedName).join(', '));

const f2 = fs.readFileSync(path.join(__dirname, '..', 'demo_resumes', 'Candidate 2 - Partial Gap (Sara Khan).pdf'));
const text2 = extractTextFromPdfBuffer(f2);
const p2 = parseResumeContent(text2);
console.log('✓ Candidate 2:', p2.fullName, '|', p2.email, '| Skills:', p2.skills.map(s => s.normalizedName).join(', '));

const f3 = fs.readFileSync(path.join(__dirname, '..', 'demo_resumes', 'Candidate 3 - Skill Normalization Test (Usman Tariq).pdf'));
const text3 = extractTextFromPdfBuffer(f3);
const p3 = parseResumeContent(text3);
console.log('✓ Candidate 3:', p3.fullName, '|', p3.email, '| Skills:', p3.skills.map(s => s.normalizedName).join(', '));

// Test empty resume error handling
try {
  parseResumeContent('   ');
  console.error('FAIL: Empty resume did not throw');
  process.exit(1);
} catch (e) {
  console.log('✓ Empty resume rejected gracefully:', e.message);
}
