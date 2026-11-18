import { useAuth } from '../../context/AuthContext';
export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-800">Learning Hub</h2>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user?.name}</span>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">{user?.role}</span>
        <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
      </div>
    </header>
  );
}
