const mongoose = require('mongoose');
const sessionSchema = new mongoose.Schema({
  teacher:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject:   { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  slotDate:  { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime:   { type: String, required: true },
  maxStudents: { type: Number, default: 1 },
  roomId:    { type: String },
  status:    { type: String, enum: ['available','booked','completed','cancelled'], default: 'available' },
  isMarketplace: { type: Boolean, default: false },
  rating:    { type: Number, min: 1, max: 5 },
  review:    { type: String },
}, { timestamps: true });
module.exports = mongoose.model('Session', sessionSchema);
