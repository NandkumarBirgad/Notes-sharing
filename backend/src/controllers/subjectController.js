const Subject   = require('../models/Subject');
const Semester  = require('../models/Semester');
const asyncHandler  = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// GET /subjects/:semesterId
const getSubjects = asyncHandler(async (req, res) => {
  const { semesterId } = req.params;

  const semester = await Semester.findById(semesterId);
  if (!semester) return sendError(res, 'Semester not found', 404);

  const subjects = await Subject.find({ semesterId })
    .populate('yearId', 'name')
    .populate('semesterId', 'name')
    .sort({ name: 1 });

  sendSuccess(res, subjects, 'Subjects fetched successfully');
});

// POST /subject  [admin]
const createSubject = asyncHandler(async (req, res) => {
  const { name, code, description, semesterId, yearId } = req.body;

  const semester = await Semester.findById(semesterId);
  if (!semester) return sendError(res, 'Semester not found', 404);

  const subject = await Subject.create({ name, code, description, semesterId, yearId });
  sendSuccess(res, subject, 'Subject created successfully', 201);
});

module.exports = { getSubjects, createSubject };
