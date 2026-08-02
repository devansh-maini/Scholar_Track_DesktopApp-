/** Comprehensive attendance tracking with 75% shortfall advisory. */
import { CalendarCheck, CircleCheck, TriangleAlert } from 'lucide-react';
import { AttendanceBars, Ring, pctColor } from '../../components/charts';
import { Async, Badge, Card, CardHeader, EmptyState, PageHeader, Progress, Skeleton, attendanceTone } from '../../components/ui';
import { pct } from '../../lib/format';
import { useAttendance } from '../../lib/queries';

export default function Attendance() {
  const q = useAttendance();
  return (
    <div>
      <PageHeader title="Attendance" subtitle="Your attendance record, subject by subject. The minimum requirement is 75%." />
      <Async query={q} skeleton={<div className="grid gap-6 lg:grid-cols-3"><Skeleton className="h-64" /><Skeleton className="h-64 lg:col-span-2" /></div>}>
        {(a) => a.total === 0 ? <EmptyState icon={CalendarCheck} title="No attendance recorded yet" text="Once your teachers mark attendance it will show up here instantly." /> : (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="flex flex-col items-center justify-center text-center">
                <Ring value={a.percent} size={160} stroke={14} color={pctColor(a.percent)}>
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">{pct(a.percent, 0)}</span>
                  <span className="text-xs text-slate-500">overall</span>
                </Ring>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{a.attended} attended of {a.total} classes</p>
                {a.lowAttendance
                  ? <Badge tone="red" className="mt-3"><TriangleAlert className="h-3.5 w-3.5" /> Below 75%</Badge>
                  : <Badge tone="green" className="mt-3"><CircleCheck className="h-3.5 w-3.5" /> Meeting the requirement</Badge>}
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader title="Subject comparison" />
                <AttendanceBars data={a.subjects.map((s) => ({ name: s.subjectCode, percent: s.percent }))} />
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {a.subjects.map((s) => (
                <Card key={s.subjectId} hover>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{s.subjectCode}</p>
                      <p className="truncate font-semibold text-slate-900 dark:text-white">{s.subjectName}</p>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: pctColor(s.percent) }}>{pct(s.percent, 0)}</span>
                  </div>
                  <Progress value={s.percent} tone={attendanceTone(s.percent)} className="mt-4" />
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">{s.attended}/{s.total} classes</span>
                    {s.classesNeededFor75 > 0
                      ? <Badge tone="amber">attend {s.classesNeededFor75} more for 75%</Badge>
                      : <Badge tone="green">on track</Badge>}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Async>
    </div>
  );
}
