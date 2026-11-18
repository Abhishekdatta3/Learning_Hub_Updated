import { useEffect, useState } from 'react';
import { listSessions } from '../../api/attendance.api';
import AttendanceQueue from '../../components/common/AttendanceQueue';

export default function AdminDashboard() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = () => listSessions().then(r => {
      setSessions(r.data);
      setSelected(prev => prev || r.data.find(s => s.isOpen)?._id || r.data[0]?._id || null);
    }).catch(console.error);
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  const open = sessions.filter(s => s.isOpen).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-black text-gray-900">Admin · Attendance</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Classes Open Now</p>
          <p className="text-4xl font-black mt-2 text-green-600">{open}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Recent Classes</p>
          <p className="text-4xl font-black mt-2 text-gray-900">{sessions.length}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm md:col-span-1 space-y-2 max-h-[28rem] overflow-y-auto">
          {sessions.length === 0 && <p className="text-sm text-gray-400">No classes yet.</p>}
          {sessions.map(s => (
            <button key={s._id} onClick={() => setSelected(s._id)}
              className={'w-full text-left p-3 rounded-xl border text-sm transition ' +
                (selected === s._id ? 'bg-violet-50 border-violet-200' : 'border-gray-100 hover:bg-gray-50')}>
              <p className="font-semibold text-gray-800">{s.isOpen ? '🟢 ' : ''}{s.subjectName}{s.section ? ' · ' + s.section : ''}</p>
              <p className="text-xs text-gray-400">{s.teacher?.name} · {new Date(s.createdAt).toLocaleDateString()} · {s.presentCount} present</p>
            </button>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm md:col-span-2">
          {selected ? <AttendanceQueue sessionId={selected} /> : <p className="text-sm text-gray-400">Select a class to see its queue.</p>}
        </div>
      </div>
    </div>
  );
}
