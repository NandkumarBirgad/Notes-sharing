const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHandler');

// ─── Run validation and return errors ─────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }
  next();
};

// ─── Year validations ──────────────────────────────────────────────────────
const yearRules = [
  body('name').trim().notEmpty().withMessage('Year name is required'),
  body('description').optional().trim(),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
];

// ─── Semester validations ──────────────────────────────────────────────────
const semesterRules = [
  body('name').trim().notEmpty().withMessage('Semester name is required'),
  body('yearId').isMongoId().withMessage('Valid yearId is required'),
  body('description').optional().trim(),
  body('order').optional().isInt({ min: 0 }),
];

// ─── Subject validations ───────────────────────────────────────────────────
const subjectRules = [
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  body('semesterId').isMongoId().withMessage('Valid semesterId is required'),
  body('yearId').isMongoId().withMessage('Valid yearId is required'),
  body('code').optional().trim(),
  body('description').optional().trim(),
];

// ─── Resource upload validations ───────────────────────────────────────────
const resourceUploadRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type')
    .isIn(['note', 'paper', 'video'])
    .withMessage('Type must be note, paper, or video'),
  body('subjectId').isMongoId().withMessage('Valid subjectId is required'),
  body('semesterId').isMongoId().withMessage('Valid semesterId is required'),
  body('yearId').isMongoId().withMessage('Valid yearId is required'),
  body('description').optional().trim(),
];

// ─── Resource update validations ───────────────────────────────────────────
const resourceUpdateRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('type')
    .optional()
    .isIn(['note', 'paper', 'video'])
    .withMessage('Type must be note, paper, or video'),
  body('description').optional().trim(),
];

// ─── MongoId param validation ──────────────────────────────────────────────
const mongoIdParam = (paramName) => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
];

// ─── Search query validation ───────────────────────────────────────────────
const searchRules = [
  query('q').optional().trim(),
  query('year').optional().isMongoId().withMessage('year must be a valid ID'),
  query('semester').optional().isMongoId().withMessage('semester must be a valid ID'),
  query('subject').optional().isMongoId().withMessage('subject must be a valid ID'),
  query('type')
    .optional()
    .isIn(['note', 'paper', 'video'])
    .withMessage('type must be note, paper, or video'),
];

module.exports = {
  validate,
  yearRules,
  semesterRules,
  subjectRules,
  resourceUploadRules,
  resourceUpdateRules,
  mongoIdParam,
  searchRules,
};
