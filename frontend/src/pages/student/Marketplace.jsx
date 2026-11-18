
import { useState } from 'react';
import { getTeachers, createMarketplaceSlot } from '../../api/marketplace.api';
import { getSlots, bookSlot } from '../../api/session.api';
import Loader from '../../components/common/Loader';

const StarRating = ({ rating }) => (
  <span className="text-amber-400 text-xs">
    {'★'.repeat(Math.round(rating || 0))}{'☆'.repeat(5 - Math.round(rating || 0))}
    <span className="text-gray-400 ml-1">{rating ? rating.toFixed(1) : 'No ratings'}</span>
  </span>
);

export default function Marketplace() {
  const [filters, setFilters] = useState({ maxRate: '', minRating: '' });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [booked, setBooked] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);

  const searchTeachers = async () => {
    setLoading(true); setSearched(true); setSelected(null); setSlots([]);
    try {
      const params = {};
      if (filters.maxRate) params.maxRate = filters.maxRate;
      if (filters.minRating) params.minRating = filters.minRating;
      const res = await getTeachers(params);
      setTeachers(res.data);
    } catch (e) {
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const selectTeacher = async (teacher) => {
    setSelected(teacher);
    setSlotsLoading(true);
    try {
      const res = await getSlots();
      const teacherSlots = res.data.filter(s => s.teacher?._id === teacher.teacher?._id || s.teacher === teacher.teacher?._id);
      setSlots(teacherSlots);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBook = async (slotId) => {
    setBooking(slotId);
    try {
      const res = await bookSlot(slotId);
      setBooked(res.data);
      setSlots(prev => prev.filter(s => s._id !== slotId));
      if (res.data.roomId) setActiveRoom(res.data.roomId);
    } catch (e) {
      alert(e.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(null);
    }
  };

  const jitsiUrl = (roomId) => `https://meet.jit.si/${roomId}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">🛒 Teacher Marketplace</h1>
        <p className="text-gray-400 text-sm mt-1">Search verified teachers, view profiles and book 1-on-1 sessions</p>
      </div>

      {activeRoom && (
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
            <span className="text-white font-semibold text-sm">🔴 Live Session — {activeRoom}</span>
            <button onClick={() => setActiveRoom(null)} className="text-gray-400 hover:text-white text-sm font-bold">✕ Leave</button>
          </div>
          <iframe src={jitsiUrl(activeRoom)} allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full" style={{ height: '480px', border: 'none' }} title="Marketplace Session" />
        </div>
      )}

      {booked && !activeRoom && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-green-700">✅ Session Booked!</p>
          <p className="text-sm text-green-600 mt-1">Room: <code className="font-mono">{booked.roomId}</code></p>
          <button onClick={() => setActiveRoom(booked.roomId)} className="mt-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
            🎥 Join Now
          </button>
        </div>
      )}

      {/* Search filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4">🔍 Find Teachers</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Max Hourly Rate (₹)</label>
            <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="e.g. 500" value={filters.maxRate}
              onChange={e => setFilters({ ...filters, maxRate: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Min Rating</label>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              value={filters.minRating} onChange={e => setFilters({ ...filters, minRating: e.target.value })}>
              <option value="">Any</option>
              <option value="3">3+ ★</option>
              <option value="4">4+ ★</option>
              <option value="4.5">4.5+ ★</option>
            </select>
          </div>
        </div>
        <button onClick={searchTeachers} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition">
          {loading ? 'Searching…' : '🔍 Search Teachers'}
        </button>
      </div>

      {loading && <Loader />}

      {!loading && searched && teachers.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 shadow-sm">
          <p className="text-4xl mb-2">🔍</p>
          <p>No teachers found. Try relaxing the filters.</p>
        </div>
      )}

      {/* Teacher grid */}
      {teachers.length > 0 && !selected && (
        <div className="grid gap-4 sm:grid-cols-2">
          {teachers.map((t, i) => (
            <div key={i} className={`bg-white rounded-2xl border p-5 shadow-sm cursor-pointer hover:border-amber-300 transition ${selected?._id === t._id ? 'border-amber-400' : 'border-gray-100'}`}
              onClick={() => selectTeacher(t)}>
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 rounded-full w-12 h-12 flex items-center justify-center text-xl font-black text-amber-700">
                  {t.teacher?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800">{t.teacher?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{t.teacher?.college || 'Verified Teacher'}</p>
                  <StarRating rating={t.rating} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3 line-clamp-2">{t.bio || 'Experienced educator'}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {(t.expertise || []).slice(0, 3).map((e, j) => (
                  <span key={j} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">{e}</span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="font-black text-gray-900">₹{t.hourlyRate}<span className="text-xs font-normal text-gray-400">/hr</span></span>
                <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-1.5 rounded-lg text-sm transition">
                  View Slots →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected teacher slots */}
      {selected && (
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-gray-900">{selected.teacher?.name}</p>
              <StarRating rating={selected.rating} />
            </div>
            <button onClick={() => { setSelected(null); setSlots([]); }} className="text-sm text-gray-400 hover:text-gray-700 font-bold">
              ← Back
            </button>
          </div>

          {selected.bio && <p className="text-sm text-gray-600">{selected.bio}</p>}

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Expertise</p>
            <div className="flex flex-wrap gap-1">
              {(selected.expertise || []).map((e, i) => (
                <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-100">{e}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="font-bold text-gray-800 mb-3">Available Slots</p>
            {slotsLoading && <p className="text-sm text-gray-400">Loading slots…</p>}
            {!slotsLoading && slots.length === 0 && (
              <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-400 text-sm">
                No available slots from this teacher right now
              </div>
            )}
            <div className="space-y-2">
              {slots.map(s => (
                <div key={s._id} className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{s.subject?.name || 'Session'}</p>
                    <p className="text-xs text-gray-500">
                      {s.slotDate ? new Date(s.slotDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'TBD'} · {s.startTime}–{s.endTime}
                    </p>
                  </div>
                  <button onClick={() => handleBook(s._id)} disabled={booking === s._id}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition disabled:opacity-50">
                    {booking === s._id ? '…' : '📅 Book'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
