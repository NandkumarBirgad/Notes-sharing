const express    = require('express');
const router     = express.Router();
const {
  getBranches,
  getBranch,
  getBranchStats,
  getAllBranchStats,
  createBranch,
  updateBranch,
  deleteBranch,
} = require('../controllers/branchController');
const adminAuth  = require('../middleware/adminAuth');
const { branchRules, branchUpdateRules, mongoIdParam, validate } = require('../middleware/validationMiddleware');

// Public
router.get('/',                           getBranches);
router.get('/stats/all',                  getAllBranchStats);
router.get('/:id',    mongoIdParam('id'), validate, getBranch);
router.get('/:id/stats', mongoIdParam('id'), validate, getBranchStats);

// Admin
router.post('/',      adminAuth, branchRules, validate, createBranch);
router.patch('/:id',  adminAuth, mongoIdParam('id'), validate, branchUpdateRules, validate, updateBranch);
router.delete('/:id', adminAuth, mongoIdParam('id'), validate, deleteBranch);

module.exports = router;
