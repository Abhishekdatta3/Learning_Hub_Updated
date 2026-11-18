import { useEffect, useState } from 'react';
import { getMyProfile, upsertMyProfile } from '../../api/teacher.api';

export default function TeacherProfile() {
  const [form, setForm]       = useState({ bio: '', expertise: '', hourlyRate: '', available: true });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  useEffect(() => {
    getMyProfile().then(r => {
      const p = r.data;
      if (p && p._id) {
        setForm({
          bio:        p.bio || '',
          expertise:  (p.expertise || []).join(', '),
          hourlyRate: p.hourlyRate || '',
          available:  p.available !== undefined ? p.available : true,
        });
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError(''); setSuccess('');
    if (!form.hourlyRate) return setError('Hourly rate is required');
    setSaving(true);
    try {
      await upsertMyProfile({ bio: form.bio, expertise: form.expertise, hourlyRate: Number(form.hourlyRate), available: form.available });
      setSuccess('✅ Profile saved! Students can now see your profile on the Sessions page.');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save profile');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading…</div>;

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-black text-gray-900">👤 My Teacher Profile</h1>
        <p className="text-gray-400 text-sm mt-1">This info is shown to students on the Sessions page</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
          <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            placeholder="Tell students about yourself and your teaching style…"
            value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Areas of Expertise</label>
          <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="e.g. Data Structures, Algorithms, Python (comma separated)"
            value={form.expertise} onChange={e => setForm({ ...form, expertise: e.target.value })} />
          <p className="text-xs text-gray-400 mt-1">Separate each topic with a comma</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Hourly Rate (₹) *</label>
          <input type="number" min="0" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="e.g. 500"
            value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setForm({ ...form, available: !form.available })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.available ? 'bg-violet-600' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${form.available ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {form.available ? '✅ Available for sessions' : '🔴 Not available right now'}
          </span>
        </div>

        {error   && <p className="text-sm text-red-500 font-medium">{error}</p>}
        {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
          {saving ? 'Saving…' : '💾 Save Profile'}
        </button>
      </div>
    </div>
  );
}
