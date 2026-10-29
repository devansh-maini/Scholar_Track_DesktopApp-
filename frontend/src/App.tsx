import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { hodNav, teacherNav } from './components/nav';
import { Skeleton } from './components/ui';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Academics from './pages/hod/Academics';
import Analytics from './pages/hod/Analytics';
import Faculty from './pages/hod/Faculty';
import HodDashboard from './pages/hod/Dashboard';
import HodFees from './pages/hod/Fees';
import Risk from './pages/hod/Risk';
import Students from './pages/hod/Students';
import SyllabusProgress from './pages/hod/SyllabusProgress';
import ComplaintsManage from './pages/shared/Complaints';
import Notices from './pages/shared/Notices';
import StaffReports from './pages/shared/Reports';
import AiAssistant from './pages/student/AiAssistant';
import Assignments from './pages/student/Assignments';
import Attendance from './pages/student/Attendance';
import Complaints from './pages/student/Complaints';
import Dashboard from './pages/student/Dashboard';
import Fees from './pages/student/Fees';
import Marks from './pages/student/Marks';
import StudentNotices from './pages/student/Notices';
import Profile from './pages/student/Profile';
import Reports from './pages/student/Reports';
import Syllabus from './pages/student/Syllabus';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherMarks from './pages/teacher/Marks';
import TeacherPerformance from './pages/teacher/Performance';
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

  if (user.role === 'TEACHER') {
    return (
      <Routes>
        <Route element={<AppShell nav={teacherNav} />}>
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/attendance" element={<TeacherAttendance />} />
          <Route path="/marks" element={<TeacherMarks />} />
          <Route path="/assignments" element={<TeacherAssignments />} />
          <Route path="/syllabus" element={<TeacherSyllabus />} />
          <Route path="/performance" element={<TeacherPerformance />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/complaints" element={<ComplaintsManage />} />
          <Route path="/ai" element={<AiAssistant />} />
          <Route path="/reports" element={<StaffReports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  if (user.role === 'HOD') {
    return (
      <Routes>
        <Route element={<AppShell nav={hodNav} />}>
          <Route path="/dashboard" element={<HodDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/risk" element={<Risk />} />
          <Route path="/students" element={<Students />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/fees" element={<HodFees />} />
          <Route path="/syllabus" element={<SyllabusProgress />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/complaints" element={<ComplaintsManage />} />
          <Route path="/ai" element={<AiAssistant />} />
          <Route path="/reports" element={<StaffReports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/marks" element={<Marks />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/fees" element={<Fees />} />
        <Route path="/notices" element={<StudentNotices />} />
        <Route path="/syllabus" element={<Syllabus />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/ai" element={<AiAssistant />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
