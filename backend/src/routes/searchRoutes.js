const express = require('express');
const router  = express.Router();
const { search } = require('../controllers/searchController');
const { searchRules, validate } = require('../middleware/validationMiddleware');

router.get('/', searchRules, validate, search);

module.exports = router;
