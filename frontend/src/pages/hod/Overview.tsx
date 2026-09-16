import {
  AlertTriangle,
  Award,
  BookOpen,
  Building2,
  CalendarCheck,
  CheckCircle2,
  FileText,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Skeleton, Badge } from '../../components/ui';
import { useHodOverview } from '../../lib/queries';

export default function Overview() {
  const { data: overview, isLoading, error } = useHodOverview();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
        <p className="font-semibold">Unable to load department overview.</p>
        <p className="text-sm mt-1">Please verify your HOD authorization and try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              Department Administration
            </span>
            <span className="text-xs text-slate-400">Executive Dashboard</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Welcome, {overview.hodName}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time department performance indicators, teacher assignments, and academic tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/hod/circulars"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 transition"
          >
            <FileText className="h-4 w-4" />
            Issue Circular
          </Link>
          <Link
            to="/hod/at-risk"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-ink-800 dark:text-slate-200 dark:hover:bg-white/5 transition"
          >
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            At-Risk Radar
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Enrolled</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{overview.totalStudents}</p>
            <p className="text-[11px] text-slate-400">Across all classes</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="rounded-2xl bg-purple-500/10 p-3 text-purple-600 dark:text-purple-400">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Faculty Members</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{overview.totalTeachers}</p>
            <p className="text-[11px] text-slate-400">Assigned teachers</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">At-Risk Students</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{overview.atRiskStudents}</p>
            <p className="text-[11px] text-slate-400">Sub-75% attendance / fail</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Attendance</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{overview.avgAttendance}%</p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              <span>Above 75% target</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-600 dark:text-sky-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Marks Score</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{overview.avgMarks}%</p>
            <p className="text-[11px] text-slate-400">Continuous assessment</p>
          </div>
        </Card>
      </div>

      {/* Department Breakdown Table */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200/80 px-6 py-4 dark:border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Department Academic Performance Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparative metrics across academic branches
            </p>
          </div>
          <Badge tone="teal">{overview.departments.length} Departments</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Department</th>
                <th className="px-6 py-3.5 font-semibold">Code</th>
                <th className="px-6 py-3.5 font-semibold">Students</th>
                <th className="px-6 py-3.5 font-semibold">Faculty</th>
                <th className="px-6 py-3.5 font-semibold">At-Risk</th>
                <th className="px-6 py-3.5 font-semibold">Avg Attendance</th>
                <th className="px-6 py-3.5 font-semibold">Avg Marks</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {overview.departments.map((dept) => {
                const attIsHealthy = dept.avgAttendance >= 75;
                return (
                  <tr key={dept.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                        {dept.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {dept.totalStudents}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {dept.totalTeachers}
                    </td>
                    <td className="px-6 py-4">
                      {dept.atRiskStudents > 0 ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {dept.atRiskStudents} students
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          None
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            attIsHealthy ? 'text-emerald-600' : 'text-rose-600 font-bold'
                          }`}
                        >
                          {dept.avgAttendance}%
                        </span>
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden dark:bg-white/10">
                          <div
                            className={`h-full rounded-full ${
                              attIsHealthy ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(dept.avgAttendance, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {dept.avgMarks}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/hod/at-risk?dept=${dept.code}`}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
                      >
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/hod/allocations"
          className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-brand-500 hover:shadow-md dark:border-white/10 dark:bg-ink-800 transition"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-500/10 p-2.5 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Subject & Teacher Allocations</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage curriculum assignments across class sections.
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/hod/syllabus-audit"
          className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-brand-500 hover:shadow-md dark:border-white/10 dark:bg-ink-800 transition"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Syllabus Completion Audit</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitor unit checklists and pace against academic calendar.
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/hod/grievances"
          className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-brand-500 hover:shadow-md dark:border-white/10 dark:bg-ink-800 transition"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Student Grievances Review</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit and escalate student complaints and issues.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
