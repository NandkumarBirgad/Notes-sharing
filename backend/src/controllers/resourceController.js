const path       = require('path');
const Resource   = require('../models/Resource');
const Subject    = require('../models/Subject');
const asyncHandler   = require('../utils/asyncHandler');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseHandler');
const { getPagination, getSort }                = require('../utils/pagination');
const { getLocalFileUrl, deleteFile }           = require('../services/uploadService');

// ─── GET /resources/:subjectId ─────────────────────────────────────────────
const getResources = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;

  const subject = await Subject.findById(subjectId);
  if (!subject) return sendError(res, 'Subject not found', 404);

  const { page, limit, skip } = getPagination(req.query);
  const sort = getSort(req.query, ['title', 'createdAt', 'downloads', 'type']);

  const filter = { subjectId };
  if (req.query.type) filter.type = req.query.type;

  const [resources, total] = await Promise.all([
    Resource.find(filter)
      .populate('yearId', 'name')
      .populate('semesterId', 'name')
      .populate('subjectId', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Resource.countDocuments(filter),
  ]);

  sendPaginated(res, resources, total, page, limit, 'Resources fetched successfully');
});

// ─── POST /upload  [admin] ─────────────────────────────────────────────────
const uploadResource = asyncHandler(async (req, res) => {
  if (!req.file) return sendError(res, 'No file uploaded', 400);

  const { title, description, type, subjectId, semesterId, yearId } = req.body;

  const subject = await Subject.findById(subjectId);
  if (!subject) return sendError(res, 'Subject not found', 404);

  // Build file URL depending on storage mode
  const isCloudinary = (process.env.STORAGE_MODE || 'local') === 'cloudinary';

  const fileUrl   = isCloudinary ? req.file.path : getLocalFileUrl(req, req.file.filename);
  const publicId  = isCloudinary ? req.file.filename : '';

  // Generate preview URL (same as fileUrl for now; swap with thumbnail logic if needed)
  const previewUrl = fileUrl;

  const resource = await Resource.create({
    title,
    description,
    fileUrl,
    previewUrl,
    publicId,
    type,
    fileSize: req.file.size,
    fileType: path.extname(req.file.originalname).replace('.', '').toLowerCase(),
    subjectId,
    semesterId,
    yearId,
  });

  sendSuccess(res, resource, 'Resource uploaded successfully', 201);
});

// ─── DELETE /resource/:id  [admin] ────────────────────────────────────────
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return sendError(res, 'Resource not found', 404);

  await deleteFile(resource.fileUrl, resource.publicId);
  await resource.deleteOne();

  sendSuccess(res, null, 'Resource deleted successfully');
});

// ─── PATCH /resource/:id  [admin] ─────────────────────────────────────────
const updateResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return sendError(res, 'Resource not found', 404);

  const allowedFields = ['title', 'description', 'type'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) resource[field] = req.body[field];
  });

  await resource.save();
  sendSuccess(res, resource, 'Resource updated successfully');
});

// ─── PATCH /resource/:id/download  [public] ───────────────────────────────
const incrementDownload = asyncHandler(async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { $inc: { downloads: 1 } },
    { new: true }
  );

  if (!resource) return sendError(res, 'Resource not found', 404);

  sendSuccess(
    res,
    { downloads: resource.downloads, fileUrl: resource.fileUrl },
    'Download tracked'
  );
});

// ─── GET /admin/uploads  [admin] ──────────────────────────────────────────
const listAllUploads = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const sort = getSort(req.query, ['title', 'createdAt', 'downloads', 'type']);

  const filter = {};
  if (req.query.type)       filter.type       = req.query.type;
  if (req.query.yearId)     filter.yearId     = req.query.yearId;
  if (req.query.semesterId) filter.semesterId = req.query.semesterId;
  if (req.query.subjectId)  filter.subjectId  = req.query.subjectId;

  const [resources, total] = await Promise.all([
    Resource.find(filter)
      .populate('yearId', 'name')
      .populate('semesterId', 'name')
      .populate('subjectId', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Resource.countDocuments(filter),
  ]);

  sendPaginated(res, resources, total, page, limit, 'All uploads fetched');
});

// ─── POST /resources/:id/summarize  [public] ──────────────────────────────
const { extractTextFromPdf, generateSummary, chatWithPdf } = require('../services/aiService');

const summarizeResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return sendError(res, 'Resource not found', 404);

  if (resource.type === 'video') {
    return sendError(res, 'AI summaries are only supported for text documents (PDFs/papers), not videos.', 400);
  }

  // 1. Return cached summary if already generated (saves Gemini API quota!)
  if (resource.aiSummary) {
    return sendSuccess(res, { aiSummary: resource.aiSummary }, 'Summary fetched from cache');
  }

  // 2. Extract PDF text
  const text = await extractTextFromPdf(resource.fileUrl);
  if (!text) {
    return sendError(res, 'Could not extract text from this document. It might be scanned or empty.', 400);
  }

  // 3. Generate summary using Gemini AI
  const summary = await generateSummary(text);

  // 4. Cache it in database
  resource.aiSummary = summary;
  await resource.save();

  sendSuccess(res, { aiSummary: summary }, 'Summary generated successfully with Gemini AI');
});

// ─── POST /resources/:id/chat  [public] ────────────────────────────────────
const chatAboutResource = asyncHandler(async (req, res) => {
  const { question, history = [] } = req.body;
  if (!question) return sendError(res, 'Question is required', 400);

  const resource = await Resource.findById(req.params.id);
  if (!resource) return sendError(res, 'Resource not found', 404);

  if (resource.type === 'video') {
    return sendError(res, 'AI Chat is only supported for text documents, not videos.', 400);
  }

  // Extract PDF text
  const text = await extractTextFromPdf(resource.fileUrl);
  if (!text) {
    return sendError(res, 'Could not extract text from this document.', 400);
  }

  // Chat with the document content using Gemini AI
  const answer = await chatWithPdf(text, question, history);

  sendSuccess(res, { answer }, 'Answer generated successfully');
});

module.exports = {
  getResources,
  uploadResource,
  deleteResource,
  updateResource,
  incrementDownload,
  listAllUploads,
  summarizeResource,
  chatAboutResource,
};
