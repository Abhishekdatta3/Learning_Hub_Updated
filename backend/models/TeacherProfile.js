const mongoose = require('mongoose');
const teacherProfileSchema = new mongoose.Schema({
  teacher:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio:          { type: String },
  expertise:    [{ type: String }],
  hourlyRate:   { type: Number, required: true },
  rating:       { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  isVerified:   { type: Boolean, default: false },
  available:    { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);
