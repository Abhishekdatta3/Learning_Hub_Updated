import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student', section:'', semester:'', rollNumber:'' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data);
      toast.success('Account created!');
      navigate(data.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Create account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input placeholder="Full name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"/>
          <input type="email" placeholder="College email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"/>
          <input type="password" placeholder="Password (min 6 chars)" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"/>
          <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400">
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          {form.role === 'student' && <>
            <input placeholder="Roll number" required value={form.rollNumber} onChange={e=>setForm({...form,rollNumber:e.target.value})} className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"/>
            <input placeholder="Section (e.g. CSE-B)" value={form.section} onChange={e=>setForm({...form,section:e.target.value})} className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"/>
            <input type="number" placeholder="Semester (1-8)" value={form.semester} onChange={e=>setForm({...form,semester:e.target.value})} className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"/>
          </>}
          <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">Have an account? <Link to="/login" className="text-blue-600 font-medium">Sign in</Link></p>
      </div>
    </div>
  );
}
