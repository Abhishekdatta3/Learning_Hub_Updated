const mongoose = require('mongoose');
const noteSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  subject:     { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  unit:        { type: Number, required: true },
  fileUrl:     { type: String, required: true },
  fileType:    { type: String },
  publicId:    { type: String },
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downloads:   { type: Number, default: 0 },
  accessLog: [{ student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, accessedAt: { type: Date, default: Date.now } }],
}, { timestamps: true });
module.exports = mongoose.model('Note', noteSchema);
