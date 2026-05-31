const express    = require('express');
const router     = express.Router();
const { getYears, getYear, createYear, updateYear, deleteYear } = require('../controllers/yearController');
const adminAuth  = require('../middleware/adminAuth');
const { yearRules, yearUpdateRules, mongoIdParam, validate } = require('../middleware/validationMiddleware');

router.get('/',       getYears);                                               // GET /years?branchId=
router.get('/:id',    mongoIdParam('id'), validate, getYear);                  // GET /years/:id
router.post('/',      adminAuth, yearRules, validate, createYear);             // POST /years
router.patch('/:id',  adminAuth, mongoIdParam('id'), validate, yearUpdateRules, validate, updateYear);
router.delete('/:id', adminAuth, mongoIdParam('id'), validate, deleteYear);

module.exports = router;
