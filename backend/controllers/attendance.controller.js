const Attendance        = require('../models/Attendance');
const AttendanceSession = require('../models/AttendanceSession');

const isAdmin = (u) => u.role === 'admin';

// Students only see classes for their own section (or classes with no section set)
const sectionFilter = (user) => ({ section: { $in: ['', user.section || ''] } });

// ---- TEACHER ----

// POST /api/attendance/sessions   { subjectName, section? }
const startSession = async (req, res) => {
  try {
    const subjectName = (req.body.subjectName || '').trim();
    const section     = (req.body.section || '').trim();
    if (!subjectName) return res.status(400).json({ message: 'Subject name is required' });

    // Don't allow two open classes with the same subject+section by the same teacher
    const open = await AttendanceSession.findOne({ teacher: req.user._id, subjectName, section, isOpen: true });
    if (open) return res.status(400).json({ message: 'This class is already open. Close it first.' });

    const session = await AttendanceSession.create({ teacher: req.user._id, subjectName, section });
    res.status(201).json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PATCH /api/attendance/sessions/:id/close
const closeSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!isAdmin(req.user) && session.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your class' });
    session.isOpen = false;
    session.closedAt = new Date();
    await session.save();
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/attendance/sessions  — teacher: own classes, admin: all classes
const listSessions = async (req, res) => {
  try {
    const filter = isAdmin(req.user) ? {} : { teacher: req.user._id };
    const sessions = await AttendanceSession.find(filter)
      .populate('teacher', 'name').sort({ createdAt: -1 }).limit(30).lean();

    const counts = await Attendance.aggregate([
      { $match: { session: { $in: sessions.map(s => s._id) } } },
      { $group: { _id: '$session', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id.toString()] = c.count; });

    res.json(sessions.map(s => ({ ...s, presentCount: countMap[s._id.toString()] || 0 })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/attendance/sessions/:id/queue  — used by teacher AND admin screens
const getQueue = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id).populate('teacher', 'name');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!isAdmin(req.user) && session.teacher._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your class' });

    const records = await Attendance.find({ session: session._id })
      .populate('student', 'name').sort({ createdAt: 1 });

    res.json({
      session,
      queue: records.map((r, i) => ({
        position:   i + 1,
        rollNumber: r.rollNumber,
        name:       r.student?.name || '',
        time:       r.createdAt,
      })),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ---- STUDENT ----

// GET /api/attendance/sessions/open — classes the student can currently join
const getOpenSessions = async (req, res) => {
  try {
    const sessions = await AttendanceSession.find({ isOpen: true, ...sectionFilter(req.user) })
      .populate('teacher', 'name').sort({ createdAt: -1 }).lean();
    const mine = await Attendance.find({ student: req.user._id, session: { $in: sessions.map(s => s._id) } }).lean();

    const markedMap = {};
    mine.forEach(m => { markedMap[m.session.toString()] = m; });

    const result = [];
    for (const s of sessions) {
      const my = markedMap[s._id.toString()];
      let position = null;
      if (my) position = (await Attendance.countDocuments({ session: s._id, createdAt: { $lte: my.createdAt } }));
      result.push({ ...s, marked: !!my, position });
    }
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/attendance/sessions/:id/mark   { rollNumber? }
const markPresent = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!session.isOpen) return res.status(400).json({ message: 'Attendance for this class is closed' });
    if (session.section && session.section !== (req.user.section || ''))
      return res.status(403).json({ message: 'This class is for section ' + session.section });

    // Roll number: use the saved one, or save the one typed now (first time only)
    let roll = (req.user.rollNumber || '').trim();
    if (!roll) {
      roll = (req.body.rollNumber || '').trim();
      if (!roll) return res.status(400).json({ message: 'Please enter your roll number' });
      await require('../models/User').findByIdAndUpdate(req.user._id, { rollNumber: roll });
    }

    const record = await Attendance.create({
      session: session._id, student: req.user._id, rollNumber: roll, subjectName: session.subjectName,
    });
    const position = await Attendance.countDocuments({ session: session._id, createdAt: { $lte: record.createdAt } });
    res.status(201).json({ message: 'Attendance marked', position, rollNumber: roll });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You are already in the queue for this class' });
    res.status(500).json({ message: err.message });
  }
};

// GET /api/attendance/my — % per subject = classes attended / classes held
const getMyAttendance = async (req, res) => {
  try {
    const held = await AttendanceSession.aggregate([
      { $match: sectionFilter(req.user) },
      { $group: { _id: '$subjectName', total: { $sum: 1 } } },
    ]);
    const mine = await Attendance.aggregate([
      { $match: { student: req.user._id } },
      { $group: { _id: '$subjectName', present: { $sum: 1 } } },
    ]);
    const presentMap = {};
    mine.forEach(m => { presentMap[m._id] = m.present; });

    res.json(held.map(h => {
      const present = Math.min(presentMap[h._id] || 0, h.total);
      return {
        subject: { name: h._id },
        total: h.total,
        present,
        percentage: h.total ? ((present / h.total) * 100).toFixed(1) : '0.0',
      };
    }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { startSession, closeSession, listSessions, getQueue, getOpenSessions, markPresent, getMyAttendance };
