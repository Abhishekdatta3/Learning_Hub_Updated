const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');

// GET /api/teachers — returns all teachers with their profile info
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    const profiles = await TeacherProfile.find();
    const profileMap = {};
    profiles.forEach(p => { profileMap[p.teacher.toString()] = p; });

    const result = teachers.map(t => ({
      _id:       t._id,
      name:      t.name,
      email:     t.email,
      college:   t.college,
      profile:   profileMap[t._id.toString()] || null,
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/teachers/:id
const getTeacherById = async (req, res) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' }).select('-password').populate('college','name');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    const profile = await TeacherProfile.findOne({ teacher: teacher._id });
    res.json({ ...teacher.toObject(), profile: profile || null });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/teachers/profile — teacher creates/updates their own profile
const upsertMyProfile = async (req, res) => {
  try {
    const { bio, expertise, hourlyRate, available } = req.body;
    const profile = await TeacherProfile.findOneAndUpdate(
      { teacher: req.user._id },
      { bio, expertise: Array.isArray(expertise) ? expertise : (expertise ? expertise.split(',').map(s => s.trim()) : []), hourlyRate: Number(hourlyRate) || 0, available: available !== undefined ? available : true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(profile);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/teachers/profile/me
const getMyProfile = async (req, res) => {
  try {
    const profile = await TeacherProfile.findOne({ teacher: req.user._id });
    res.json(profile || {});
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAllTeachers, getTeacherById, upsertMyProfile, getMyProfile };
