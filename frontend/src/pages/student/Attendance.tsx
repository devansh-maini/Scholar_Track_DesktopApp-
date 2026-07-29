import { CalendarCheck } from 'lucide-react';
import { Async, Card, EmptyState, PageHeader, Progress, Skeleton, attendanceTone } from '../../components/ui';
import { pct } from '../../lib/format';
import { useAttendance } from '../../lib/queries';

export default function Attendance() {
  const q = useAttendance();
  return (
    <div>
      <PageHeader title="Attendance" subtitle="Your attendance record, subject by subject." />
      <Async query={q} skeleton={<Skeleton className="h-64" />}>
        {(a) => a.total === 0 ? <EmptyState icon={CalendarCheck} title="No attendance recorded yet" text="Once teachers mark attendance it will show up here." /> : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {a.subjects.map((s) => (
              <Card key={s.subjectId}>
                <p className="text-xs font-semibold uppercase text-brand-600">{s.subjectCode}</p>
                <p className="font-semibold">{s.subjectName}</p>
                <Progress value={s.percent} tone={attendanceTone(s.percent)} className="mt-4" />
                <p className="mt-2 text-sm text-slate-500">{s.attended}/{s.total} classes ({pct(s.percent, 0)})</p>
              </Card>
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}
