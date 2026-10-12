import { ArrowRight, CalendarCheck, ClipboardList, GraduationCap, ShieldAlert, TrendingUp, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AttendanceBars, Ring, SgpaTrend, levelColor } from '../../components/charts';
import { Async, Badge, Card, CardHeader, EmptyState, Skeleton, Stat, attendanceTone } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { dueText, fmtDate, firstName, greeting, money, num, pct } from '../../lib/format';
import { useAttendance, useCoursework, useFees, useMe, useNotices, useResults, useRisk } from '../../lib/queries';
import type { Priority } from '../../lib/types';

const priorityTone: Record<Priority, Tone> = { NORMAL: 'slate', IMPORTANT: 'amber', URGENT: 'red' };

export default function Dashboard() {
  const me = useMe();
  const att = useAttendance();
  const res = useResults();
  const risk = useRisk();
  const cw = useCoursework();
  const fees = useFees();
  const notices = useNotices();

  return (
    <div className="space-y-6">
      <Async query={me} skeleton={<Skeleton className="h-20 w-full" />}>
        {(s) => (
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{greeting()}, {firstName(s.fullName)} 👋</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">{s.rollNo} · {s.className} · Semester {s.semesterNo} · {s.departmentCode}</p>
          </div>
        )}
      </Async>

      <Async query={att} skeleton={null}>
        {(a) => {
          if (!a.lowAttendance) return null;
          const worst = [...a.subjects].sort((x, y) => y.classesNeededFor75 - x.classesNeededFor75)[0];
          return (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="flex-1 text-sm text-amber-900 dark:text-amber-200">
                <p className="font-semibold">Low attendance warning: you are at {pct(a.percent)}, below the 75% requirement.</p>
                {worst && worst.classesNeededFor75 > 0 && <p className="mt-0.5">Most urgent: {worst.subjectCode} {worst.subjectName}. Attend the next {worst.classesNeededFor75} classes to reach 75%.</p>}
              </div>
              <Link to="/attendance" className="text-sm font-medium text-amber-800 underline dark:text-amber-300">Details</Link>
            </div>
          );
        }}
      </Async>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <Async query={res} skeleton={<><Skeleton className="h-28" /><Skeleton className="h-28" /></>}>
          {(r) => (<>
            <Stat label="SGPA" value={num(r.sgpa)} hint={`Semester ${r.semesterNo}`} icon={GraduationCap} tone="teal" />
            <Stat label="CGPA" value={num(r.cgpa)} hint="All semesters" icon={TrendingUp} tone="violet" />
          </>)}
        </Async>
        <Async query={att} skeleton={<Skeleton className="h-28" />}>
          {(a) => <Stat label="Attendance" value={pct(a.percent)} hint={`${a.attended} of ${a.total} classes`} icon={CalendarCheck} tone={attendanceTone(a.percent)} />}
        </Async>
        <Async query={cw} skeleton={<Skeleton className="h-28" />}>
          {(list) => {
            const pending = list.filter((c) => c.status === 'PENDING').length;
            return <Stat label="Pending work" value={pending} hint="assignments to submit" icon={ClipboardList} tone={pending > 0 ? 'amber' : 'green'} />;
          }}
        </Async>
        <Async query={fees} skeleton={<Skeleton className="h-28" />}>
          {(f) => <Stat label="Fees due" value={money(f.totalOutstanding)} hint={f.totalOutstanding > 0 ? 'outstanding' : 'all clear'} icon={Wallet} tone={f.totalOutstanding > 0 ? 'red' : 'green'} />}
        </Async>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader title="Academic risk indicator" subtitle="Rule-based, not machine learning" />
          <Async query={risk} skeleton={<Skeleton className="h-52" />}>
            {(r) => (
              <div className="flex flex-col items-center">
                <Ring value={r.risk.score} size={132} stroke={12} color={levelColor(r.risk.level)}>
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{r.risk.score}</span>
                  <span className="text-[11px] text-slate-500">out of 100</span>
                </Ring>
                <Badge tone={r.risk.level === 'LOW' ? 'green' : r.risk.level === 'MEDIUM' ? 'amber' : 'red'} className="mt-3">{r.risk.level} RISK</Badge>
                <ul className="mt-4 w-full space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                  {r.risk.reasons.length === 0 && <li className="text-center text-emerald-600">You are on track. Keep it up!</li>}
                  {r.risk.reasons.map((x) => <li key={x} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />{x}</li>)}
                </ul>
              </div>
            )}
          </Async>
        </Card>

        <Card>
          <CardHeader title="Attendance by subject" subtitle="Dashed line marks the 75% requirement" />
          <Async query={att} skeleton={<Skeleton className="h-56" />}>
            {(a) => <AttendanceBars data={a.subjects.map((s) => ({ name: s.subjectCode, percent: s.percent }))} />}
          </Async>
        </Card>

        <Card>
          <CardHeader title="SGPA trend" subtitle="Semester by semester" />
          <Async query={res} skeleton={<Skeleton className="h-56" />}>
            {(r) => <SgpaTrend data={[...r.previous.map((p) => ({ label: `Sem ${p.semesterNo}`, sgpa: p.sgpa })), ...(r.sgpa > 0 ? [{ label: `Sem ${r.semesterNo}`, sgpa: r.sgpa }] : [])]} />}
          </Async>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Upcoming assignments" action={<Link to="/assignments" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">All <ArrowRight className="h-4 w-4" /></Link>} />
          <Async query={cw} skeleton={<Skeleton className="h-40" />}>
            {(list) => {
              const todo = list.filter((c) => c.status === 'PENDING').sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 4);
              if (todo.length === 0) return <EmptyState title="Nothing pending" text="You have submitted everything. Nice work." />;
              return (
                <ul className="divide-y divide-slate-100 dark:divide-white/5">
                  {todo.map((c) => {
                    const d = dueText(c.deadline);
                    return (
                      <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800 dark:text-slate-100">{c.title} <span className="text-slate-400">· {c.subjectCode}</span></p>
                          <p className="text-xs text-slate-500">{fmtDate(c.deadline)} · max {c.maxMarks} marks</p>
                        </div>
                        <Badge tone={d.overdue ? 'red' : d.soon ? 'amber' : 'blue'}>{d.text}</Badge>
                      </li>
                    );
                  })}
                </ul>
              );
            }}
          </Async>
        </Card>

        <Card>
          <CardHeader title="Recent notices" action={<Link to="/notices" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">All <ArrowRight className="h-4 w-4" /></Link>} />
          <Async query={notices} skeleton={<Skeleton className="h-40" />}>
            {(list) => list.length === 0 ? <EmptyState title="No notices" text="New announcements will appear here." /> : (
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                {list.slice(0, 4).map((n) => (
                  <li key={n.id} className="py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-medium text-slate-800 dark:text-slate-100">{n.title}</p>
                      <Badge tone={priorityTone[n.priority]}>{n.priority}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{n.authorName} · {fmtDate(n.createdAt)} · {n.targetLabel}</p>
                  </li>
                ))}
              </ul>
            )}
          </Async>
        </Card>
      </div>
    </div>
  );
}
