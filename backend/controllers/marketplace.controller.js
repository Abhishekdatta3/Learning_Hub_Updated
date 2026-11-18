const TeacherProfile = require('../models/TeacherProfile');
const Session = require('../models/Session');

const createProfile = async (req, res) => {
  try {
    const { bio, expertise, hourlyRate } = req.body;
    const profile = await TeacherProfile.findOneAndUpdate({ teacher: req.user._id }, { bio, expertise, hourlyRate, isVerified: true }, { upsert: true, new: true });
    res.json(profile);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getTeachers = async (req, res) => {
  try {
    const { maxRate, minRating } = req.query;
    let filter = { isVerified: true, available: true };
    if (maxRate)   filter.hourlyRate = { $lte: Number(maxRate) };
    if (minRating) filter.rating     = { $gte: Number(minRating) };
    const profiles = await TeacherProfile.find(filter).populate('teacher','name email college').sort({ rating: -1 });
    res.json(profiles);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createMarketplaceSlot = async (req, res) => {
  try {
    const { slotDate, startTime, endTime } = req.body;
    const session = await Session.create({ teacher: req.user._id, slotDate, startTime, endTime, isMarketplace: true, roomId: 'market-' + Date.now() });
    res.status(201).json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { createProfile, getTeachers, createMarketplaceSlot };
