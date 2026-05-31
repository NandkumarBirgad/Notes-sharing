const Semester    = require('../models/Semester');
const Year        = require('../models/Year');
const asyncHandler    = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// GET /semesters/:yearId
const getSemesters = asyncHandler(async (req, res) => {
  const { yearId } = req.params;

  const year = await Year.findById(yearId);
  if (!year) return sendError(res, 'Year not found', 404);

  const semesters = await Semester.find({ yearId })
    .populate('yearId', 'name')
    .populate('branchId', 'name code icon')
    .sort({ order: 1, name: 1 });

  sendSuccess(res, semesters, 'Semesters fetched successfully');
});

// POST /semesters  [admin]
const createSemester = asyncHandler(async (req, res) => {
  const { name, description, yearId, order } = req.body;

  const year = await Year.findById(yearId).populate('branchId');
  if (!year) return sendError(res, 'Year not found', 404);

  // Auto-inherit branchId from parent year
  const branchId = year.branchId._id || year.branchId;

  const semester = await Semester.create({ name, description, yearId, branchId, order });
  sendSuccess(res, semester, 'Semester created successfully', 201);
});

// DELETE /semesters/:id  [admin]
const deleteSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.id);
  if (!semester) return sendError(res, 'Semester not found', 404);
  await semester.deleteOne();
  sendSuccess(res, null, 'Semester deleted successfully');
});

module.exports = { getSemesters, createSemester, deleteSemester };
