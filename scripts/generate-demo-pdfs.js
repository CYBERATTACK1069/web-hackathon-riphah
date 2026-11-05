/**
 * Generate standard compliant, text-searchable PDF files
 * for hackathon judging demo scenarios.
 */
const fs = require('fs');
const path = require('path');

function createSimplePdf(lines) {
  // Build text stream
  let streamContent = 'BT\n/F1 11 Tf\n50 740 Td\n14 TL\n';
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (rawLine === '') {
      streamContent += 'T*\n';
    } else {
      // Escape parentheses and backslashes in PDF string literals
      const escaped = rawLine.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      streamContent += `(${escaped}) Tj T*\n`;
    }
  }
  streamContent += 'ET\n';

  const streamBuffer = Buffer.from(streamContent, 'utf-8');
  const streamLength = streamBuffer.length;

  const header = '%PDF-1.4\n';
  
  // Object 1: Catalog
  const obj1 = '1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj\n';
  // Object 2: Pages
  const obj2 = '2 0 obj\n<</Type /Pages /Kids [3 0 R] /Count 1>>\nendobj\n';
  // Object 3: Page
  const obj3 = '3 0 obj\n<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R>>\nendobj\n';
  // Object 4: Stream
  const obj4Start = `4 0 obj\n<</Length ${streamLength}>>\nstream\n`;
  const obj4End = '\nendstream\nendobj\n';
  // Object 5: Standard Type 1 Font
  const obj5 = '5 0 obj\n<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>\nendobj\n';

  // Calculate byte offsets for XRef table
  const offsets = [];
  let currentOffset = header.length;

  offsets.push(currentOffset);
  currentOffset += Buffer.byteLength(obj1, 'utf-8');

  offsets.push(currentOffset);
  currentOffset += Buffer.byteLength(obj2, 'utf-8');

  offsets.push(currentOffset);
  currentOffset += Buffer.byteLength(obj3, 'utf-8');

  offsets.push(currentOffset);
  currentOffset += Buffer.byteLength(obj4Start, 'utf-8') + streamLength + Buffer.byteLength(obj4End, 'utf-8');

  offsets.push(currentOffset);
  currentOffset += Buffer.byteLength(obj5, 'utf-8');

  const xrefOffset = currentOffset;

  let xref = 'xref\n0 6\n';
  xref += '0000000000 65535 f \n';
  for (const off of offsets) {
    xref += off.toString().padStart(10, '0') + ' 00000 n \n';
  }

  const trailer = `trailer\n<</Size 6 /Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.concat([
    Buffer.from(header, 'utf-8'),
    Buffer.from(obj1, 'utf-8'),
    Buffer.from(obj2, 'utf-8'),
    Buffer.from(obj3, 'utf-8'),
    Buffer.from(obj4Start, 'utf-8'),
    streamBuffer,
    Buffer.from(obj4End, 'utf-8'),
    Buffer.from(obj5, 'utf-8'),
    Buffer.from(xref, 'utf-8'),
    Buffer.from(trailer, 'utf-8'),
  ]);
}

const outDir = path.resolve(__dirname, '../demo_resumes');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// -------------------------------------------------------------
// Candidate 1: Ali Raza (Strong Match, ~92%, Shortlist Target)
// -------------------------------------------------------------
const aliRazaLines = [
  'ALI RAZA',
  'Senior Python & Django Backend Engineer',
  'Email: ali.raza.backend@gmail.com | Phone: +92 (300) 555-0142 | Location: Islamabad, Pakistan',
  'GitHub: github.com/aliraza-core | LinkedIn: linkedin.com/in/aliraza-backend',
  '',
  'PROFESSIONAL SUMMARY',
  'Dedicated Backend Software Engineer with 4 years of hands-on experience designing and maintaining',
  'high-throughput distributed microservices using Python and Django REST Framework. Proven expertise',
  'in PostgreSQL query optimization, B-Tree and GIN indexing, and Docker multi-stage containerization.',
  'Extensive track record deploying automated CI/CD pipelines with zero downtime.',
  '',
  'CORE TECHNICAL SKILLS',
  'Programming Languages: Python 3.10-3.12 (4 years, Expert), SQL, Bash',
  'Web Frameworks: Django (4 years, Expert), Django REST Framework, Celery, Pytest',
  'Databases & Storage: PostgreSQL (3 years, Advanced), Redis caching, Query Optimization',
  'DevOps & Cloud: Docker (2 years, Proficient), Docker Compose, CI/CD pipelines, AWS, Git',
  '',
  'WORK EXPERIENCE',
  'Senior Backend Developer | CloudScale Solutions | 2022 - Present',
  '- Architected scalable RESTful services in Python and Django REST Framework processing 8M+ daily requests.',
  '- Optimized high-load PostgreSQL database queries with composite indexing, reducing latency by 45%.',
  '- Built and managed production Docker containers and orchestrated automated GitHub Actions CI/CD.',
  '- Implemented asynchronous Celery job queues backed by Redis for email and transactional pipelines.',
  '',
  'Backend Software Engineer | Apex Tech Innovations | 2020 - 2022',
  '- Built transactional API services using Python and Django with PostgreSQL datastores.',
  '- Containerized application services using Docker and configured Docker Compose for local environments.',
  '- Wrote comprehensive unit and integration test suites using pytest with 92% coverage.',
  '',
  'PROJECTS',
  'FinStream Distributed Ledger (Open Source)',
  '- High-throughput financial transaction engine written in Python and Django REST Framework.',
  '- Benchmarked at 3,200 requests/sec with PostgreSQL connection pooling and Docker Compose orchestration.',
  '',
  'EDUCATION & CERTIFICATIONS',
  'Bachelor of Science in Computer Science (B.S.) | NUST (2016 - 2020)',
  'Docker Certified Associate (DCA) | Docker Inc. (2023)'
];

// -------------------------------------------------------------
// Candidate 2: Sara Khan (Partial Gap: Docker unconfirmed, Django absent)
// -------------------------------------------------------------
const saraKhanLines = [
  'SARA KHAN',
  'Python API Developer (FastAPI & Flask)',
  'Email: sara.khan.dev@gmail.com | Phone: +92 (321) 555-8821 | Location: Lahore, Pakistan',
  'GitHub: github.com/sarakhan-dev | LinkedIn: linkedin.com/in/sarakhan-python',
  '',
  'PROFESSIONAL SUMMARY',
  'Backend developer with 2 years of professional experience developing REST APIs and microservices',
  'using Python, FastAPI, and Flask. Strong background in relational database modeling in PostgreSQL.',
  'Note: 0 production Django projects (primary experience in micro-frameworks FastAPI and Flask).',
  'Possess general familiarity with containers, but have not managed production Docker environments.',
  '',
  'CORE TECHNICAL SKILLS',
  'Programming Languages: Python (2 years, Competent), SQL, JavaScript',
  'Web Frameworks: FastAPI, Flask (Note: 0 production Django projects; exclusively micro-frameworks)',
  'Databases: PostgreSQL (2 years, Competent), SQLite, Redis',
  'DevOps & Tools: Git, GitHub, Linux, Familiarity with containers (watched Docker tutorials)',
  '',
  'WORK EXPERIENCE',
  'Python Backend Developer | DataPulse Tech | 2022 - Present',
  '- Developed lightweight asynchronous APIs using Python and FastAPI for real-time analytics dashboards.',
  '- Designed relational database tables and written complex SQL queries in PostgreSQL.',
  '- Collaborated with DevOps engineers; gained familiarity with containers during staging deployments.',
  '- Explicit note: Focused exclusively on FastAPI and Flask; 0 production Django projects completed.',
  '',
  'Junior Software Engineer | InnovateSoft Labs | 2021 - 2022',
  '- Built internal reporting tools and data export utilities using Python and Flask.',
  '- Maintained PostgreSQL database migrations and performed routine database backup scripts.',
  '',
  'EDUCATION',
  'Bachelor of Science in Software Engineering (B.S.) | FAST-NUCES (2017 - 2021)'
];

// -------------------------------------------------------------
// Candidate 3: Usman Tariq (Skill Normalization Test: Synonyms/Aliases)
// -------------------------------------------------------------
const usmanTariqLines = [
  'USMAN TARIQ',
  'Full-Stack Developer (Node & Frontend)',
  'Email: usman.tariq.code@gmail.com | Phone: +92 (333) 555-4920 | Location: Karachi, Pakistan',
  'GitHub: github.com/usmantariq-code | LinkedIn: linkedin.com/in/usman-tariq-dev',
  '',
  'PROFESSIONAL SUMMARY',
  'Versatile Full-Stack Engineer with 3 years experience building dynamic web apps using JS, TS, and Py.',
  'Skilled with Postgres databases and modern frontend architectures with React and Node.js.',
  '',
  'SKILLS & ALIASES (TESTING CANONICAL NORMALIZATION)',
  'Languages: JS (JavaScript), TS (TypeScript), Py (Python), HTML5, CSS3',
  'Frameworks: Node.js, Express, React, Next.js',
  'Databases: Postgres (PostgreSQL), MongoDB',
  'DevOps & Tools: Git, GitHub, Linux, K8s (Kubernetes), Docker (Basic)',
  '',
  'WORK EXPERIENCE',
  'Full-Stack Developer | DevNexus Systems | 2021 - Present',
  '- Built responsive frontend features with React and TS, backed by Node.js microservices.',
  '- Wrote Py (Python) automation scripts to sync third-party REST APIs into our Postgres datastore.',
  '- Maintained database schema migrations in Postgres and tuned basic queries.',
  '- Containerized staging microservices with Docker and deployed to test K8s clusters.',
  '',
  'Junior Web Developer | PixelCraft Studio | 2020 - 2021',
  '- Created interactive web components using JS and CSS.',
  '- Assisted with backend integration using Express and Postgres.',
  '',
  'EDUCATION',
  'Bachelor of Computer Applications | University of Karachi (2016 - 2020)'
];

// -------------------------------------------------------------
// Candidate 4: Taylor Vance (Hallucination Alert / Contradiction)
// -------------------------------------------------------------
const taylorVanceLines = [
  'TAYLOR VANCE',
  'Junior Developer claiming Senior Architect',
  'Email: taylor.vance.test@techaudit.org | Phone: +1 (212) 555-4302 | Location: New York, NY',
  'GitHub: github.com/taylorvance-audit',
  '',
  'PROFESSIONAL SUMMARY',
  'Motivated software engineer with 2 years of professional experience.',
  'Claiming 12 years of hands-on expertise in Next.js, React, and QuantumFluxDB as Lead Architect.',
  '',
  'WORK EXPERIENCE',
  'Junior Frontend Developer | QuickStart Media | 2022 - Present',
  '- Built promotional landing pages using React and Tailwind CSS.',
  '- Maintained internal documentation, bug triage, and WordPress landing pages.',
  '',
  'EDUCATION',
  'State University of New York | 2018 - 2022',
  'Bachelor of Arts in Media Studies (Graduated: May 2022)',
  '',
  'TECHNICAL CLAIMS',
  'Next.js (Claimed: 12 years), QuantumFluxDB (Claimed: 8 years)'
];

const filesToCreate = [
  { name: 'Candidate_1_Strong_Match.pdf', lines: aliRazaLines },
  { name: 'Candidate_2_Partial_Gap.pdf', lines: saraKhanLines },
  { name: 'Candidate_3_Skill_Normalization_Test.pdf', lines: usmanTariqLines },
  { name: 'Candidate_4_Hallucination_Stress_Test.pdf', lines: taylorVanceLines },
];

for (const item of filesToCreate) {
  const filePath = path.join(outDir, item.name);
  const pdfBytes = createSimplePdf(item.lines);
  fs.writeFileSync(filePath, pdfBytes);
  console.log(`Generated: ${filePath} (${pdfBytes.length} bytes)`);
}
