const Year        = require('../models/Year');
const Branch      = require('../models/Branch');
const asyncHandler    = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// GET /years?branchId=  (or GET /years for all years)
const getYears = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.branchId) filter.branchId = req.query.branchId;

  const years = await Year.find(filter)
    .populate('branchId', 'name code icon')
    .sort({ order: 1, name: 1 });

  sendSuccess(res, years, 'Years fetched successfully');
});

// GET /years/:id  (single year)
const getYear = asyncHandler(async (req, res) => {
  const year = await Year.findById(req.params.id).populate('branchId', 'name code icon');
  if (!year) return sendError(res, 'Year not found', 404);
  sendSuccess(res, year, 'Year fetched successfully');
});

// POST /years  [admin]
const createYear = asyncHandler(async (req, res) => {
  const { name, description, order, branchId } = req.body;

  const branch = await Branch.findById(branchId);
  if (!branch) return sendError(res, 'Branch not found', 404);

  const year = await Year.create({ name, description, order, branchId });
  sendSuccess(res, year, 'Year created successfully', 201);
});

// PATCH /years/:id  [admin]
const updateYear = asyncHandler(async (req, res) => {
  const year = await Year.findById(req.params.id);
  if (!year) return sendError(res, 'Year not found', 404);

  const allowedFields = ['name', 'description', 'order', 'branchId'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) year[field] = req.body[field];
  });

  await year.save();
  sendSuccess(res, year, 'Year updated successfully');
});

// DELETE /years/:id  [admin]
const deleteYear = asyncHandler(async (req, res) => {
  const year = await Year.findById(req.params.id);
  if (!year) return sendError(res, 'Year not found', 404);
  await year.deleteOne();
  sendSuccess(res, null, 'Year deleted successfully');
});

module.exports = { getYears, getYear, createYear, updateYear, deleteYear };
