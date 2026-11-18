import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const studentLinks = [
  { to: '/student/dashboard',    label: '🏠 Dashboard' },
  { to: '/student/attendance',   label: '📋 My Attendance' },
  { to: '/student/notes',        label: '📚 Notes' },
  { to: '/student/sessions',     label: '💬 Sessions & Teachers' },
  { to: '/student/marketplace',  label: '🏪 Marketplace' },
];
const teacherLinks = [
  { to: '/teacher/dashboard',   label: '🏠 Dashboard' },
  { to: '/teacher/profile',     label: '👤 My Profile' },
  { to: '/teacher/attendance',  label: '📋 Take Attendance' },
  { to: '/teacher/notes',       label: '📚 Upload Notes' },
  { to: '/teacher/slots',       label: '🗓 Manage Slots' },
];
const adminLinks = [{ to: '/admin/dashboard', label: '🏠 Dashboard' }];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === 'teacher' ? teacherLinks : user?.role === 'admin' ? adminLinks : studentLinks;
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col py-4">
      <div className="px-5 mb-6"><span className="text-xl font-bold text-blue-600">LearningHub</span></div>
      <nav className="flex flex-col gap-1 px-2">
        {links.map(link => (
          <NavLink key={link.to} to={link.to}
            className={({ isActive }) => 'px-3 py-2 rounded-lg text-sm font-medium ' + (isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50')}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
