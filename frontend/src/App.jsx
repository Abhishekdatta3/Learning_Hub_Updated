import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login            from './pages/Login';
import Register         from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import MyAttendance     from './pages/student/MyAttendance';
import Notes            from './pages/student/Notes';
import BookSession      from './pages/student/BookSession';
import Marketplace      from './pages/student/Marketplace';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MarkAttendance   from './pages/teacher/MarkAttendance';
import UploadNotes      from './pages/teacher/UploadNotes';
import ManageSlots      from './pages/teacher/ManageSlots';
import TeacherProfile   from './pages/teacher/TeacherProfile';
import AdminDashboard   from './pages/admin/AdminDashboard';
import ProtectedRoute   from './components/common/ProtectedRoute';
import DashboardLayout  from './components/layout/DashboardLayout';

export default function App() {
  const { user } = useAuth();
  const home = user?.role === 'teacher' ? '/teacher/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/"         element={<Navigate to={user ? home : '/login'} replace />} />

      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard"   element={<StudentDashboard />} />
          <Route path="/student/attendance"  element={<MyAttendance />} />
          <Route path="/student/notes"       element={<Notes />} />
          <Route path="/student/sessions"    element={<BookSession />} />
          <Route path="/student/marketplace" element={<Marketplace />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/teacher/dashboard"  element={<TeacherDashboard />} />
          <Route path="/teacher/attendance" element={<MarkAttendance />} />
          <Route path="/teacher/notes"      element={<UploadNotes />} />
          <Route path="/teacher/slots"      element={<ManageSlots />} />
          <Route path="/teacher/profile"    element={<TeacherProfile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}
