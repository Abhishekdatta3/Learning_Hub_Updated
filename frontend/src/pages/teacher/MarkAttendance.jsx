import { useEffect, useState } from 'react';
import { startSession, closeSession, listSessions } from '../../api/attendance.api';
import AttendanceQueue from '../../components/common/AttendanceQueue';

export default function MarkAttendance() {
  const [subjectName, setSubjectName] = useState('');
  const [section,     setSection]     = useState('');
  const [sessions,    setSessions]    = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const refresh = () => listSessions().then(r => {
    setSessions(r.data);
    setSelected(prev => prev || r.data.find(s => s.isOpen)?._id || r.data[0]?._id || null);
  }).catch(console.error);

  useEffect(() => { refresh(); const t = setInterval(refresh, 10000); return () => clearInterval(t); }, []);

  const handleStart = async () => {
    if (!subjectName.trim()) return setError('Enter the subject name');
    setError(''); setLoading(true);
    try {
      const res = await startSession({ subjectName, section });
      setSubjectName(''); setSection('');
      setSelected(res.data._id);
      await refresh();
    } catch (e) { setError(e.response?.data?.message || 'Could not start class'); }
    finally { setLoading(false); }
  };

  const handleClose = async (id) => { await closeSession(id); refresh(); };

  const current = sessions.find(s => s._id === selected);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900">📋 Attendance</h1>
        <p className="text-gray-400 text-sm mt-1">Start a class, students mark themselves present, their roll numbers appear in the queue below.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <input className="sm:col-span-2 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Subject name (e.g. DBMS)" value={subjectName} onChange={e => setSubjectName(e.target.value)} />
          <input className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Section (optional)" value={section} onChange={e => setSection(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
        <button onClick={handleStart} disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
          {loading ? 'Starting…' : '▶ Start Attendance'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-3">My Classes</h2>
        {sessions.length === 0 ? <p className="text-sm text-gray-400">No classes yet.</p> : (
          <div className="flex flex-wrap gap-2">
            {sessions.map(s => (
              <button key={s._id} onClick={() => setSelected(s._id)}
                className={'text-xs px-3 py-2 rounded-xl border font-semibold transition ' +
                  (selected === s._id ? 'bg-violet-600 text-white border-violet-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100')}>
                {s.isOpen ? '🟢 ' : ''}{s.subjectName}{s.section ? ' · ' + s.section : ''} · {new Date(s.createdAt).toLocaleDateString()} · {s.presentCount}
              </button>
            ))}
          </div>
        )}
      </div>

      {current && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <AttendanceQueue sessionId={current._id} />
          {current.isOpen ? (
            <button onClick={() => handleClose(current._id)}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-sm transition">
              ■ Close Attendance
            </button>
          ) : <p className="text-xs text-gray-400 text-center">This class is closed.</p>}
        </div>
      )}
    </div>
  );
}
