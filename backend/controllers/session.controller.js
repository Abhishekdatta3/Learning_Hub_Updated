const Session = require('../models/Session');

const createSlot = async (req, res) => {
  try {
    const { subjectId, slotDate, startTime, endTime, maxStudents } = req.body;
    const session = await Session.create({ teacher: req.user._id, subject: subjectId, slotDate, startTime, endTime, maxStudents: maxStudents||1, roomId: 'room-' + Date.now() });
    res.status(201).json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAvailableSlots = async (req, res) => {
  try {
    const slots = await Session.find({ status: 'available', isMarketplace: false, slotDate: { $gte: new Date() } }).populate('teacher','name').populate('subject','name');
    res.json(slots);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const bookSlot = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session || session.status !== 'available') return res.status(400).json({ message: 'Slot not available' });
    session.student = req.user._id;
    session.status  = 'booked';
    await session.save();
    res.json({ message: 'Slot booked', roomId: session.roomId });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMyHistory = async (req, res) => {
  try {
    const filter = req.user.role === 'student' ? { student: req.user._id } : { teacher: req.user._id };
    const sessions = await Session.find(filter).populate('teacher student','name email').populate('subject','name').sort({ slotDate: -1 });
    res.json(sessions);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const rateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, { rating: req.body.rating, review: req.body.review }, { new: true });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { createSlot, getAvailableSlots, bookSlot, getMyHistory, rateSession };
