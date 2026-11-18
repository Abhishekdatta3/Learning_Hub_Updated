import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyAttendance } from '../../api/attendance.api';
import Loader from '../../components/common/Loader';

export default function StudentDashboard() {
  const { user }     = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    getMyAttendance()
      .then(a => setAttendance(a.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  const atRisk  = attendance.filter(a => parseFloat(a.percentage) < 75);
  const allGood = attendance.filter(a => parseFloat(a.percentage) >= 75);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Here is your academic overview</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          ['Subjects',  attendance.length, 'text-gray-900'],
          ['At Risk',   atRisk.length,     atRisk.length > 0 ? 'text-red-600' : 'text-green-600'],
          ['On Track',  allGood.length,    'text-green-600'],
        ].map(([label, val, cls]) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={'text-3xl font-bold mt-1 ' + cls}>{val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold mb-4">Attendance Summary</h2>
        <div className="space-y-3">
          {attendance.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.subject?.name}</span>
                <span className={parseFloat(item.percentage) < 75 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>{item.percentage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={'h-2 rounded-full ' + (parseFloat(item.percentage) < 75 ? 'bg-red-500' : 'bg-green-500')} style={{ width: item.percentage + '%' }} />
              </div>
            </div>
          ))}
          {attendance.length === 0 && <p className="text-gray-400 text-sm">No attendance records yet.</p>}
        </div>
      </div>
    </div>
  );
}
