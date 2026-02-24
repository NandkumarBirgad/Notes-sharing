const { sendError } = require('../utils/responseHandler');

// ─── 404 Not Found ─────────────────────────────────────────────────────────
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// ─── Global Error Handler ──────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message    = 'Validation failed';
    const errors = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
    return sendError(res, message, statusCode, errors);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message    = `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 100}MB`;
  }

  if (err.message && err.message.startsWith('Unsupported file type')) {
    statusCode = 415;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('💥 Error:', err);
  }

  return sendError(res, message, statusCode);
};

module.exports = { notFound, errorHandler };
