const express    = require('express');
const router     = express.Router();
const {
  getResources,
  uploadResource,
  deleteResource,
  updateResource,
  incrementDownload,
  listAllUploads,
  summarizeResource,
  chatAboutResource,
} = require('../controllers/resourceController');
const adminAuth  = require('../middleware/adminAuth');
const { resourceUploadRules, resourceUpdateRules, mongoIdParam, validate } =
  require('../middleware/validationMiddleware');
const { getUploader } = require('../services/uploadService');

const upload = getUploader();

// Public
router.get('/:subjectId',          mongoIdParam('subjectId'), validate, getResources);
router.patch('/:id/download',      mongoIdParam('id'),        validate, incrementDownload);
router.post('/:id/summarize',      mongoIdParam('id'),        validate, summarizeResource);
router.post('/:id/chat',           mongoIdParam('id'),        validate, chatAboutResource);

// Admin
router.post('/upload',   adminAuth, upload.single('file'), resourceUploadRules, validate, uploadResource);
router.delete('/:id',    adminAuth, mongoIdParam('id'), validate, deleteResource);
router.patch('/:id',     adminAuth, mongoIdParam('id'), validate, resourceUpdateRules, validate, updateResource);

// Admin: list all uploads
router.get('/',          adminAuth, listAllUploads);

module.exports = router;
