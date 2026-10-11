import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell, studentNav, teacherNav } from './components/AppShell';
import { Skeleton } from './components/ui';
import ComingSoon from './pages/ComingSoon';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Assignments from './pages/student/Assignments';
import Attendance from './pages/student/Attendance';
import Complaints from './pages/student/Complaints';
import Dashboard from './pages/student/Dashboard';
import Fees from './pages/student/Fees';
import Marks from './pages/student/Marks';
import Notices from './pages/student/Notices';
import Profile from './pages/student/Profile';
import Syllabus from './pages/student/Syllabus';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherMarks from './pages/teacher/Marks';
import TeacherNotices from './pages/teacher/Notices';
import TeacherProfile from './pages/teacher/Profile';
import TeacherStudents from './pages/teacher/Students';
import TeacherSyllabus from './pages/teacher/Syllabus';
import { useAuth } from './state/auth';

export default function App() {
  const { user, ready } = useAuth();

  if (!ready) {
    return <div className="flex h-screen items-center justify-center"><Skeleton className="h-10 w-64" /></div>;
  }
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Teacher portal
  if (user.role === 'TEACHER') {
    return (
      <Routes>
        <Route element={<AppShell nav={teacherNav} />}>
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/attendance" element={<TeacherAttendance />} />
          <Route path="/marks" element={<TeacherMarks />} />
          <Route path="/assignments" element={<TeacherAssignments />} />
          <Route path="/syllabus" element={<TeacherSyllabus />} />
          <Route path="/students" element={<TeacherStudents />} />
          <Route path="/notices" element={<TeacherNotices />} />
          <Route path="/profile" element={<TeacherProfile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  // Student portal
  if (user.role === 'STUDENT') {
    return (
      <Routes>
        <Route element={<AppShell nav={studentNav} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/marks" element={<Marks />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  // HOD and other unmapped roles
  return (
    <Routes>
      <Route path="*" element={<ComingSoon />} />
    </Routes>
  );
}

