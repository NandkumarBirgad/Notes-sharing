/**
 * Seed script – populates MongoDB with the same data the frontend mockData had.
 *
 * Usage:
 *   node src/seed.js          (or: npm run seed)
 *
 * It will:
 *  1. Connect to MONGO_URI from .env
 *  2. Drop existing years / semesters / subjects / resources
 *  3. Re-create them with the data below
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const Year = require('./models/Year');
const Semester = require('./models/Semester');
const Subject = require('./models/Subject');
const Resource = require('./models/Resource');

// ─── Seed Data ─────────────────────────────────────────────────────────────

const yearsData = [
    { name: '1st Year', description: 'Foundation courses & basics', order: 1 },
    { name: '2nd Year', description: 'Core subject fundamentals', order: 2 },
    { name: '3rd Year', description: 'Advanced & elective courses', order: 3 },
    { name: '4th Year', description: 'Specialization & projects', order: 4 },
];

const semestersData = [
    { name: 'Semester 1', order: 1 },
    { name: 'Semester 2', order: 2 },
];

const subjectsMap = {
    '1-1': ['Mathematics I', 'Physics', 'Chemistry', 'English', 'Programming in C'],
    '1-2': ['Mathematics II', 'Engineering Drawing', 'Data Structures', 'Digital Electronics', 'Environmental Science'],
    '2-1': ['Discrete Mathematics', 'Object-Oriented Programming', 'Computer Organization', 'Database Management', 'Operating Systems'],
    '2-2': ['Software Engineering', 'Computer Networks', 'Theory of Computation', 'Web Technologies', 'Statistics'],
    '3-1': ['Compiler Design', 'Machine Learning', 'Information Security', 'Cloud Computing', 'Mobile App Development'],
    '3-2': ['Artificial Intelligence', 'Big Data Analytics', 'IoT', 'Blockchain', 'Natural Language Processing'],
    '4-1': ['Deep Learning', 'Distributed Systems', 'Cyber Security', 'Project Work I', 'Elective I'],
    '4-2': ['Project Work II', 'Elective II', 'Elective III', 'Seminar', 'Internship'],
};

// Sample resources (keyed by "yearOrder-semOrder-subjectName")
const sampleResources = [
    { yearOrder: 1, semOrder: 1, subject: 'Mathematics I', title: 'Linear Algebra Notes', description: 'Complete notes on vectors, matrices, and eigenvalues', type: 'note', fileType: 'pdf', downloads: 234 },
    { yearOrder: 1, semOrder: 1, subject: 'Physics', title: 'Physics Mid-term 2024', description: 'Mid-semester examination paper with solutions', type: 'paper', fileType: 'pdf', downloads: 189 },
    { yearOrder: 1, semOrder: 1, subject: 'Programming in C', title: 'C Programming Basics', description: 'Introduction to C programming fundamentals', type: 'video', fileType: 'mp4', downloads: 412 },
    { yearOrder: 1, semOrder: 2, subject: 'Data Structures', title: 'Data Structures Handbook', description: 'Arrays, linked lists, trees, and graphs', type: 'note', fileType: 'pdf', downloads: 567 },
    { yearOrder: 2, semOrder: 1, subject: 'Database Management', title: 'DBMS Complete Notes', description: 'Relational algebra, SQL, normalization', type: 'note', fileType: 'doc', downloads: 321 },
    { yearOrder: 2, semOrder: 1, subject: 'Operating Systems', title: 'OS Final Exam 2024', description: 'End-semester examination paper', type: 'paper', fileType: 'pdf', downloads: 276 },
    { yearOrder: 2, semOrder: 1, subject: 'Object-Oriented Programming', title: 'OOP with Java Tutorial', description: 'Complete Java OOP concepts', type: 'video', fileType: 'mp4', downloads: 498 },
    { yearOrder: 2, semOrder: 2, subject: 'Computer Networks', title: 'CN Lecture Slides', description: 'OSI model, TCP/IP, routing protocols', type: 'note', fileType: 'ppt', downloads: 345 },
    { yearOrder: 3, semOrder: 1, subject: 'Machine Learning', title: 'ML Algorithms Guide', description: 'Regression, classification, clustering', type: 'note', fileType: 'pdf', downloads: 612 },
    { yearOrder: 3, semOrder: 2, subject: 'Artificial Intelligence', title: 'AI Mid-term 2024', description: 'Search algorithms, knowledge representation', type: 'paper', fileType: 'pdf', downloads: 198 },
    { yearOrder: 4, semOrder: 1, subject: 'Deep Learning', title: 'Deep Learning Intro', description: 'Neural networks, CNNs, RNNs', type: 'video', fileType: 'mp4', downloads: 387 },
    { yearOrder: 3, semOrder: 2, subject: 'Blockchain', title: 'Blockchain Fundamentals', description: 'Distributed ledger, consensus mechanisms', type: 'note', fileType: 'pdf', downloads: 156 },
];

// ─── Main ──────────────────────────────────────────────────────────────────

async function seed() {
    try {
        await connectDB();
        console.log('🌱 Seeding database...');

        // Clear existing data
        await Promise.all([
            Year.deleteMany({}),
            Semester.deleteMany({}),
            Subject.deleteMany({}),
            Resource.deleteMany({}),
        ]);
        console.log('   Cleared existing data');

        // 1. Create years
        const createdYears = await Year.insertMany(yearsData);
        console.log(`   ✅ Created ${createdYears.length} years`);

        // Build lookup { order → _id }
        const yearMap = {};
        createdYears.forEach((y) => { yearMap[y.order] = y._id; });

        // 2. Create semesters for each year
        const allSemesters = [];
        for (const year of createdYears) {
            for (const sem of semestersData) {
                allSemesters.push({ ...sem, yearId: year._id });
            }
        }
        const createdSemesters = await Semester.insertMany(allSemesters);
        console.log(`   ✅ Created ${createdSemesters.length} semesters`);

        // Build lookup { "yearOrder-semOrder" → semester._id }
        const semMap = {};
        createdSemesters.forEach((s) => {
            const yearDoc = createdYears.find((y) => y._id.equals(s.yearId));
            if (yearDoc) {
                semMap[`${yearDoc.order}-${s.order}`] = s._id;
            }
        });

        // 3. Create subjects
        const allSubjects = [];
        for (const [key, names] of Object.entries(subjectsMap)) {
            const [yearOrder, semOrder] = key.split('-').map(Number);
            const yearId = yearMap[yearOrder];
            const semesterId = semMap[`${yearOrder}-${semOrder}`];
            if (!yearId || !semesterId) continue;

            for (const name of names) {
                allSubjects.push({
                    name,
                    code: name.substring(0, 3).toUpperCase() + yearOrder + semOrder,
                    description: '',
                    yearId,
                    semesterId,
                });
            }
        }
        const createdSubjects = await Subject.insertMany(allSubjects);
        console.log(`   ✅ Created ${createdSubjects.length} subjects`);

        // Build lookup { "yearOrder-semOrder-subjectName" → subject._id }
        const subjMap = {};
        createdSubjects.forEach((s) => {
            const yearDoc = createdYears.find((y) => y._id.equals(s.yearId));
            const semDoc = createdSemesters.find((sem) => sem._id.equals(s.semesterId));
            if (yearDoc && semDoc) {
                subjMap[`${yearDoc.order}-${semDoc.order}-${s.name}`] = s._id;
            }
        });

        // 4. Create sample resources
        const resourceDocs = sampleResources.map((r) => {
            const yearId = yearMap[r.yearOrder];
            const semesterId = semMap[`${r.yearOrder}-${r.semOrder}`];
            const subjectId = subjMap[`${r.yearOrder}-${r.semOrder}-${r.subject}`];

            return {
                title: r.title,
                description: r.description,
                type: r.type,
                fileUrl: '#',                    // placeholder URL
                previewUrl: '#',
                publicId: '',
                fileSize: 0,
                fileType: r.fileType,
                yearId,
                semesterId,
                subjectId,
                downloads: r.downloads,
            };
        }).filter((r) => r.yearId && r.semesterId && r.subjectId);

        const createdResources = await Resource.insertMany(resourceDocs);
        console.log(`   ✅ Created ${createdResources.length} resources`);

        console.log('\n🎉 Seed complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    }
}

seed();
