const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const { v4: uuidv4 } = require('uuid');

// ─── Allowed MIME types ────────────────────────────────────────────────────
const ALLOWED_MIMES = {
  'application/pdf':                                                    'pdf',
  'application/msword':                                                 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-powerpoint':                                      'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'video/mp4':                                                          'mp4',
};

const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB) || 100) * 1024 * 1024;

// ─── File filter ───────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Allowed: PDF, DOC, DOCX, PPT, PPTX, MP4`
      ),
      false
    );
  }
};

// ─── Local Storage ─────────────────────────────────────────────────────────
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext      = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// ─── Cloudinary Storage ────────────────────────────────────────────────────
let cloudinaryStorage;
try {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('../config/cloudinary');

  cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const ext = ALLOWED_MIMES[file.mimetype];
      return {
        folder:         'study-portal',
        resource_type:  file.mimetype === 'video/mp4' ? 'video' : 'raw',
        public_id:      `${Date.now()}-${uuidv4()}`,
        format:         ext,
        allowed_formats: Object.values(ALLOWED_MIMES),
      };
    },
  });
} catch {
  // cloudinary not configured — will fall back to local
}

// ─── Build multer instance based on STORAGE_MODE ──────────────────────────
const getUploader = () => {
  const mode    = (process.env.STORAGE_MODE || 'local').toLowerCase();
  const storage = mode === 'cloudinary' && cloudinaryStorage
    ? cloudinaryStorage
    : localStorage;

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  });
};

// ─── Helper: build file URLs for local storage ────────────────────────────
const getLocalFileUrl = (req, filename) => {
  const host = req.get('host');
  const protocol = host.includes('localhost') ? req.protocol : 'https';
  return `${protocol}://${host}/uploads/${filename}`;
};

// ─── Helper: delete a file ────────────────────────────────────────────────
const deleteFile = async (fileUrl, publicId) => {
  const mode = (process.env.STORAGE_MODE || 'local').toLowerCase();

  if (mode === 'cloudinary' && publicId) {
    const cloudinary = require('../config/cloudinary');
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    return;
  }

  // Local deletion
  const filename = path.basename(fileUrl);
  const filePath = path.join(process.cwd(), 'uploads', filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

module.exports = { getUploader, getLocalFileUrl, deleteFile, ALLOWED_MIMES };
