const Year        = require('../models/Year');
const asyncHandler    = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// GET /years
const getYears = asyncHandler(async (req, res) => {
  const years = await Year.find().sort({ order: 1, name: 1 });
  sendSuccess(res, years, 'Years fetched successfully');
});

// POST /years  [admin]
const createYear = asyncHandler(async (req, res) => {
  const { name, description, order } = req.body;
  const year = await Year.create({ name, description, order });
  sendSuccess(res, year, 'Year created successfully', 201);
});

module.exports = { getYears, createYear };
