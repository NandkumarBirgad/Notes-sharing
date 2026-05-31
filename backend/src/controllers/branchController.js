const Branch   = require('../models/Branch');
const Year      = require('../models/Year');
const Resource  = require('../models/Resource');
const asyncHandler  = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// ─── GET /branches ─────────────────────────────────────────────────────────
const getBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find().sort({ order: 1, name: 1 });
  sendSuccess(res, branches, 'Branches fetched successfully');
});

// ─── GET /branches/:id ─────────────────────────────────────────────────────
const getBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) return sendError(res, 'Branch not found', 404);
  sendSuccess(res, branch, 'Branch fetched successfully');
});

// ─── GET /branches/:id/stats ───────────────────────────────────────────────
const getBranchStats = asyncHandler(async (req, res) => {
  const branchId = req.params.id;

  const branch = await Branch.findById(branchId);
  if (!branch) return sendError(res, 'Branch not found', 404);

  const [resourceCount, yearCount] = await Promise.all([
    Resource.countDocuments({ branchId }),
    Year.countDocuments({ branchId }),
  ]);

  sendSuccess(res, { resourceCount, yearCount }, 'Branch stats fetched');
});

// ─── GET /branches/stats/all ───────────────────────────────────────────────
const getAllBranchStats = asyncHandler(async (req, res) => {
  const stats = await Resource.aggregate([
    {
      $group: {
        _id: '$branchId',
        resourceCount: { $sum: 1 },
      },
    },
  ]);

  // Build a map { branchId → count }
  const countMap = {};
  stats.forEach((s) => { countMap[s._id.toString()] = s.resourceCount; });

  sendSuccess(res, countMap, 'All branch stats fetched');
});

// ─── POST /branches  [admin] ───────────────────────────────────────────────
const createBranch = asyncHandler(async (req, res) => {
  const { name, code, description, icon, order } = req.body;
  const branch = await Branch.create({ name, code, description, icon, order });
  sendSuccess(res, branch, 'Branch created successfully', 201);
});

// ─── PATCH /branches/:id  [admin] ─────────────────────────────────────────
const updateBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) return sendError(res, 'Branch not found', 404);

  const allowedFields = ['name', 'code', 'description', 'icon', 'order'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) branch[field] = req.body[field];
  });

  await branch.save();
  sendSuccess(res, branch, 'Branch updated successfully');
});

// ─── DELETE /branches/:id  [admin] ────────────────────────────────────────
const deleteBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) return sendError(res, 'Branch not found', 404);

  // Check if branch has years
  const yearCount = await Year.countDocuments({ branchId: req.params.id });
  if (yearCount > 0) {
    return sendError(res, `Cannot delete branch with ${yearCount} associated years. Delete the years first.`, 400);
  }

  await branch.deleteOne();
  sendSuccess(res, null, 'Branch deleted successfully');
});

module.exports = {
  getBranches,
  getBranch,
  getBranchStats,
  getAllBranchStats,
  createBranch,
  updateBranch,
  deleteBranch,
};
