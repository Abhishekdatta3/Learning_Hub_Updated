
import { useState } from 'react';
import { uploadNote, getNotesBySubject, deleteNote } from '../../api/notes.api';

export default function UploadNotes() {
  const [form, setForm] = useState({ title: '', description: '', subjectId: '', unit: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [notes, setNotes] = useState([]);
  const [viewSubject, setViewSubject] = useState('');
  const [viewLoading, setViewLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.subjectId || !form.unit || !file) return setError('All fields and a file are required');
    setError(''); setSuccess(''); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('subjectId', form.subjectId);
      fd.append('unit', form.unit);
      fd.append('file', file);
      await uploadNote(fd);
      setSuccess('✅ Note uploaded successfully!');
      setForm({ title: '', description: '', subjectId: '', unit: '' });
      setFile(null);
    } catch (e) {
      setError(e.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    if (!viewSubject.trim()) return;
    setViewLoading(true);
    try {
      const res = await getNotesBySubject(viewSubject.trim());
      setNotes(res.data);
    } catch (e) {
      setNotes([]);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Delete this note?')) return;
    try {
      await deleteNote(noteId);
      setNotes(notes.filter(n => n._id !== noteId));
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">📁 Upload Notes</h1>
        <p className="text-gray-400 text-sm mt-1">Upload PDF, PPTX, DOCX or any study material</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Note Title *</label>
            <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. Unit 3 – Greedy Algorithms" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject ID *</label>
            <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="MongoDB ObjectId" value={form.subjectId}
              onChange={e => setForm({ ...form, subjectId: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Number *</label>
            <input type="number" min="1" max="10" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="1–10" value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Brief description of the notes…" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">File *</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition"
            onClick={() => document.getElementById('fileInput').click()}>
            {file ? (
              <div>
                <p className="text-blue-600 font-semibold text-sm">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-3xl mb-2">📎</p>
                <p className="text-sm text-gray-500">Click to select file (PDF, PPTX, DOCX, etc.)</p>
              </div>
            )}
          </div>
          <input id="fileInput" type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
        </div>

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
        {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
          {loading ? 'Uploading…' : '⬆ Upload to Cloudinary'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-3">View Notes by Subject</h2>
        <div className="flex gap-3">
          <input className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Subject ID" value={viewSubject}
            onChange={e => setViewSubject(e.target.value)} />
          <button onClick={fetchNotes} className="bg-gray-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
            {viewLoading ? '…' : 'Fetch'}
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {notes.map(n => (
            <div key={n._id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="font-semibold text-sm text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-400">Unit {n.unit} · {n.downloads || 0} downloads</p>
              </div>
              <div className="flex gap-2">
                <a href={n.fileUrl} target="_blank" rel="noreferrer"
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-semibold">View</a>
                <button onClick={() => handleDelete(n._id)}
                  className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-semibold">Delete</button>
              </div>
            </div>
          ))}
          {notes.length === 0 && viewSubject && !viewLoading && (
            <p className="text-sm text-gray-400 text-center py-4">No notes found for this subject</p>
          )}
        </div>
      </div>
    </div>
  );
}
