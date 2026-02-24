const { sendError } = require('../utils/responseHandler');

const adminAuth = (req, res, next) => {
  const apiKey = req.headers['x-admin-key'];

  if (!apiKey) {
    return sendError(res, 'Admin API key is required (x-admin-key header)', 401);
  }

  if (apiKey !== process.env.ADMIN_API_KEY) {
    return sendError(res, 'Invalid admin API key', 403);
  }

  next();
};

module.exports = adminAuth;
