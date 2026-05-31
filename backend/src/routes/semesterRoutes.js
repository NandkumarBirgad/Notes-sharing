const express   = require('express');
const router    = express.Router();
const { getSemesters, createSemester, deleteSemester } = require('../controllers/semesterController');
const adminAuth = require('../middleware/adminAuth');
const { semesterRules, mongoIdParam, validate } = require('../middleware/validationMiddleware');

router.get('/:yearId',  mongoIdParam('yearId'), validate, getSemesters);
router.post('/',        adminAuth, semesterRules, validate, createSemester);
router.delete('/:id',   adminAuth, mongoIdParam('id'), validate, deleteSemester);

module.exports = router;
