const User = require('../models/User');
const College = require('../models/College');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
  try {
    const { name, email, password, role, section, semester, rollNumber } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const domain = email.split('@')[1];
    const college = await College.findOne({ emailDomain: domain });
    const user = await User.create({ name, email, password, role, college: college?._id, section, semester, rollNumber });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, rollNumber: user.rollNumber, token: generateToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('college', 'name emailDomain');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, college: user.college, section: user.section, semester: user.semester, rollNumber: user.rollNumber, token: generateToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('college','name').populate('enrolledSubjects','name code');
  res.json(user);
};

module.exports = { register, login, getMe };
