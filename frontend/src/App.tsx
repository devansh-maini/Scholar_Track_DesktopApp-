import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Skeleton } from './components/ui';
import ComingSoon from './pages/ComingSoon';
import Login from './pages/Login';
import Settings from './pages/Settings';
import AiAssistant from './pages/ai/AiAssistant';
import AtRiskStudents from './pages/hod/AtRiskStudents';
import Circulars from './pages/hod/Circulars';
import Grievances from './pages/hod/Grievances';
import Overview from './pages/hod/Overview';
import SyllabusAudit from './pages/hod/SyllabusAudit';
import TeacherAllocations from './pages/hod/TeacherAllocations';
import Assignments from './pages/student/Assignments';
import Attendance from './pages/student/Attendance';
import Complaints from './pages/student/Complaints';
import Dashboard from './pages/student/Dashboard';
import Fees from './pages/student/Fees';
import Marks from './pages/student/Marks';
import Notices from './pages/student/Notices';
import Profile from './pages/student/Profile';
import Syllabus from './pages/student/Syllabus';
import { useAuth } from './state/auth';

export default function App() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-10 w-64" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // HOD Portal
  if (user.role === 'HOD') {
    return (
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/hod/overview" element={<Overview />} />
          <Route path="/hod/allocations" element={<TeacherAllocations />} />
          <Route path="/hod/syllabus-audit" element={<SyllabusAudit />} />
          <Route path="/hod/circulars" element={<Circulars />} />
          <Route path="/hod/grievances" element={<Grievances />} />
          <Route path="/hod/at-risk" element={<AtRiskStudents />} />
          <Route path="/ai/assistant" element={<AiAssistant />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/hod/overview" replace />} />
      </Routes>
    );
  }

  // Student Portal
  if (user.role === 'STUDENT') {
    return (
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/marks" element={<Marks />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/ai/assistant" element={<AiAssistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  // Teacher portal coming soon
  return (
    <Routes>
      <Route path="*" element={<ComingSoon />} />
    </Routes>
  );
}
