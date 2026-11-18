import { useEffect, useState } from 'react';
import { getQueue } from '../../api/attendance.api';

// Live queue of roll numbers for one class. Refreshes every 5 seconds.
// Used on both the teacher page and the admin page.
export default function AttendanceQueue({ sessionId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    let stop = false;
    const load = () => getQueue(sessionId).then(r => { if (!stop) setData(r.data); }).catch(console.error);
    setData(null);
    load();
    const t = setInterval(load, 5000);
    return () => { stop = true; clearInterval(t); };
  }, [sessionId]);

  if (!data) return <p className="text-sm text-gray-400 py-4 text-center">Loading queue…</p>;

  const { session, queue } = data;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-gray-800">{session.subjectName}{session.section ? ' · ' + session.section : ''}</p>
          <p className="text-xs text-gray-400">
            {new Date(session.createdAt).toLocaleString()} {session.teacher?.name ? '· ' + session.teacher.name : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-violet-600">{queue.length}</p>
          <p className="text-xs text-gray-400">present</p>
        </div>
      </div>

      {queue.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No one has marked attendance yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-3">#</th><th className="py-2 pr-3">Roll No</th>
                <th className="py-2 pr-3">Name</th><th className="py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {queue.map(q => (
                <tr key={q.position} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-3 font-bold text-gray-500">{q.position}</td>
                  <td className="py-2 pr-3 font-semibold text-gray-800">{q.rollNumber}</td>
                  <td className="py-2 pr-3 text-gray-600">{q.name}</td>
                  <td className="py-2 text-gray-400">{new Date(q.time).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
