const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['student','teacher','admin'], default: 'student' },
  college:  { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  rollNumber: { type: String, trim: true },
  section:  { type: String },
  semester: { type: Number },
  enrolledSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
}, { timestamps: true });
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};
module.exports = mongoose.model('User', userSchema);
