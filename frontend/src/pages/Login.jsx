import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/auth.api';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data);
      toast.success('Welcome back, ' + data.name + '!');
      navigate(data.role === 'teacher' ? '/teacher/dashboard' : data.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-1">Sign in</h1>
        <p className="text-gray-500 text-sm mb-6">Welcome back to Learning Hub</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" placeholder="College email" required value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          <input type="password" placeholder="Password" required value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">New here? <Link to="/register" className="text-blue-600 font-medium">Create account</Link></p>
      </div>
    </div>
  );
}
