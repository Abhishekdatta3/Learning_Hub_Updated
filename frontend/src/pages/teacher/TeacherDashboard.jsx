
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getHistory } from '../../api/session.api';
import Loader from '../../components/common/Loader';

const StatCard = ({ label, value, sub, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
    <p className={`text-4xl font-black mt-2 ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory().then(r => setSessions(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const upcoming = sessions.filter(s => s.status === 'available' || s.status === 'booked');
  const completed = sessions.filter(s => s.status === 'completed');
  const ratings = sessions.filter(s => s.rating).map(s => s.rating);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Hello, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-400 text-sm mt-1">Your teaching overview</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Sessions" value={sessions.length} color="text-gray-900" />
        <StatCard label="Upcoming" value={upcoming.length} color="text-blue-600" />
        <StatCard label="Completed" value={completed.length} color="text-green-600" />
        <StatCard label="Avg Rating" value={avgRating} sub="out of 5" color="text-amber-500" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: '📋 Take Attendance', href: '/teacher/attendance', color: 'bg-violet-50 text-violet-700 border-violet-100' },
            { label: '📁 Upload Notes', href: '/teacher/notes', color: 'bg-blue-50 text-blue-700 border-blue-100' },
            { label: '🎥 Live Session', href: '/teacher/slots', color: 'bg-green-50 text-green-700 border-green-100' },
          ].map(({ label, href, color }) => (
            <a key={href} href={href} className={`flex items-center justify-center rounded-xl border p-4 font-semibold text-sm transition hover:scale-105 ${color}`}>
              {label}
            </a>
          ))}
        </div>
      </div>
      {sessions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">Recent Sessions</h2>
          <div className="space-y-3">
            {sessions.slice(0, 5).map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-800">{s.subject?.name || 'Session'}</p>
                  <p className="text-xs text-gray-400">{s.slotDate ? new Date(s.slotDate).toLocaleDateString() : ''} {s.startTime} – {s.endTime}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.status === 'available' ? 'bg-blue-100 text-blue-700' : s.status === 'booked' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
