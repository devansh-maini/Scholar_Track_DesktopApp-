import { useQueries } from '@tanstack/react-query';
import { AlertTriangle, BookOpen, CalendarCheck, ClipboardList, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AttendanceBars } from '../../components/charts';
import { RiskBadge, Td, TableWrap, Th } from '../../components/common';
import { Async, Badge, Card, CardHeader, EmptyState, PageHeader, Skeleton, Stat, attendanceTone } from '../../components/ui';
import { api } from '../../lib/api';
import { fmtDateTime, firstName, greeting, pct } from '../../lib/format';
import { T, useStaffComplaints, useTeacherCoursework, useTeacherMe, useTeaching } from '../../lib/staff';
import type { StudentRow } from '../../lib/types';

export default function TeacherDashboard() {
  const me = useTeacherMe();
  const teaching = useTeaching();
  const coursework = useTeacherCoursework();
  const complaints = useStaffComplaints();

  const classIds = [...new Set((teaching.data ?? []).map((t) => t.classId))];
  const perf = useQueries({
    queries: classIds.map((id) => ({ queryKey: [T, 'performance', id], queryFn: () => api.get<StudentRow[]>(`/teachers/me/classes/${id}/performance`) })),
  });
  const perfLoading = perf.some((p) => p.isPending);
  const rows: StudentRow[] = perf.flatMap((p) => p.data ?? []);
  const unique = new Map(rows.map((r) => [r.studentId, r]));
  const students = [...unique.values()];
  const avgAtt = students.length ? students.reduce((a, s) => a + s.attendancePct, 0) / students.length : 0;
  const atRisk = students.filter((s) => s.riskLevel === 'HIGH').sort((a, b) => b.riskScore - a.riskScore);
  const classBars = classIds.map((id, i) => {
    const list = perf[i]?.data ?? [];
    const name = teaching.data?.find((t) => t.classId === id)?.className ?? `Class ${id}`;
    return { name, percent: list.length ? Math.round((list.reduce((a, s) => a + s.attendancePct, 0) / list.length) * 10) / 10 : 0 };
  });
  const openComplaints = (complaints.data ?? []).filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;

  return (
    <div>
      <PageHeader title={`${greeting()}, ${me.data ? firstName(me.data.fullName) : 'teacher'}`} subtitle="Your classes at a glance. Every number comes from the records you and your students save." />
      <Async query={teaching} skeleton={<Skeleton className="h-64 w-full" />}>
        {(list) => list.length === 0 ? (
          <EmptyState icon={BookOpen} title="No classes assigned yet" text="The HOD has not assigned you a subject and class. Once they do, your dashboard fills up." />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat label="Classes" value={classIds.length} hint={`${list.length} subject${list.length === 1 ? '' : 's'} taught`} icon={BookOpen} tone="violet" />
              <Stat label="Students" value={perfLoading ? '…' : students.length} hint="Across your classes" icon={Users} tone="blue" />
              <Stat label="Average attendance" value={perfLoading ? '…' : pct(avgAtt)} hint={avgAtt >= 75 ? 'Above the 75% rule' : 'Below the 75% rule'} icon={CalendarCheck} tone={perfLoading ? 'slate' : attendanceTone(avgAtt)} />
              <Stat label="High-risk students" value={perfLoading ? '…' : atRisk.length} hint={`${openComplaints} open complaint${openComplaints === 1 ? '' : 's'} assigned`} icon={AlertTriangle} tone={atRisk.length ? 'red' : 'green'} />
            </div>

            <div className="grid gap-6 xl:grid-cols-5">
              <Card className="xl:col-span-3">
                <CardHeader title="Average attendance by class" subtitle="The dashed line is the 75% minimum." />
                {perfLoading ? <Skeleton className="h-56 w-full" /> : <AttendanceBars data={classBars} />}
              </Card>
              <Card className="xl:col-span-2">
                <CardHeader title="Your teaching load" />
                <ul className="space-y-2.5">
                  {list.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 dark:bg-white/5">
                      <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900 dark:text-white">{t.subjectCode} · {t.subjectName}</p><p className="text-xs text-slate-500">{t.className}</p></div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader title="Students needing attention" subtitle="Highest risk score first. Rules, not machine learning: attendance, marks, assignments and CGPA." action={<Link to="/performance" className="text-xs font-medium text-brand-600 hover:underline">All students</Link>} />
                {perfLoading ? <Skeleton className="h-32 w-full" /> : atRisk.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No high-risk students right now.</p> : (
                  <TableWrap><thead><tr><Th>Student</Th><Th>Class</Th><Th right>Attendance</Th><Th right>Risk</Th></tr></thead>
                    <tbody>{atRisk.slice(0, 7).map((s) => (
                      <tr key={s.studentId}><Td><p className="font-medium">{s.name}</p><p className="text-xs text-slate-500">{s.rollNo}</p></Td><Td>{s.className}</Td>
                        <Td right><Badge tone={attendanceTone(s.attendancePct)}>{pct(s.attendancePct)}</Badge></Td><Td right><RiskBadge level={s.riskLevel} score={s.riskScore} /></Td></tr>
                    ))}</tbody></TableWrap>
                )}
              </Card>
              <Card>
                <CardHeader title="Recent assignments" action={<Link to="/assignments" className="text-xs font-medium text-brand-600 hover:underline">Manage</Link>} />
                <Async query={coursework} skeleton={<Skeleton className="h-32 w-full" />}>
                  {(cw) => cw.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">You have not created an assignment yet.</p> : (
                    <ul className="space-y-2.5">
                      {cw.slice(0, 6).map((c) => (
                        <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3.5 py-2.5 dark:border-white/5">
                          <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900 dark:text-white">{c.title}</p><p className="text-xs text-slate-500">{c.subjectCode} · {c.className} · due {fmtDateTime(c.deadline)}</p></div>
                          <Badge tone={c.submissionCount > 0 ? 'blue' : 'slate'}><ClipboardList className="h-3 w-3" />{c.submissionCount}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </Async>
              </Card>
            </div>
          </div>
        )}
      </Async>
    </div>
  );
}
