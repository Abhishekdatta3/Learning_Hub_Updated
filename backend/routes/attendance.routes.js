const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorise } = require('../middleware/role.middleware');
const c = require('../controllers/attendance.controller');

// teacher / admin
router.post('/sessions',            protect, authorise('teacher'),          c.startSession);
router.get('/sessions',             protect, authorise('teacher','admin'),  c.listSessions);
router.patch('/sessions/:id/close', protect, authorise('teacher','admin'),  c.closeSession);
router.get('/sessions/:id/queue',   protect, authorise('teacher','admin'),  c.getQueue);

// student  (note: /sessions/open must stay above any /sessions/:id GET for students)
router.get('/sessions/open',        protect, authorise('student'),          c.getOpenSessions);
router.post('/sessions/:id/mark',   protect, authorise('student'),          c.markPresent);
router.get('/my',                   protect, authorise('student'),          c.getMyAttendance);

module.exports = router;
