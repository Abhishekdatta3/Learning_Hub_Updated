const mongoose = require('mongoose');
// One class / lecture. Teacher opens it, students join the queue, teacher closes it.
const sessionSchema = new mongoose.Schema({
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectName: { type: String, required: true, trim: true },
  section:     { type: String, default: '', trim: true },   // optional, e.g. "CSE-B"
  isOpen:      { type: Boolean, default: true },
  closedAt:    { type: Date },
}, { timestamps: true });
module.exports = mongoose.model('AttendanceSession', sessionSchema);
