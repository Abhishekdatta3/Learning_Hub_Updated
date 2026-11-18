const Note = require('../models/Note');
const { cloudinary } = require('../config/cloudinary');

const uploadNote = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { title, description, subjectId, unit } = req.body;
    if (!title || !subjectId || !unit) return res.status(400).json({ message: 'title, subjectId and unit are required' });
    const note = await Note.create({
      title, description, subject: subjectId, unit: Number(unit),
      fileUrl: req.file.path, fileType: req.file.mimetype,
      publicId: req.file.filename, uploadedBy: req.user._id
    });
    res.status(201).json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getNotesBySubject = async (req, res) => {
  try {
    const notes = await Note.find({ subject: req.params.subjectId })
      .populate('uploadedBy', 'name').sort({ unit: 1 });
    res.json(notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const trackAccess = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.noteId,
      { $inc: { downloads: 1 }, $push: { accessLog: { student: req.user._id } } },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ fileUrl: note.fileUrl });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.uploadedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your note' });
    await cloudinary.uploader.destroy(note.publicId, { resource_type: 'auto' });
    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { uploadNote, getNotesBySubject, trackAccess, deleteNote };
