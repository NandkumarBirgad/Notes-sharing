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
    .populate('branchId', 'name code icon')
    .sort({ name: 1 });

  sendSuccess(res, subjects, 'Subjects fetched successfully');
});

// POST /subjects  [admin]
const createSubject = asyncHandler(async (req, res) => {
  const { name, code, description, semesterId, yearId } = req.body;

  const semester = await Semester.findById(semesterId);
  if (!semester) return sendError(res, 'Semester not found', 404);

  // Auto-inherit branchId from parent Semester
  const branchId = semester.branchId;

  const subject = await Subject.create({ name, code, description, semesterId, yearId, branchId });
  sendSuccess(res, subject, 'Subject created successfully', 201);
});

// DELETE /subjects/:id  [admin]
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) return sendError(res, 'Subject not found', 404);
  await subject.deleteOne();
  sendSuccess(res, null, 'Subject deleted successfully');
});

module.exports = { getSubjects, createSubject, deleteSubject };
