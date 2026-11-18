import { useEffect, useState } from 'react';
import { getSlots, bookSlot, getHistory, rateSession } from '../../api/session.api';
import { getTeachers } from '../../api/teacher.api';
import Loader from '../../components/common/Loader';

export default function BookSession() {
  const [slots,            setSlots]            = useState([]);
  const [history,          setHistory]          = useState([]);
  const [teachers,         setTeachers]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [booking,          setBooking]          = useState(null);
  const [activeRoom,       setActiveRoom]       = useState(null);
  const [tab,              setTab]              = useState('teachers');
  const [ratingData,       setRatingData]       = useState({});
  const [ratingSubmitted,  setRatingSubmitted]  = useState({});
  const [selectedTeacher,  setSelectedTeacher]  = useState(null);

  useEffect(() => {
    Promise.all([getSlots(), getHistory(), getTeachers()])
      .then(([s, h, t]) => { setSlots(s.data); setHistory(h.data); setTeachers(t.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleBook = async (slotId) => {
    setBooking(slotId);
    try {
      const res = await bookSlot(slotId);
      setSlots(prev => prev.filter(s => s._id !== slotId));
      setActiveRoom(res.data.roomId);
      const updated = await getHistory();
      setHistory(updated.data);
    } catch (e) {
      alert(e.response?.data?.message || 'Booking failed');
    } finally { setBooking(null); }
  };

  const submitRating = async (sessionId) => {
    const d = ratingData[sessionId];
    if (!d?.rating) return alert('Please select a rating');
    try {
      await rateSession(sessionId, { rating: d.rating, review: d.review || '' });
      setRatingSubmitted(prev => ({ ...prev, [sessionId]: true }));
    } catch { alert('Rating failed'); }
  };

  if (loading) return <Loader />;

  const TABS = [
    { key: 'teachers',  label: `👩‍🏫 Teachers (${teachers.length})` },
    { key: 'available', label: `📅 Available Slots (${slots.length})` },
    { key: 'history',   label: `📜 My History (${history.length})` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">🎯 Sessions & Teachers</h1>
        <p className="text-gray-400 text-sm mt-1">Browse teacher profiles, book slots, and join live classes</p>
      </div>

      {/* Live class iframe */}
      {activeRoom && (
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
            <span className="text-white font-semibold text-sm">🔴 Live Class — {activeRoom}</span>
            <button onClick={() => setActiveRoom(null)} className="text-gray-400 hover:text-white text-sm font-bold">✕ Leave</button>
          </div>
          <iframe
            src={`https://meet.jit.si/${activeRoom}`}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full" style={{ height: '480px', border: 'none' }} title="Live Class"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TEACHERS TAB ── */}
      {tab === 'teachers' && (
        <div className="space-y-3">
          {teachers.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 shadow-sm">
              <p className="text-4xl mb-2">👩‍🏫</p>
              <p className="font-medium">No teachers have registered yet</p>
            </div>
          )}
          {teachers.map(t => (
            <div key={t._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{t.name}</p>
                    {t.profile?.isVerified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ Verified</span>}
                    {t.profile?.available === false && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Unavailable</span>}
                  </div>
                  <p className="text-xs text-gray-400">{t.email}</p>
                  {t.profile?.bio && <p className="text-sm text-gray-600 mt-1">{t.profile.bio}</p>}
                  {t.profile?.expertise?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.profile.expertise.map((e, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{e}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    {t.profile?.hourlyRate > 0 && <span>💰 ₹{t.profile.hourlyRate}/hr</span>}
                    {t.profile?.rating > 0 && (
                      <span>⭐ {t.profile.rating.toFixed(1)} ({t.profile.totalRatings} reviews)</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedTeacher(selectedTeacher?._id === t._id ? null : t); }}
                  className="text-xs bg-violet-100 text-violet-700 font-bold px-3 py-2 rounded-xl hover:bg-violet-200 transition whitespace-nowrap"
                >
                  {selectedTeacher?._id === t._id ? 'Hide Slots' : 'View Slots'}
                </button>
              </div>

              {/* Inline slots for this teacher */}
              {selectedTeacher?._id === t._id && (
                <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                  {slots.filter(s => s.teacher?._id === t._id || s.teacher === t._id).length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">No available slots from this teacher right now</p>
                  ) : slots.filter(s => (s.teacher?._id || s.teacher) === t._id).map(s => (
                    <div key={s._id} className="flex items-center justify-between bg-violet-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{s.subject?.name || 'Session'}</p>
                        <p className="text-xs text-gray-400">
                          {s.slotDate ? new Date(s.slotDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'TBD'}
                          {' '} · {s.startTime}–{s.endTime}
                        </p>
                      </div>
                      <button onClick={() => handleBook(s._id)} disabled={booking === s._id}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition disabled:opacity-50">
                        {booking === s._id ? '…' : 'Book'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── AVAILABLE SLOTS TAB ── */}
      {tab === 'available' && (
        <div className="space-y-3">
          {slots.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 shadow-sm">
              <p className="text-4xl mb-2">📅</p>
              <p className="font-medium">No available slots right now</p>
              <p className="text-sm mt-1">Check back later or browse the Marketplace</p>
            </div>
          )}
          {slots.map(s => (
            <div key={s._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-start gap-4">
              <div className="bg-blue-100 rounded-xl p-3 text-2xl">📚</div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{s.subject?.name || 'Class Session'}</p>
                <p className="text-sm text-gray-500">👤 {s.teacher?.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  🗓 {s.slotDate ? new Date(s.slotDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'TBD'} &nbsp;
                  🕐 {s.startTime}–{s.endTime}
                </p>
              </div>
              <button onClick={() => handleBook(s._id)} disabled={booking === s._id}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition disabled:opacity-50 whitespace-nowrap">
                {booking === s._id ? '…' : 'Book & Join'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 shadow-sm">
              <p className="text-sm">No session history yet</p>
            </div>
          )}
          {history.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-800">{s.subject?.name || 'Session'}</p>
                  <p className="text-sm text-gray-500">👤 {s.teacher?.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.slotDate ? new Date(s.slotDate).toLocaleDateString() : ''} · {s.startTime}–{s.endTime}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.status === 'available' ? 'bg-blue-100 text-blue-700' : s.status === 'booked' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {s.status}
                  </span>
                  {s.roomId && (
                    <button onClick={() => setActiveRoom(s.roomId)} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold">
                      🎥 Rejoin
                    </button>
                  )}
                </div>
              </div>
              {s.status === 'completed' && !s.rating && !ratingSubmitted[s._id] && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Rate this session:</p>
                  <div className="flex gap-1 mb-2">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setRatingData(prev => ({ ...prev, [s._id]: { ...prev[s._id], rating: star } }))}
                        className={`text-xl transition ${(ratingData[s._id]?.rating || 0) >= star ? 'text-amber-400' : 'text-gray-200'}`}>★</button>
                    ))}
                  </div>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs mb-2 focus:outline-none"
                    placeholder="Leave a review (optional)"
                    onChange={e => setRatingData(prev => ({ ...prev, [s._id]: { ...prev[s._id], review: e.target.value } }))} />
                  <button onClick={() => submitRating(s._id)} className="text-xs bg-amber-500 text-white px-4 py-1.5 rounded-lg font-bold">
                    Submit Rating
                  </button>
                </div>
              )}
              {ratingSubmitted[s._id] && <p className="text-xs text-green-600 font-semibold mt-2">⭐ Rating submitted!</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
