const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorise } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const { uploadNote, getNotesBySubject, trackAccess, deleteNote } = require('../controllers/notes.controller');

router.post('/upload',            protect, authorise('teacher','admin'), upload.single('file'), uploadNote);
router.get('/subject/:subjectId', protect, getNotesBySubject);
router.post('/access/:noteId',    protect, authorise('student'), trackAccess);
router.delete('/:noteId',         protect, authorise('teacher','admin'), deleteNote);

module.exports = router;
