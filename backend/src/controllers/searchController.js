const Resource   = require('../models/Resource');
const asyncHandler   = require('../utils/asyncHandler');
const { sendPaginated } = require('../utils/responseHandler');
const { getPagination, getSort } = require('../utils/pagination');

// GET /search?q=&branch=&year=&semester=&subject=&type=
const search = asyncHandler(async (req, res) => {
  const { q, branch, year, semester, subject, type } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  const sort = getSort(req.query, ['title', 'createdAt', 'downloads']);

  const filter = {};

  // Full-text search
  if (q && q.trim()) {
    filter.$text = { $search: q.trim() };
  }

  // Filters
  if (branch)   filter.branchId   = branch;
  if (year)     filter.yearId     = year;
  if (semester) filter.semesterId = semester;
  if (subject)  filter.subjectId  = subject;
  if (type)     filter.type       = type;

  const [resources, total] = await Promise.all([
    Resource.find(filter)
      .populate('branchId', 'name code icon')
      .populate('yearId', 'name')
      .populate('semesterId', 'name')
      .populate('subjectId', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Resource.countDocuments(filter),
  ]);

  sendPaginated(res, resources, total, page, limit, 'Search results');
});

module.exports = { search };
