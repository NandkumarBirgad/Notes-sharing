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
    .sort({ order: 1, name: 1 });

  sendSuccess(res, semesters, 'Semesters fetched successfully');
});

// POST /semester  [admin]
const createSemester = asyncHandler(async (req, res) => {
  const { name, description, yearId, order } = req.body;

  const year = await Year.findById(yearId);
  if (!year) return sendError(res, 'Year not found', 404);

  const semester = await Semester.create({ name, description, yearId, order });
  sendSuccess(res, semester, 'Semester created successfully', 201);
});

module.exports = { getSemesters, createSemester };
