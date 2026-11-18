const mongoose = require('mongoose');
// One row = one student in the queue of one class. Queue order = createdAt.
const attendanceSchema = new mongoose.Schema({
  session:     { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rollNumber:  { type: String, required: true },
  subjectName: { type: String, required: true },
}, { timestamps: true });
attendanceSchema.index({ session: 1, student: 1 }, { unique: true });
module.exports = mongoose.model('Attendance', attendanceSchema);
