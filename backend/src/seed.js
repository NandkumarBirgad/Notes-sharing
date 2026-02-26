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
    { name: 'DSA', description: 'Data Structures & Algorithms – master problem solving', order: 5 },
    { name: 'Programming', description: 'Programming languages & concepts – build your coding skills', order: 6 },
    { name: 'Aptitude', description: 'Quantitative, Logical & Verbal – crack any aptitude test', order: 7 },
];

// Semesters for academic years (order 1-4)
const semestersData = [
    { name: 'Semester 1', order: 1 },
    { name: 'Semester 2', order: 2 },
];

// Topics for DSA (year order 5)
const dsaTopicsData = [
    { name: 'Arrays & Strings', order: 1 },
    { name: 'Linked Lists & Stacks', order: 2 },
    { name: 'Trees & Graphs', order: 3 },
    { name: 'Sorting & Searching', order: 4 },
    { name: 'Dynamic Programming', order: 5 },
    { name: 'Greedy & Backtracking', order: 6 },
];

// Topics for Programming (year order 6)
const programmingTopicsData = [
    { name: 'C Programming', order: 1 },
    { name: 'C++ & STL', order: 2 },
    { name: 'Java', order: 3 },
    { name: 'Python', order: 4 },
    { name: 'JavaScript & Web Dev', order: 5 },
    { name: 'SQL & Databases', order: 6 },
];

// Topics for Aptitude (year order 7)
const aptitudeTopicsData = [
    { name: 'Quantitative Aptitude', order: 1 },
    { name: 'Logical Reasoning', order: 2 },
    { name: 'Verbal Ability', order: 3 },
    { name: 'Data Interpretation', order: 4 },
];

const subjectsMap = {
    // Academic years
    '1-1': ['Mathematics I', 'Physics', 'Chemistry', 'English', 'Programming in C'],
    '1-2': ['Mathematics II', 'Engineering Drawing', 'Data Structures', 'Digital Electronics', 'Environmental Science'],
    '2-1': ['Discrete Mathematics', 'Object-Oriented Programming', 'Computer Organization', 'Database Management', 'Operating Systems'],
    '2-2': ['Software Engineering', 'Computer Networks', 'Theory of Computation', 'Web Technologies', 'Statistics'],
    '3-1': ['Compiler Design', 'Machine Learning', 'Information Security', 'Cloud Computing', 'Mobile App Development'],
    '3-2': ['Artificial Intelligence', 'Big Data Analytics', 'IoT', 'Blockchain', 'Natural Language Processing'],
    '4-1': ['Deep Learning', 'Distributed Systems', 'Cyber Security', 'Project Work I', 'Elective I'],
    '4-2': ['Project Work II', 'Elective II', 'Elective III', 'Seminar', 'Internship'],

    // DSA topics → subjects (sub-topics)
    '5-1': ['Two Pointer Technique', 'Sliding Window', 'Prefix Sum', 'String Matching', 'Matrix Problems'],
    '5-2': ['Singly Linked List', 'Doubly Linked List', 'Stack Applications', 'Queue & Deque', 'Monotonic Stack'],
    '5-3': ['Binary Trees', 'BST', 'Graph Traversals (BFS/DFS)', 'Shortest Path Algorithms', 'Minimum Spanning Tree'],
    '5-4': ['Merge Sort', 'Quick Sort', 'Binary Search', 'Heap & Priority Queue', 'Counting Sort & Radix Sort'],
    '5-5': ['1D DP Problems', '2D DP Problems', 'Knapsack Variations', 'LCS & LIS', 'DP on Trees'],
    '5-6': ['Activity Selection', 'Huffman Coding', 'N-Queens', 'Sudoku Solver', 'Rat in a Maze'],

    // Programming topics → subjects
    '6-1': ['C Basics & Syntax', 'Pointers & Memory', 'File Handling in C', 'Structures & Unions', 'C Practice Problems'],
    '6-2': ['C++ OOP Concepts', 'STL Containers', 'STL Algorithms', 'Templates & Generics', 'Competitive Programming in C++'],
    '6-3': ['Java Basics', 'Collections Framework', 'Multithreading', 'Exception Handling', 'Java Projects'],
    '6-4': ['Python Basics', 'Python OOP', 'Python Libraries (NumPy, Pandas)', 'File Handling & Automation', 'Python Practice Problems'],
    '6-5': ['HTML & CSS', 'JavaScript Fundamentals', 'React.js', 'Node.js & Express', 'Full-Stack Projects'],
    '6-6': ['SQL Basics', 'Joins & Subqueries', 'Normalization', 'MongoDB Basics', 'Database Design'],

    // Aptitude topics → subjects
    '7-1': ['Number System', 'Percentage & Profit/Loss', 'Time, Speed & Distance', 'Ratio & Proportion', 'Permutations & Combinations'],
    '7-2': ['Coding-Decoding', 'Blood Relations', 'Seating Arrangement', 'Syllogism', 'Puzzles'],
    '7-3': ['Reading Comprehension', 'Para Jumbles', 'Sentence Correction', 'Vocabulary', 'Verbal Analogies'],
    '7-4': ['Bar Graphs', 'Pie Charts', 'Line Graphs', 'Tables & Caselets', 'Mixed DI'],
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

    // DSA sample resources
    { yearOrder: 5, semOrder: 1, subject: 'Two Pointer Technique', title: 'Two Pointer Patterns', description: 'All two-pointer patterns with examples', type: 'note', fileType: 'pdf', downloads: 723 },
    { yearOrder: 5, semOrder: 1, subject: 'Sliding Window', title: 'Sliding Window Masterclass', description: 'Fixed and variable window problems', type: 'video', fileType: 'mp4', downloads: 891 },
    { yearOrder: 5, semOrder: 3, subject: 'Graph Traversals (BFS/DFS)', title: 'Graph BFS/DFS Notes', description: 'Complete guide to graph traversals', type: 'note', fileType: 'pdf', downloads: 654 },
    { yearOrder: 5, semOrder: 5, subject: '1D DP Problems', title: 'DP Problem Set', description: 'Top 50 1D DP problems with solutions', type: 'paper', fileType: 'pdf', downloads: 1023 },

    // Programming sample resources
    { yearOrder: 6, semOrder: 1, subject: 'C Basics & Syntax', title: 'C Language Complete Guide', description: 'From basics to advanced C programming', type: 'note', fileType: 'pdf', downloads: 534 },
    { yearOrder: 6, semOrder: 3, subject: 'Java Basics', title: 'Java Programming Tutorial', description: 'Object-oriented programming in Java', type: 'video', fileType: 'mp4', downloads: 678 },
    { yearOrder: 6, semOrder: 4, subject: 'Python Basics', title: 'Python Crash Course Notes', description: 'Learn Python in one week', type: 'note', fileType: 'pdf', downloads: 912 },
    { yearOrder: 6, semOrder: 5, subject: 'React.js', title: 'React.js Complete Guide', description: 'Modern React with hooks, context, and routing', type: 'note', fileType: 'pdf', downloads: 445 },

    // Aptitude sample resources
    { yearOrder: 7, semOrder: 1, subject: 'Number System', title: 'Number System Shortcuts', description: 'Quick tricks for number system problems', type: 'note', fileType: 'pdf', downloads: 867 },
    { yearOrder: 7, semOrder: 1, subject: 'Percentage & Profit/Loss', title: 'Percentage Formulas Sheet', description: 'All formulas with solved examples', type: 'note', fileType: 'pdf', downloads: 745 },
    { yearOrder: 7, semOrder: 2, subject: 'Coding-Decoding', title: 'Coding-Decoding Tricks', description: 'Pattern recognition techniques', type: 'video', fileType: 'mp4', downloads: 543 },
    { yearOrder: 7, semOrder: 3, subject: 'Reading Comprehension', title: 'RC Practice Set', description: '50 RC passages with answers', type: 'paper', fileType: 'pdf', downloads: 623 },
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

        // 2. Create semesters / topics for each year
        const allSemesters = [];
        // Map yearOrder → topic data
        const topicDataByOrder = {
            5: dsaTopicsData,
            6: programmingTopicsData,
            7: aptitudeTopicsData,
        };
        for (const year of createdYears) {
            const topics = topicDataByOrder[year.order];
            if (topics) {
                // Non-academic year: use topic-specific data
                for (const topic of topics) {
                    allSemesters.push({ ...topic, yearId: year._id });
                }
            } else {
                // Academic year: use Semester 1 / Semester 2
                for (const sem of semestersData) {
                    allSemesters.push({ ...sem, yearId: year._id });
                }
            }
        }
        const createdSemesters = await Semester.insertMany(allSemesters);
        console.log(`   ✅ Created ${createdSemesters.length} semesters/topics`);

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
