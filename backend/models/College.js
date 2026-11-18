const mongoose = require('mongoose');
const collegeSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  emailDomain: { type: String, required: true, unique: true },
  address:     { type: String },
  city:        { type: String },
  verified:    { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('College', collegeSchema);
