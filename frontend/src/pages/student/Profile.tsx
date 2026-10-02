import { Async, Badge, Card, CardHeader, PageHeader, Skeleton } from '../../components/ui';
import { initials } from '../../lib/format';
import { useMe, useRisk } from '../../lib/queries';
import { useAuth } from '../../state/auth';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-3 text-sm last:border-0 dark:border-white/5">
      <span className="text-slate-500">{label}</span><span className="font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

export default function Profile() {
  const me = useMe();
  const risk = useRisk();
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="Profile" subtitle="Your academic identity." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Async query={me} skeleton={<Skeleton className="h-64" />}>
            {(s) => (
              <>
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-sky-500 text-xl font-bold text-white">{initials(s.fullName)}</div>
                  <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">{s.fullName}</h2><p className="text-sm text-slate-500">{s.rollNo}</p></div>
                </div>
                <Row label="Username" value={user?.username ?? s.username} />
                <Row label="Email" value={s.email} />
                <Row label="Department" value={s.departmentCode} />
                <Row label="Class" value={s.className} />
                <Row label="Semester" value={String(s.semesterNo)} />
              </>
            )}
          </Async>
        </Card>
        <Card>
          <CardHeader title="Academic standing" />
          <Async query={risk} skeleton={<Skeleton className="h-32" />}>
            {(r) => (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between"><span className="text-slate-500">Risk level</span><Badge tone={r.risk.level === 'LOW' ? 'green' : r.risk.level === 'MEDIUM' ? 'amber' : 'red'}>{r.risk.level} ({r.risk.score}/100)</Badge></div>
                {r.previousCgpa !== null && <div className="flex justify-between"><span className="text-slate-500">Previous CGPA</span><span className="font-medium text-slate-900 dark:text-white">{r.previousCgpa.toFixed(2)}</span></div>}
                {r.sgpaTrend !== null && <div className="flex justify-between"><span className="text-slate-500">SGPA vs last semester</span><span className={`font-medium ${r.sgpaTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{r.sgpaTrend >= 0 ? '+' : ''}{r.sgpaTrend.toFixed(2)}</span></div>}
              </div>
            )}
          </Async>
        </Card>
      </div>
    </div>
  );
}
