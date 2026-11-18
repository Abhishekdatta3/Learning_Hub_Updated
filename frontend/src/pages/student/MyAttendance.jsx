import { useEffect, useState } from 'react';
import { getMyAttendance, getOpenSessions, markPresent } from '../../api/attendance.api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';

export default function MyAttendance() {
  const { user, login } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [open,       setOpen]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [roll,       setRoll]       = useState(user?.rollNumber || '');
  const [busyId,     setBusyId]     = useState('');
  const [msg,        setMsg]        = useState({ type: '', text: '' });

  const load = () => Promise.all([getMyAttendance(), getOpenSessions()])
    .then(([a, o]) => { setAttendance(a.data); setOpen(o.data); })
    .catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, []);

  const handleMark = async (id) => {
    setMsg({ type: '', text: '' }); setBusyId(id);
    try {
      const res = await markPresent(id, { rollNumber: roll });
      // remember the roll number locally so the box isn't asked again
      if (!user.rollNumber) login({ ...user, rollNumber: res.data.rollNumber });
      setMsg({ type: 'ok', text: `✅ You are #${res.data.position} in the queue (Roll ${res.data.rollNumber})` });
      await load();
    } catch (e) { setMsg({ type: 'err', text: e.response?.data?.message || 'Failed to mark attendance' }); }
    finally { setBusyId(''); }
  };

  if (loading) return <Loader />;
  const atRisk = attendance.filter(a => parseFloat(a.percentage) < 75);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">📊 My Attendance</h1>
        <p className="text-gray-400 text-sm mt-1">When your teacher starts a class, tap “Mark Present”.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-gray-800">✅ Open Classes</h2>

        {!user?.rollNumber && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Your roll number</label>
            <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="e.g. 23CS2011003" value={roll} onChange={e => setRoll(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Saved to your profile after the first time.</p>
          </div>
        )}

        {msg.text && <p className={'text-sm font-medium ' + (msg.type === 'ok' ? 'text-green-600' : 'text-red-500')}>{msg.text}</p>}

        {open.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No class is open for attendance right now.</p>
        ) : open.map(s => (
          <div key={s._id} className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
            <div>
              <p className="font-semibold text-gray-800">{s.subjectName}</p>
              <p className="text-xs text-gray-400">{s.teacher?.name} · {new Date(s.createdAt).toLocaleTimeString()}</p>
            </div>
            {s.marked ? (
              <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-2 rounded-xl">✔ Present · #{s.position}</span>
            ) : (
              <button onClick={() => handleMark(s._id)} disabled={busyId === s._id || (!user?.rollNumber && !roll.trim())}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition disabled:opacity-50">
                {busyId === s._id ? 'Marking…' : 'Mark Present'}
              </button>
            )}
          </div>
        ))}
      </div>

      {atRisk.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm">
          <p className="font-bold text-red-700 mb-1">⚠ Low Attendance Alert</p>
          <p className="text-sm text-red-600">{atRisk.length} subject(s) below 75%.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4">Attendance Summary</h2>
        {attendance.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No attendance records yet.</p>
        ) : (
          <div className="space-y-4">
            {attendance.map((item, i) => {
              const pct = parseFloat(item.percentage);
              const safe = pct >= 75;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold text-gray-800">{item.subject?.name}</span>
                    <div className="text-right">
                      <span className={`font-black ${safe ? 'text-green-600' : 'text-red-600'}`}>{item.percentage}%</span>
                      <span className="text-xs text-gray-400 ml-2">{item.present}/{item.total} classes</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full transition-all ${safe ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: item.percentage + '%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
