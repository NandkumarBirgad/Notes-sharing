/**
 * Migration script – adds Branch collection and backfills branchId on
 * existing Year, Semester, Subject, and Resource documents.
 *
 * Usage:
 *   node src/migrate.js          (or: npm run migrate)
 *
 * What it does:
 *  1. Connect to MONGO_URI from .env
 *  2. Create the 6 default branches if they don't exist
 *  3. Assign all existing Years to "Computer Engineering" (CE) branch
 *  4. Backfill branchId on all Semesters, Subjects, Resources
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const Branch   = require('./models/Branch');
const Year     = require('./models/Year');
const Semester = require('./models/Semester');
const Subject  = require('./models/Subject');
const Resource = require('./models/Resource');

// ─── Default Branches ──────────────────────────────────────────────────────
const defaultBranches = [
  { name: 'Computer Engineering', code: 'CE',    icon: '💻', description: 'Programming, DSA, DBMS, OS & Core CS subjects', order: 1 },
  { name: 'Information Technology', code: 'IT',  icon: '🌐', description: 'Software engineering, web technologies & networking', order: 2 },
  { name: 'Artificial Intelligence & Data Science', code: 'AIDS', icon: '🤖', description: 'Machine learning, AI, data science & analytics', order: 3 },
  { name: 'Electronics & Telecommunication', code: 'ENTC', icon: '📡', description: 'Electronics, signals, communication & VLSI', order: 4 },
  { name: 'Mechanical Engineering', code: 'MECH', icon: '⚙️', description: 'Mechanics, thermodynamics, manufacturing & design', order: 5 },
  { name: 'Civil Engineering', code: 'CIVIL',    icon: '🏗️', description: 'Structures, surveying, materials & construction', order: 6 },
];

async function migrate() {
  try {
    await connectDB();
    console.log('🔄 Starting migration to Branch-based hierarchy...\n');

    // ─── Step 1: Create default branches ────────────────────────────────────
    console.log('Step 1: Creating default branches...');
    const createdBranches = [];
    for (const b of defaultBranches) {
      let branch = await Branch.findOne({ code: b.code });
      if (!branch) {
        branch = await Branch.create(b);
        console.log(`  ✅ Created branch: ${b.name} (${b.code})`);
      } else {
        console.log(`  ℹ️  Branch already exists: ${b.name} (${b.code})`);
      }
      createdBranches.push(branch);
    }

    // Find the CE branch (default for existing data)
    const ceBranch = createdBranches.find((b) => b.code === 'CE');
    if (!ceBranch) throw new Error('CE branch not found after creation');

    // ─── Step 2: Backfill branchId on Years ─────────────────────────────────
    console.log('\nStep 2: Backfilling branchId on Years...');
    const yearsWithoutBranch = await Year.find({
      $or: [{ branchId: { $exists: false } }, { branchId: null }]
    });

    if (yearsWithoutBranch.length > 0) {
      await Year.updateMany(
        { $or: [{ branchId: { $exists: false } }, { branchId: null }] },
        { $set: { branchId: ceBranch._id } }
      );
      console.log(`  ✅ Updated ${yearsWithoutBranch.length} years → CE branch`);
    } else {
      console.log('  ℹ️  All years already have branchId');
    }

    // ─── Step 3: Backfill branchId on Semesters ─────────────────────────────
    console.log('\nStep 3: Backfilling branchId on Semesters...');
    const semestersWithoutBranch = await Semester.find({
      $or: [{ branchId: { $exists: false } }, { branchId: null }]
    });

    if (semestersWithoutBranch.length > 0) {
      // Populate branchId from parent Year
      const allYears = await Year.find({});
      const yearBranchMap = {};
      allYears.forEach((y) => { yearBranchMap[y._id.toString()] = y.branchId; });

      let semUpdated = 0;
      for (const sem of semestersWithoutBranch) {
        const branchId = yearBranchMap[sem.yearId.toString()];
        if (branchId) {
          await Semester.findByIdAndUpdate(sem._id, { $set: { branchId } });
          semUpdated++;
        }
      }
      console.log(`  ✅ Updated ${semUpdated} semesters with branchId`);
    } else {
      console.log('  ℹ️  All semesters already have branchId');
    }

    // ─── Step 4: Backfill branchId on Subjects ──────────────────────────────
    console.log('\nStep 4: Backfilling branchId on Subjects...');
    const subjectsWithoutBranch = await Subject.find({
      $or: [{ branchId: { $exists: false } }, { branchId: null }]
    });

    if (subjectsWithoutBranch.length > 0) {
      const allSemesters = await Semester.find({});
      const semBranchMap = {};
      allSemesters.forEach((s) => { semBranchMap[s._id.toString()] = s.branchId; });

      let subjUpdated = 0;
      for (const subj of subjectsWithoutBranch) {
        const branchId = semBranchMap[subj.semesterId.toString()];
        if (branchId) {
          await Subject.findByIdAndUpdate(subj._id, { $set: { branchId } });
          subjUpdated++;
        }
      }
      console.log(`  ✅ Updated ${subjUpdated} subjects with branchId`);
    } else {
      console.log('  ℹ️  All subjects already have branchId');
    }

    // ─── Step 5: Backfill branchId on Resources ─────────────────────────────
    console.log('\nStep 5: Backfilling branchId on Resources...');
    const resourcesWithoutBranch = await Resource.find({
      $or: [{ branchId: { $exists: false } }, { branchId: null }]
    });

    if (resourcesWithoutBranch.length > 0) {
      const allSubjects = await Subject.find({});
      const subjBranchMap = {};
      allSubjects.forEach((s) => { subjBranchMap[s._id.toString()] = s.branchId; });

      let resUpdated = 0;
      for (const res of resourcesWithoutBranch) {
        const branchId = subjBranchMap[res.subjectId.toString()];
        if (branchId) {
          await Resource.findByIdAndUpdate(res._id, { $set: { branchId } });
          resUpdated++;
        }
      }
      console.log(`  ✅ Updated ${resUpdated} resources with branchId`);
    } else {
      console.log('  ℹ️  All resources already have branchId');
    }

    console.log('\n🎉 Migration complete! All data is now branch-aware.');
    console.log('\nSummary:');
    console.log('  - Existing data assigned to: Computer Engineering (CE)');
    console.log('  - Use the Admin Panel to reassign Years to other branches.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
