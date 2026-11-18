const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorise } = require('../middleware/role.middleware');
const { getAllTeachers, getTeacherById, upsertMyProfile, getMyProfile } = require('../controllers/teacher.controller');

router.get('/',              protect, getAllTeachers);
router.get('/profile/me',   protect, authorise('teacher'), getMyProfile);
router.post('/profile',     protect, authorise('teacher'), upsertMyProfile);
router.get('/:id',          protect, getTeacherById);

module.exports = router;
