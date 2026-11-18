const mongoose = require('mongoose');
const subjectSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  code:     { type: String, required: true, unique: true },
  semester: { type: Number, required: true },
  college:  { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  teacher:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
module.exports = mongoose.model('Subject', subjectSchema);
