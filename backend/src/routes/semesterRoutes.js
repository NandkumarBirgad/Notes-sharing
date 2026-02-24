const express   = require('express');
const router    = express.Router();
const { getSemesters, createSemester } = require('../controllers/semesterController');
const adminAuth = require('../middleware/adminAuth');
const { semesterRules, mongoIdParam, validate } = require('../middleware/validationMiddleware');

router.get('/:yearId', mongoIdParam('yearId'), validate, getSemesters);
router.post('/',       adminAuth, semesterRules, validate, createSemester);

module.exports = router;
