/**
 * Seed script – populates MongoDB with branch-aware academic data.
 *
 * Usage:
 *   node src/seed.js          (or: npm run seed)
 *
 * It will:
 *  1. Connect to MONGO_URI from .env
 *  2. Drop existing branches / years / semesters / subjects / resources
 *  3. Re-create them with branch-aware data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const Branch   = require('./models/Branch');
const Year     = require('./models/Year');
const Semester = require('./models/Semester');
const Subject  = require('./models/Subject');
const Resource = require('./models/Resource');

// ─── Branch Data ─────────────────────────────────────────────────────────────
const branchesData = [
  { name: 'Computer Engineering', code: 'CE',    icon: '💻', description: 'Programming, DSA, DBMS, OS & Core CS subjects', order: 1 },
  { name: 'Information Technology', code: 'IT',  icon: '🌐', description: 'Software engineering, web technologies & networking', order: 2 },
  { name: 'Artificial Intelligence & Data Science', code: 'AIDS', icon: '🤖', description: 'Machine learning, AI, data science & analytics', order: 3 },
  { name: 'Electronics & Telecommunication', code: 'ENTC', icon: '📡', description: 'Electronics, signals, communication & VLSI', order: 4 },
  { name: 'Mechanical Engineering', code: 'MECH', icon: '⚙️', description: 'Mechanics, thermodynamics, manufacturing & design', order: 5 },
  { name: 'Civil Engineering', code: 'CIVIL',    icon: '🏗️', description: 'Structures, surveying, materials & construction', order: 6 },
];

// ─── Year Data (per branch) ────────────────────────────────────────────────
const yearsData = [
  { name: '1st Year', description: 'Foundation courses & basics', order: 1 },
  { name: '2nd Year', description: 'Core subject fundamentals', order: 2 },
  { name: '3rd Year', description: 'Advanced & elective courses', order: 3 },
  { name: '4th Year', description: 'Specialization & projects', order: 4 },
];

// ─── Semesters (same for each year) ───────────────────────────────────────
const semestersData = [
  { name: 'Semester 1', order: 1 },
  { name: 'Semester 2', order: 2 },
];

// ─── Subjects per Branch + Year + Semester ─────────────────────────────────
// Key: "branchCode-yearOrder-semOrder"
const subjectsMap = {
  // Computer Engineering
  'CE-1-1': ['Mathematics I', 'Physics', 'Chemistry', 'English', 'Programming in C'],
  'CE-1-2': ['Mathematics II', 'Engineering Drawing', 'Data Structures', 'Digital Electronics', 'Environmental Science'],
  'CE-2-1': ['Discrete Mathematics', 'Object-Oriented Programming', 'Computer Organization', 'Database Management', 'Operating Systems'],
  'CE-2-2': ['Software Engineering', 'Computer Networks', 'Theory of Computation', 'Web Technologies', 'Statistics'],
  'CE-3-1': ['Compiler Design', 'Machine Learning', 'Information Security', 'Cloud Computing', 'Mobile App Development'],
  'CE-3-2': ['Artificial Intelligence', 'Big Data Analytics', 'IoT', 'Blockchain', 'Natural Language Processing'],
  'CE-4-1': ['Deep Learning', 'Distributed Systems', 'Cyber Security', 'Project Work I', 'Elective I'],
  'CE-4-2': ['Project Work II', 'Elective II', 'Elective III', 'Seminar', 'Internship'],

  // Information Technology
  'IT-1-1': ['Mathematics I', 'Physics', 'Problem Solving & Python', 'English Communication', 'Workshop Practice'],
  'IT-1-2': ['Mathematics II', 'Web Fundamentals', 'Data Structures', 'Digital Logic', 'Environmental Studies'],
  'IT-2-1': ['Discrete Mathematics', 'Java Programming', 'DBMS', 'Operating Systems', 'Computer Networks I'],
  'IT-2-2': ['Software Engineering', 'Computer Networks II', 'Web Development', 'Statistics & Probability', 'Linux Admin'],
  'IT-3-1': ['Cloud Computing', 'Information Security', 'Mobile Development', 'ERP Systems', 'Data Warehousing'],
  'IT-3-2': ['Big Data Analytics', 'IoT Applications', 'DevOps', 'Project Management', 'Machine Learning'],
  'IT-4-1': ['AI Applications', 'Cyber Security', 'Blockchain Technology', 'Project Work I', 'Elective I'],
  'IT-4-2': ['Project Work II', 'Elective II', 'Seminar', 'Internship', 'Industry Connect'],

  // AIDS
  'AIDS-1-1': ['Mathematics I', 'Statistics & Probability', 'Python Programming', 'Data Fundamentals', 'English'],
  'AIDS-1-2': ['Mathematics II', 'Linear Algebra', 'Data Structures', 'Data Visualization', 'Environmental Science'],
  'AIDS-2-1': ['Machine Learning I', 'DBMS', 'Python for Data Science', 'Operating Systems', 'Probability Theory'],
  'AIDS-2-2': ['Machine Learning II', 'Deep Learning Basics', 'Big Data Technologies', 'NLP Fundamentals', 'Computer Vision I'],
  'AIDS-3-1': ['Deep Learning Advanced', 'Reinforcement Learning', 'Data Engineering', 'MLOps', 'AI Ethics'],
  'AIDS-3-2': ['Generative AI', 'Computer Vision II', 'Speech & Audio Processing', 'Knowledge Graphs', 'AI in Healthcare'],
  'AIDS-4-1': ['Research Methodology', 'Advanced ML Systems', 'AI Product Development', 'Project Work I', 'Elective I'],
  'AIDS-4-2': ['Project Work II', 'Elective II', 'Industry Internship', 'Seminar', 'Capstone Project'],

  // ENTC
  'ENTC-1-1': ['Engineering Mathematics I', 'Engineering Physics', 'Basic Electronics', 'Workshop', 'English'],
  'ENTC-1-2': ['Engineering Mathematics II', 'Electronic Devices', 'Network Analysis', 'Digital Electronics', 'Environmental Sci'],
  'ENTC-2-1': ['Signals & Systems', 'Analog Circuits', 'Microprocessors', 'Electromagnetic Theory', 'Control Systems I'],
  'ENTC-2-2': ['Control Systems II', 'Communication Systems', 'DSP', 'VLSI Design', 'PCB Design'],
  'ENTC-3-1': ['Wireless Communication', 'Antenna Theory', 'Embedded Systems', 'Optical Fiber Communication', 'IoT'],
  'ENTC-3-2': ['5G & Beyond', 'RF Circuit Design', 'Image Processing', 'Satellite Communication', 'Radar Systems'],
  'ENTC-4-1': ['Advanced Communication', 'MEMS', 'Power Electronics', 'Project Work I', 'Elective I'],
  'ENTC-4-2': ['Project Work II', 'Elective II', 'Seminar', 'Internship', 'Industry Project'],

  // Mechanical
  'MECH-1-1': ['Engineering Mathematics I', 'Engineering Physics', 'Engineering Chemistry', 'Workshop Technology', 'English'],
  'MECH-1-2': ['Engineering Mathematics II', 'Engineering Drawing', 'Thermodynamics I', 'Mechanics of Solids', 'Env Science'],
  'MECH-2-1': ['Fluid Mechanics', 'Manufacturing Processes I', 'Machine Drawing', 'Thermodynamics II', 'Material Science'],
  'MECH-2-2': ['Heat Transfer', 'Theory of Machines I', 'Manufacturing Processes II', 'Metrology', 'Strength of Materials'],
  'MECH-3-1': ['Machine Design I', 'CAD/CAM', 'Theory of Machines II', 'IC Engines', 'Industrial Engineering'],
  'MECH-3-2': ['Machine Design II', 'Refrigeration & AC', 'Turbomachinery', 'Robotics', 'FEA'],
  'MECH-4-1': ['Automobile Engineering', 'Advanced Manufacturing', 'Mechatronics', 'Project Work I', 'Elective I'],
  'MECH-4-2': ['Project Work II', 'Elective II', 'Seminar', 'Internship', 'Quality Engineering'],

  // Civil
  'CIVIL-1-1': ['Engineering Mathematics I', 'Engineering Physics', 'Engineering Chemistry', 'Engineering Drawing', 'English'],
  'CIVIL-1-2': ['Engineering Mathematics II', 'Building Materials', 'Surveying I', 'Fluid Mechanics I', 'Env Science'],
  'CIVIL-2-1': ['Structural Analysis I', 'Soil Mechanics', 'Surveying II', 'Fluid Mechanics II', 'Construction Technology'],
  'CIVIL-2-2': ['Structural Analysis II', 'Foundation Engineering', 'Water Supply Engineering', 'Highway Engineering', 'Irrigation'],
  'CIVIL-3-1': ['RCC Design', 'Steel Structures', 'Geotechnical Engineering', 'Environmental Engineering', 'Traffic Engineering'],
  'CIVIL-3-2': ['Pre-stressed Concrete', 'Bridge Engineering', 'Construction Management', 'GIS & Remote Sensing', 'Earthquake Engineering'],
  'CIVIL-4-1': ['Advanced Concrete Design', 'Smart Cities', 'Sustainable Construction', 'Project Work I', 'Elective I'],
  'CIVIL-4-2': ['Project Work II', 'Elective II', 'Seminar', 'Internship', 'Urban Planning'],
};

// ─── Sample Resources ──────────────────────────────────────────────────────
const sampleResources = [
  // Computer Engineering
  { branch: 'CE', yearOrder: 1, semOrder: 1, subject: 'Mathematics I', title: 'Linear Algebra Notes', description: 'Complete notes on vectors, matrices, and eigenvalues', type: 'note', fileType: 'pdf', downloads: 234 },
  { branch: 'CE', yearOrder: 1, semOrder: 1, subject: 'Physics', title: 'Physics Mid-term 2024', description: 'Mid-semester examination paper with solutions', type: 'paper', fileType: 'pdf', downloads: 189 },
  { branch: 'CE', yearOrder: 1, semOrder: 1, subject: 'Programming in C', title: 'C Programming Basics', description: 'Introduction to C programming fundamentals', type: 'video', fileType: 'mp4', downloads: 412 },
  { branch: 'CE', yearOrder: 1, semOrder: 2, subject: 'Data Structures', title: 'Data Structures Handbook', description: 'Arrays, linked lists, trees, and graphs', type: 'note', fileType: 'pdf', downloads: 567 },
  { branch: 'CE', yearOrder: 2, semOrder: 1, subject: 'Database Management', title: 'DBMS Complete Notes', description: 'Relational algebra, SQL, normalization', type: 'note', fileType: 'pdf', downloads: 321 },
  { branch: 'CE', yearOrder: 2, semOrder: 1, subject: 'Operating Systems', title: 'OS Final Exam 2024', description: 'End-semester examination paper', type: 'paper', fileType: 'pdf', downloads: 276 },
  { branch: 'CE', yearOrder: 2, semOrder: 1, subject: 'Object-Oriented Programming', title: 'OOP with Java Tutorial', description: 'Complete Java OOP concepts', type: 'video', fileType: 'mp4', downloads: 498 },
  { branch: 'CE', yearOrder: 3, semOrder: 1, subject: 'Machine Learning', title: 'ML Algorithms Guide', description: 'Regression, classification, clustering', type: 'note', fileType: 'pdf', downloads: 612 },
  { branch: 'CE', yearOrder: 3, semOrder: 2, subject: 'Artificial Intelligence', title: 'AI Mid-term 2024', description: 'Search algorithms, knowledge representation', type: 'paper', fileType: 'pdf', downloads: 198 },
  { branch: 'CE', yearOrder: 4, semOrder: 1, subject: 'Deep Learning', title: 'Deep Learning Intro', description: 'Neural networks, CNNs, RNNs', type: 'video', fileType: 'mp4', downloads: 387 },

  // Information Technology
  { branch: 'IT', yearOrder: 1, semOrder: 1, subject: 'Problem Solving & Python', title: 'Python Crash Course', description: 'Complete Python from scratch', type: 'note', fileType: 'pdf', downloads: 445 },
  { branch: 'IT', yearOrder: 2, semOrder: 1, subject: 'DBMS', title: 'DBMS Notes & Query Bank', description: 'SQL queries & normalization guide', type: 'note', fileType: 'pdf', downloads: 389 },
  { branch: 'IT', yearOrder: 3, semOrder: 1, subject: 'Cloud Computing', title: 'AWS & Cloud Fundamentals', description: 'Intro to cloud services & deployment', type: 'video', fileType: 'mp4', downloads: 523 },

  // AIDS
  { branch: 'AIDS', yearOrder: 1, semOrder: 1, subject: 'Python Programming', title: 'Python for Data Science', description: 'NumPy, Pandas, Matplotlib', type: 'note', fileType: 'pdf', downloads: 678 },
  { branch: 'AIDS', yearOrder: 2, semOrder: 1, subject: 'Machine Learning I', title: 'ML from Scratch', description: 'Linear regression to decision trees', type: 'note', fileType: 'pdf', downloads: 891 },
  { branch: 'AIDS', yearOrder: 3, semOrder: 1, subject: 'Deep Learning Advanced', title: 'Transformers & Attention', description: 'BERT, GPT and attention mechanisms', type: 'video', fileType: 'mp4', downloads: 1023 },

  // ENTC
  { branch: 'ENTC', yearOrder: 1, semOrder: 1, subject: 'Basic Electronics', title: 'Basic Electronics Notes', description: 'Diodes, transistors, and amplifiers', type: 'note', fileType: 'pdf', downloads: 312 },
  { branch: 'ENTC', yearOrder: 2, semOrder: 1, subject: 'Signals & Systems', title: 'Signals & Systems Paper 2024', description: 'Previous year question paper', type: 'paper', fileType: 'pdf', downloads: 267 },

  // Mechanical
  { branch: 'MECH', yearOrder: 1, semOrder: 1, subject: 'Engineering Drawing', title: 'Engineering Drawing Manual', description: 'Orthographic & isometric projections', type: 'note', fileType: 'pdf', downloads: 198 },
  { branch: 'MECH', yearOrder: 2, semOrder: 1, subject: 'Fluid Mechanics', title: 'Fluid Mechanics Solved Problems', description: 'Solved examples with theory', type: 'note', fileType: 'pdf', downloads: 234 },

  // Civil
  { branch: 'CIVIL', yearOrder: 1, semOrder: 2, subject: 'Surveying I', title: 'Surveying Practical Notes', description: 'Chain, compass & plane table surveying', type: 'note', fileType: 'pdf', downloads: 156 },
  { branch: 'CIVIL', yearOrder: 2, semOrder: 1, subject: 'Structural Analysis I', title: 'Structural Analysis Paper 2024', description: 'End semester examination paper', type: 'paper', fileType: 'pdf', downloads: 189 },
];

// ─── Main ──────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await connectDB();
    console.log('🌱 Seeding branch-aware database...');

    // Clear existing data
    await Promise.all([
      Branch.deleteMany({}),
      Year.deleteMany({}),
      Semester.deleteMany({}),
      Subject.deleteMany({}),
      Resource.deleteMany({}),
    ]);
    console.log('   Cleared existing data');

    // 1. Create branches
    const createdBranches = await Branch.insertMany(branchesData);
    console.log(`   ✅ Created ${createdBranches.length} branches`);

    // Build lookup { code → branch }
    const branchMap = {};
    createdBranches.forEach((b) => { branchMap[b.code] = b; });

    // 2. Create years for each branch
    const allYears = [];
    for (const branch of createdBranches) {
      for (const year of yearsData) {
        allYears.push({ ...year, branchId: branch._id });
      }
    }
    const createdYears = await Year.insertMany(allYears);
    console.log(`   ✅ Created ${createdYears.length} years`);

    // Build lookup { "branchCode-yearOrder" → year._id }
    const yearMap = {};
    for (const year of createdYears) {
      const branch = createdBranches.find((b) => b._id.equals(year.branchId));
      if (branch) yearMap[`${branch.code}-${year.order}`] = year._id;
    }

    // 3. Create semesters for each year
    const allSemesters = [];
    for (const year of createdYears) {
      const branch = createdBranches.find((b) => b._id.equals(year.branchId));
      for (const sem of semestersData) {
        allSemesters.push({ ...sem, yearId: year._id, branchId: year.branchId });
      }
    }
    const createdSemesters = await Semester.insertMany(allSemesters);
    console.log(`   ✅ Created ${createdSemesters.length} semesters`);

    // Build lookup { "branchCode-yearOrder-semOrder" → semester._id }
    const semMap = {};
    for (const sem of createdSemesters) {
      const year = createdYears.find((y) => y._id.equals(sem.yearId));
      const branch = createdBranches.find((b) => b._id.equals(sem.branchId));
      if (year && branch) semMap[`${branch.code}-${year.order}-${sem.order}`] = sem._id;
    }

    // 4. Create subjects
    const allSubjects = [];
    for (const [key, names] of Object.entries(subjectsMap)) {
      const parts = key.split('-');
      const branchCode = parts[0];
      const yearOrder = parseInt(parts[1]);
      const semOrder = parseInt(parts[2]);

      const branch = branchMap[branchCode];
      const yearId = yearMap[`${branchCode}-${yearOrder}`];
      const semesterId = semMap[`${branchCode}-${yearOrder}-${semOrder}`];

      if (!branch || !yearId || !semesterId) {
        console.warn(`   ⚠️  Skipping subjects for key ${key} – missing references`);
        continue;
      }

      for (const name of names) {
        allSubjects.push({
          name,
          code: name.substring(0, 3).toUpperCase() + branchCode + yearOrder + semOrder,
          description: '',
          yearId,
          semesterId,
          branchId: branch._id,
        });
      }
    }
    const createdSubjects = await Subject.insertMany(allSubjects);
    console.log(`   ✅ Created ${createdSubjects.length} subjects`);

    // Build lookup { "branchCode-yearOrder-semOrder-subjectName" → { _id, yearId, semesterId, branchId } }
    const subjMap = {};
    for (const subj of createdSubjects) {
      const year = createdYears.find((y) => y._id.equals(subj.yearId));
      const sem = createdSemesters.find((s) => s._id.equals(subj.semesterId));
      const branch = createdBranches.find((b) => b._id.equals(subj.branchId));
      if (year && sem && branch) {
        subjMap[`${branch.code}-${year.order}-${sem.order}-${subj.name}`] = subj;
      }
    }

    // 5. Create sample resources
    const sampleUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';
    const videoUrl  = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';

    const resourceDocs = sampleResources.map((r) => {
      const key = `${r.branch}-${r.yearOrder}-${r.semOrder}-${r.subject}`;
      const subj = subjMap[key];
      if (!subj) {
        console.warn(`   ⚠️  No subject found for resource: ${key}`);
        return null;
      }

      return {
        title: r.title,
        description: r.description,
        type: r.type,
        fileUrl: r.type === 'video' ? videoUrl : sampleUrl,
        previewUrl: r.type === 'video' ? videoUrl : sampleUrl,
        publicId: '',
        fileSize: 0,
        fileType: r.fileType,
        branchId: subj.branchId,
        yearId: subj.yearId,
        semesterId: subj.semesterId,
        subjectId: subj._id,
        downloads: r.downloads,
      };
    }).filter(Boolean);

    const createdResources = await Resource.insertMany(resourceDocs);
    console.log(`   ✅ Created ${createdResources.length} resources`);

    console.log('\n🎉 Branch-aware seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
