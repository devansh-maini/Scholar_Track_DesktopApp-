import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CalendarCheck, GraduationCap, LifeBuoy, TrendingUp, UsersRound, Wallet, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TrendLine, ValueBars } from '../../components/charts';
import { Async, Card, CardHeader, PageHeader, Skeleton, Stat, attendanceTone } from '../../components/ui';
import { api } from '../../lib/api';
import { firstName, fmtDateTime, greeting, money, num, pct } from '../../lib/format';
import { H } from '../../lib/staff';
import type { AttendancePoint, HodDashboard, SemesterStat } from '../../lib/types';
import { useAuth } from '../../state/auth';

export default function HodDashboard() {
  const { user } = useAuth();
  const dash = useQuery({ queryKey: [H, 'dashboard'], queryFn: () => api.get<HodDashboard>('/hod/analytics/dashboard') });
  const sems = useQuery({ queryKey: [H, 'semesters'], queryFn: () => api.get<SemesterStat[]>('/hod/analytics/semesters') });
  const trend = useQuery({ queryKey: [H, 'trend'], queryFn: () => api.get<AttendancePoint[]>('/hod/analytics/attendance-trend') });

  return (
    <div>
      <PageHeader title={`${greeting()}, ${user ? firstName(user.fullName) : 'HOD'}`} subtitle="Department overview. Every figure is computed live from the saved academic records." />
      <Async query={dash} skeleton={<Skeleton className="h-72 w-full" />}>
        {(d) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat label="Students" value={d.totalStudents} hint={`${d.totalTeachers} teachers`} icon={GraduationCap} tone="blue" />
              <Stat label="Average CGPA" value={num(d.averageCgpa)} hint="Credit-weighted" icon={TrendingUp} tone="teal" />
              <Stat label="Average attendance" value={pct(d.averageAttendance)} hint={`${d.lowAttendanceCount} student${d.lowAttendanceCount === 1 ? '' : 's'} below 75%`} icon={CalendarCheck} tone={attendanceTone(d.averageAttendance)} />
              <Stat label="Assignment completion" value={pct(d.assignmentCompletionPct, 0)} hint="Submitted on all coursework" icon={ClipboardCheck} tone="violet" />
              <Stat label="High-risk students" value={d.highRiskCount} hint={`${d.mediumRiskCount} medium risk`} icon={AlertTriangle} tone={d.highRiskCount ? 'red' : 'green'} />
              <Stat label="Outstanding fees" value={money(Number(d.outstandingFees))} hint={`${d.overdueFeeCount} overdue`} icon={Wallet} tone={d.overdueFeeCount ? 'amber' : 'green'} />
              <Stat label="Open complaints" value={d.openComplaints} hint="Open or in progress" icon={LifeBuoy} tone={d.openComplaints ? 'amber' : 'green'} />
              <Stat label="Teachers" value={d.totalTeachers} hint="Active faculty" icon={UsersRound} tone="slate" />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader title="Average SGPA by semester" action={<Link to="/analytics" className="text-xs font-medium text-brand-600 hover:underline">Full analytics</Link>} />
                <Async query={sems} skeleton={<Skeleton className="h-56 w-full" />}>
                  {(s) => <ValueBars data={s.map((x) => ({ name: `Sem ${x.semesterNo}`, value: x.averageSgpa }))} max={10} unit="" label="Average SGPA" colorFn={(v) => (v >= 7 ? '#10a595' : v >= 5.5 ? '#f59e0b' : '#ef4444')} />}
                </Async>
              </Card>
              <Card>
                <CardHeader title="Daily attendance trend" subtitle="Share of students present each class day. Dashed line = 75%." />
                <Async query={trend} skeleton={<Skeleton className="h-56 w-full" />}>
                  {(t) => t.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">No attendance has been recorded yet.</p> : <TrendLine data={t.map((p) => ({ label: p.date.slice(5), value: p.percent }))} label="Present" />}
                </Async>
              </Card>
            </div>

            <Card>
              <CardHeader title="Recent activity" subtitle="The latest marks, attendance, submissions, fees and complaints across the department." />
              {d.recentActivity.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No activity yet.</p> : (
                <ul className="divide-y divide-slate-100 dark:divide-white/5">
                  {d.recentActivity.map((a, i) => (
                    <li key={i} className="flex items-center justify-between gap-4 py-2.5"><p className="text-sm text-slate-700 dark:text-slate-200">{a.text}</p><span className="shrink-0 text-xs text-slate-400">{fmtDateTime(a.at)}</span></li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}
      </Async>
    </div>
  );
}
