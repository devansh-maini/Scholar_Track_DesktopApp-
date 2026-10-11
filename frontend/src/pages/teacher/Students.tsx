import { CalendarCheck, Mail, Search, Trophy, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Async, Badge, Button, Card, CardHeader, EmptyState, PageHeader } from '../../components/ui';
import { initials } from '../../lib/format';
import { useClassStudents, useTeacherAssignments } from '../../lib/queries';

export default function TeacherStudents() {
  const [params, setSearchParams] = useSearchParams();
  const assignmentsQ = useTeacherAssignments();

  const assignments = assignmentsQ.data ?? [];
  const uniqueClasses = useMemo(() => {
    const map = new Map<number, string>();
    assignments.forEach((a) => map.set(a.classId, a.className));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [assignments]);

  const defaultClass = uniqueClasses[0];
  const selectedClassId = params.get('classId') ? Number(params.get('classId')) : defaultClass?.id;
  const currentClassName = uniqueClasses.find((c) => c.id === selectedClassId)?.name ?? 'Class';

  const studentsQ = useClassStudents(selectedClassId);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const list = studentsQ.data ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (s) => s.fullName.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [studentsQ.data, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Students & Class Roster"
        subtitle="View enrolled students, academic credentials, and contact details across your assigned cohorts."
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/attendance?classId=${selectedClassId}`}>
              <Button variant="secondary" icon={CalendarCheck} size="sm">
                Attendance
              </Button>
            </Link>
            <Link to={`/marks?classId=${selectedClassId}`}>
              <Button variant="secondary" icon={Trophy} size="sm">
                Marks
              </Button>
            </Link>
          </div>
        }
      />

      {/* Class Selector and Search Filter */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-48">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Select Class Cohort
              </label>
              <select
                className="input py-2 text-sm"
                value={selectedClassId ?? ''}
                onChange={(e) => setSearchParams({ classId: e.target.value })}
              >
                {uniqueClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-64">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search Students
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name, roll no, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-9 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-900 dark:text-white">{filtered.length}</span> students in {currentClassName}
          </div>
        </div>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader
          title={`Enrolled Students — ${currentClassName}`}
          subtitle="Registered student records with roll numbers and contact emails"
        />

        <Async query={studentsQ}>
          {() =>
            filtered.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No students match criteria"
                text={search ? 'No students found matching your search query.' : 'No students found in this class cohort.'}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start gap-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/[0.08]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-sky-600 text-sm font-bold text-white shadow-sm">
                      {initials(s.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                          {s.rollNo}
                        </span>
                        <Badge tone="slate" className="!px-1.5 !py-0 text-[10px]">
                          Sem {s.semesterNo}
                        </Badge>
                      </div>
                      <h4 className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {s.fullName}
                      </h4>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{s.email}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </Async>
      </Card>
    </div>
  );
}
