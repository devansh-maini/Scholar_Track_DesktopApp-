import {
  ArrowRight, BookOpen, CalendarCheck, CheckCircle2, ClipboardList,
  ListChecks, Megaphone, Plus, Trophy, Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Async, Badge, Button, Card, CardHeader, EmptyState, Skeleton, Stat } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { fmtDate, greeting } from '../../lib/format';
import { useNotices, useTeacherAssignments, useTeacherCoursework, useTeacherMe } from '../../lib/queries';
import type { Priority } from '../../lib/types';

const priorityTone: Record<Priority, Tone> = { NORMAL: 'slate', IMPORTANT: 'amber', URGENT: 'red' };

export default function TeacherDashboard() {
  const me = useTeacherMe();
  const assignments = useTeacherAssignments();
  const coursework = useTeacherCoursework();
  const notices = useNotices();

  return (
    <div className="space-y-7">
      {/* Teacher Profile Banner */}
      <Async query={me} skeleton={<Skeleton className="h-20 w-full" />}>
        {(t) => (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {greeting()}, {t.fullName} 👋
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Employee Code: <span className="font-semibold text-slate-700 dark:text-slate-200">{t.employeeCode}</span> · Department:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{t.departmentCode}</span> · Faculty Dashboard
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/attendance">
                <Button variant="secondary" icon={CalendarCheck} size="sm">Attendance</Button>
              </Link>
              <Link to="/marks">
                <Button variant="secondary" icon={Trophy} size="sm">Enter Marks</Button>
              </Link>
              <Link to="/assignments">
                <Button variant="primary" icon={Plus} size="sm">Create Assignment</Button>
              </Link>
            </div>
          </div>
        )}
      </Async>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Async query={assignments} skeleton={<><Skeleton className="h-28" /><Skeleton className="h-28" /></>}>
          {(list) => {
            const uniqueSubjects = new Set(list.map((a) => a.subjectId)).size;
            const uniqueClasses = new Set(list.map((a) => a.classId)).size;
            return (
              <>
                <Stat
                  label="Teaching Subjects"
                  value={uniqueSubjects}
                  hint={`${list.length} total assignment mappings`}
                  icon={BookOpen}
                  tone="teal"
                />
                <Stat
                  label="Assigned Classes"
                  value={uniqueClasses}
                  hint="Active lecture cohorts"
                  icon={Users}
                  tone="violet"
                />
              </>
            );
          }}
        </Async>

        <Async query={coursework} skeleton={<><Skeleton className="h-28" /><Skeleton className="h-28" /></>}>
          {(cwList) => {
            const totalSubmissions = cwList.reduce((acc, c) => acc + c.submissionCount, 0);
            return (
              <>
                <Stat
                  label="Coursework Posted"
                  value={cwList.length}
                  hint="Assignments active"
                  icon={ClipboardList}
                  tone="blue"
                />
                <Stat
                  label="Submissions Received"
                  value={totalSubmissions}
                  hint="Student submissions"
                  icon={CheckCircle2}
                  tone="amber"
                />
              </>
            );
          }}
        </Async>
      </div>

      {/* Assigned Classes and Teaching Cohorts */}
      <Card>
        <CardHeader
          title="My Teaching Allocations"
          subtitle="Classes and subjects currently mapped to your teaching profile for this semester"
          action={
            <Link to="/students" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
              View All Students <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <Async query={assignments}>
          {(list) =>
            list.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No classes assigned yet"
                text="The HOD has not yet assigned any classes or subjects to your faculty profile."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {list.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/60 p-4.5 transition hover:border-brand-500/40 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/[0.08]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-lg bg-brand-500/10 px-2.5 py-1 text-xs font-bold text-brand-600 dark:text-brand-400">
                          {a.className}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{a.subjectCode}</span>
                      </div>
                      <h4 className="mt-2.5 text-base font-semibold text-slate-900 dark:text-white leading-snug">
                        {a.subjectName}
                      </h4>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200/60 pt-3 dark:border-white/10">
                      <Link
                        to={`/attendance?classId=${a.classId}&subjectId=${a.subjectId}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        <CalendarCheck className="h-3.5 w-3.5" /> Attendance
                      </Link>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <Link
                        to={`/marks?classId=${a.classId}&subjectId=${a.subjectId}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      >
                        <Trophy className="h-3.5 w-3.5" /> Marks
                      </Link>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <Link
                        to={`/syllabus?classId=${a.classId}&subjectId=${a.subjectId}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      >
                        <ListChecks className="h-3.5 w-3.5" /> Syllabus
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </Async>
      </Card>

      {/* Two-Column Overview: Assignments & Notices */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Coursework Published */}
        <Card>
          <CardHeader
            title="Recent Coursework & Assignments"
            subtitle="Track submission counts and deadlines"
            action={
              <Link to="/assignments" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                Manage Coursework <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <Async query={coursework} skeleton={<Skeleton className="h-44" />}>
            {(cwList) =>
              cwList.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="No assignments posted yet"
                  text="Create coursework assignments so students can submit their solutions online."
                  action={
                    <Link to="/assignments">
                      <Button size="sm" icon={Plus}>Create First Assignment</Button>
                    </Link>
                  }
                />
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-white/5">
                  {cwList.slice(0, 5).map((cw) => (
                    <li key={cw.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                          {cw.title}
                          <span className="text-xs text-slate-400"> · {cw.className} ({cw.subjectCode})</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          Deadline: {fmtDate(cw.deadline)} · Max {cw.maxMarks} marks
                        </p>
                      </div>
                      <Link to={`/assignments`}>
                        <Badge tone={cw.submissionCount > 0 ? 'teal' : 'slate'}>
                          {cw.submissionCount} {cw.submissionCount === 1 ? 'submission' : 'submissions'}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            }
          </Async>
        </Card>

        {/* Notices & Circulars */}
        <Card>
          <CardHeader
            title="Institutional Notices & Circulars"
            subtitle="Official notifications from college departments"
            action={
              <Link to="/notices" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                All Notices <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <Async query={notices} skeleton={<Skeleton className="h-44" />}>
            {(noticeList) =>
              noticeList.length === 0 ? (
                <EmptyState
                  icon={Megaphone}
                  title="No active circulars"
                  text="Notices posted by you or department leadership will show here."
                />
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-white/5">
                  {noticeList.slice(0, 5).map((n) => (
                    <li key={n.id} className="py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-medium text-slate-800 dark:text-slate-100">{n.title}</p>
                        <Badge tone={priorityTone[n.priority]}>{n.priority}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        By {n.authorName} ({n.authorRole}) · {fmtDate(n.createdAt)} · Target: {n.targetLabel}
                      </p>
                    </li>
                  ))}
                </ul>
              )
            }
          </Async>
        </Card>
      </div>
    </div>
  );
}
