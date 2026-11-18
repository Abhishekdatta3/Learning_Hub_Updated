
import { useState, useEffect } from 'react';
import { createSlot, getHistory } from '../../api/session.api';
import { createMarketplaceSlot } from '../../api/marketplace.api';

export default function ManageSlots() {
  const [form, setForm] = useState({ subjectId: '', slotDate: '', startTime: '', endTime: '', maxStudents: 30 });
  const [mode, setMode] = useState('class'); // 'class' | 'marketplace'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);

  useEffect(() => {
    getHistory().then(r => setSessions(r.data)).catch(console.error);
  }, []);

  const handleCreate = async () => {
    if (!form.slotDate || !form.startTime || !form.endTime) return setError('Date and times are required');
    if (mode === 'class' && !form.subjectId) return setError('Subject ID is required for class sessions');
    setError(''); setLoading(true);
    try {
      let res;
      if (mode === 'class') {
        res = await createSlot({ subjectId: form.subjectId, slotDate: form.slotDate, startTime: form.startTime, endTime: form.endTime, maxStudents: form.maxStudents });
      } else {
        res = await createMarketplaceSlot({ slotDate: form.slotDate, startTime: form.startTime, endTime: form.endTime });
      }
      setSuccess(res.data);
      setSessions(prev => [res.data, ...prev]);
      setForm({ subjectId: '', slotDate: '', startTime: '', endTime: '', maxStudents: 30 });
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = (roomId) => {
    setActiveRoom(roomId);
  };

  const jitsiUrl = (roomId) => `https://meet.jit.si/${roomId}`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">🎥 Live Sessions</h1>
        <p className="text-gray-400 text-sm mt-1">Create class slots or marketplace sessions & start live video</p>
      </div>

      {activeRoom && (
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
            <span className="text-white font-semibold text-sm">🔴 Live Class — {activeRoom}</span>
            <button onClick={() => setActiveRoom(null)} className="text-gray-400 hover:text-white text-sm font-bold">✕ End</button>
          </div>
          <iframe
            src={jitsiUrl(activeRoom)}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full"
            style={{ height: '480px', border: 'none' }}
            title="Live Class"
          />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        <div className="flex gap-2">
          {['class', 'marketplace'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${mode === m ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {m === 'class' ? '🏫 Class Session' : '🛒 Marketplace'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {mode === 'class' && (
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subject ID *</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="MongoDB ObjectId of subject" value={form.subjectId}
                onChange={e => setForm({ ...form, subjectId: e.target.value })} />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
            <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.slotDate} onChange={e => setForm({ ...form, slotDate: e.target.value })} />
          </div>
          {mode === 'class' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Students</label>
              <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                value={form.maxStudents} onChange={e => setForm({ ...form, maxStudents: e.target.value })} />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time *</label>
            <input type="time" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">End Time *</label>
            <input type="time" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
        {success && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
            ✅ Session created! Room ID: <code className="font-mono font-bold">{success.roomId}</code>
            <button onClick={() => joinRoom(success.roomId)} className="ml-3 bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold">
              Start Now →
            </button>
          </div>
        )}

        <button onClick={handleCreate} disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
          {loading ? 'Creating…' : '+ Create Session'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4">My Sessions</h2>
        <div className="space-y-3">
          {sessions.slice(0, 10).map((s, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="font-semibold text-sm text-gray-800">{s.subject?.name || (s.isMarketplace ? 'Marketplace' : 'Class')}</p>
                <p className="text-xs text-gray-400">{s.slotDate ? new Date(s.slotDate).toLocaleDateString() : ''} · {s.startTime}–{s.endTime}</p>
                <code className="text-xs text-gray-400">{s.roomId}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.status === 'available' ? 'bg-blue-100 text-blue-700' : s.status === 'booked' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {s.status}
                </span>
                <button onClick={() => joinRoom(s.roomId)}
                  className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold">
                  🎥 Start
                </button>
              </div>
            </div>
          ))}
          {sessions.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No sessions yet. Create your first one!</p>}
        </div>
      </div>
    </div>
  );
}
