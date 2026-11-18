import { useState } from 'react';
import { getNotesBySubject, trackAccess } from '../../api/notes.api';
import Loader from '../../components/common/Loader';

const fileIcon = (mime) => {
  if (!mime) return '📄';
  if (mime.includes('pdf')) return '📕';
  if (mime.includes('presentation') || mime.includes('pptx')) return '📊';
  if (mime.includes('word') || mime.includes('docx')) return '📝';
  if (mime.includes('image')) return '🖼';
  return '📄';
};

export default function Notes() {
  const [subjectId, setSubjectId] = useState('');
  const [notes,     setNotes]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [searched,  setSearched]  = useState(false);

  const fetchNotes = async () => {
    if (!subjectId.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const res = await getNotesBySubject(subjectId.trim());
      setNotes(res.data);
    } catch { setNotes([]); }
    finally { setLoading(false); }
  };

  const openNote = async (note) => {
    try {
      const res = await trackAccess(note._id);
      window.open(res.data.fileUrl || note.fileUrl, '_blank');
    } catch {
      window.open(note.fileUrl, '_blank');
    }
  };

  const unitGroups = notes.reduce((acc, n) => {
    const key = n.unit || 0;
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">📚 Study Notes</h1>
        <p className="text-gray-400 text-sm mt-1">Browse and download study materials by subject</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex gap-3">
          <input
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter Subject ID to browse notes"
            value={subjectId}
            onChange={e => setSubjectId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchNotes()}
          />
          <button onClick={fetchNotes} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 rounded-xl transition">
            Search
          </button>
        </div>
      </div>

      {loading && <Loader />}

      {!loading && searched && Object.keys(unitGroups).length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 shadow-sm">
          <p className="text-4xl mb-2">🔍</p>
          <p className="font-medium">No notes found for this subject</p>
        </div>
      )}

      {Object.entries(unitGroups).sort(([a], [b]) => Number(a) - Number(b)).map(([unit, unitNotes]) => (
        <div key={unit} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Unit {unit}</h3>
          <div className="space-y-2">
            {unitNotes.map(n => (
              <div key={n._id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 hover:bg-blue-50 transition group">
                <span className="text-2xl">{fileIcon(n.fileType)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{n.title}</p>
                  <p className="text-xs text-gray-400">By {n.uploadedBy?.name} · {n.downloads || 0} downloads</p>
                  {n.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{n.description}</p>}
                </div>
                <button onClick={() => openNote(n)}
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  Open ↗
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
