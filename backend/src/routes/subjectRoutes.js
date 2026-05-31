const express   = require('express');
const router    = express.Router();
const { getSubjects, createSubject, deleteSubject } = require('../controllers/subjectController');
const adminAuth = require('../middleware/adminAuth');
const { subjectRules, mongoIdParam, validate } = require('../middleware/validationMiddleware');

router.get('/:semesterId', mongoIdParam('semesterId'), validate, getSubjects);
router.post('/',           adminAuth, subjectRules, validate, createSubject);
router.delete('/:id',      adminAuth, mongoIdParam('id'), validate, deleteSubject);

module.exports = router;
