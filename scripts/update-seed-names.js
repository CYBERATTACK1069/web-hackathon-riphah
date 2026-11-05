const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Update users
db.users = [
  {
    id: 'usr_recruiter_1',
    name: 'Sarah Chen',
    email: 'sarah.chen@nexacorp.io',
    role: 'RECRUITER',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Lead Technical Recruiter',
    companyOrAffiliation: 'NexaCorp Talent Solutions'
  },
  {
    id: 'usr_candidate_1',
    name: 'Alex Rivera',
    email: 'alex.rivera@devmail.io',
    role: 'CANDIDATE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Full-Stack Engineer (Python, Django, Docker)',
    companyOrAffiliation: 'Available Immediately'
  },
  {
    id: 'usr_candidate_2',
    name: 'Maya Lin',
    email: 'maya.lin@devmail.org',
    role: 'CANDIDATE',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    title: 'Backend Developer (Python, FastAPI, PostgreSQL)',
    companyOrAffiliation: 'Exploring Backend Roles'
  },
  {
    id: 'usr_candidate_3',
    name: 'Tariq Mahmood',
    email: 'tariq.mahmood@codestack.net',
    role: 'CANDIDATE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Junior Software Developer',
    companyOrAffiliation: 'Seeking Junior Backend'
  }
];

// 2. Update candidates
if (db.candidates && db.candidates.length >= 3) {
  db.candidates[0].id = 'cand_alex_rivera';
  db.candidates[0].userId = 'usr_candidate_1';
  db.candidates[0].fullName = 'Alex Rivera';
  db.candidates[0].email = 'alex.rivera@devmail.io';
  db.candidates[0].summary = 'Senior Full-Stack & Backend Engineer with 5+ years of production experience architecting high-throughput REST APIs and asynchronous task processing using Python, Django, PostgreSQL, and Docker.';
  db.candidates[0].rawResumeText = db.candidates[0].rawResumeText.replace(/DAVID VANCE/g, 'ALEX RIVERA').replace(/david\.vance@backendpro\.io/g, 'alex.rivera@devmail.io');

  db.candidates[1].id = 'cand_maya_lin';
  db.candidates[1].userId = 'usr_candidate_2';
  db.candidates[1].fullName = 'Maya Lin';
  db.candidates[1].email = 'maya.lin@devmail.org';
  db.candidates[1].summary = 'Backend Developer with 3+ years experience building asynchronous REST services with Python and FastAPI. Experienced with PostgreSQL relational modeling, Redis pub/sub, and schema migrations.';
  db.candidates[1].rawResumeText = db.candidates[1].rawResumeText.replace(/ELENA ROSTOVA/g, 'MAYA LIN').replace(/elena\.rostova@devmail\.org/g, 'maya.lin@devmail.org');

  db.candidates[2].id = 'cand_tariq_mahmood';
  db.candidates[2].userId = 'usr_candidate_3';
  db.candidates[2].fullName = 'Tariq Mahmood';
  db.candidates[2].email = 'tariq.mahmood@codestack.net';
  db.candidates[2].summary = 'Junior Software Developer with 2 years of experience building web applications using React, JavaScript, and basic Node.js. Transitioning to full-stack backend development.';
  db.candidates[2].rawResumeText = db.candidates[2].rawResumeText.replace(/LIAM O'CONNOR/g, 'TARIQ MAHMOOD').replace(/liam\.oconnor@codestack\.net/g, 'tariq.mahmood@codestack.net');
}

// 3. Update applications
if (db.applications && db.applications.length >= 3) {
  db.applications[0].id = 'app_alex_backend';
  db.applications[0].candidateId = 'cand_alex_rivera';
  if (db.applications[0].auditTrail) {
    db.applications[0].auditTrail.forEach(a => { if (a.actionBy === 'David Vance') a.actionBy = 'Alex Rivera'; });
  }

  db.applications[1].id = 'app_maya_backend';
  db.applications[1].candidateId = 'cand_maya_lin';
  if (db.applications[1].auditTrail) {
    db.applications[1].auditTrail.forEach(a => { if (a.actionBy === 'Elena Rostova') a.actionBy = 'Maya Lin'; });
  }

  db.applications[2].id = 'app_tariq_backend';
  db.applications[2].candidateId = 'cand_tariq_mahmood';
  if (db.applications[2].auditTrail) {
    db.applications[2].auditTrail.forEach(a => { if (a.actionBy === "Liam O'Connor") a.actionBy = 'Tariq Mahmood'; });
  }
}

// 4. Update evaluations
if (db.evaluations && db.evaluations.length >= 3) {
  db.evaluations[0].id = 'eval_alex_backend';
  db.evaluations[0].applicationId = 'app_alex_backend';
  db.evaluations[0].candidateId = 'cand_alex_rivera';

  db.evaluations[1].id = 'eval_maya_backend';
  db.evaluations[1].applicationId = 'app_maya_backend';
  db.evaluations[1].candidateId = 'cand_maya_lin';

  db.evaluations[2].id = 'eval_tariq_backend';
  db.evaluations[2].applicationId = 'app_tariq_backend';
  db.evaluations[2].candidateId = 'cand_tariq_mahmood';
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Successfully updated db.json with Alex Rivera, Maya Lin, and Tariq Mahmood');
