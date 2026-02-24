const express    = require('express');
const router     = express.Router();
const { getYears, createYear } = require('../controllers/yearController');
const adminAuth  = require('../middleware/adminAuth');
const { yearRules, validate } = require('../middleware/validationMiddleware');

router.get('/',  getYears);
router.post('/', adminAuth, yearRules, validate, createYear);

module.exports = router;
