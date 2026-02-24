/**
 * Parse and return pagination params from query
 */
const getPagination = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build a sort object from query string
 * e.g. ?sort=createdAt:desc,title:asc
 */
const getSort = (query, allowedFields = []) => {
  const sortObj = {};
  if (!query.sort) {
    sortObj.createdAt = -1; // default
    return sortObj;
  }

  const parts = query.sort.split(',');
  parts.forEach((part) => {
    const [field, dir] = part.split(':');
    if (!allowedFields.length || allowedFields.includes(field)) {
      sortObj[field] = dir === 'asc' ? 1 : -1;
    }
  });

  if (!Object.keys(sortObj).length) sortObj.createdAt = -1;
  return sortObj;
};

module.exports = { getPagination, getSort };
