import { useState } from 'react';
import { BookOpen, Mail, Search, UserCheck } from 'lucide-react';
import { Badge, Card, Skeleton } from '../../components/ui';
import { useTeacherAllocations } from '../../lib/queries';

export default function TeacherAllocations() {
  const { data: allocations, isLoading, error } = useTeacherAllocations();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !allocations) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
        <p className="font-semibold">Unable to load teacher allocations.</p>
        <p className="text-sm mt-1">Please ensure the backend is running and you have HOD privileges.</p>
      </div>
    );
  }

  const departments = ['ALL', ...Array.from(new Set(allocations.map((a) => a.departmentName)))];

  const filtered = allocations.filter((a) => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      a.allocations.some(
        (sub) =>
          sub.subjectName.toLowerCase().includes(search.toLowerCase()) ||
          sub.subjectCode.toLowerCase().includes(search.toLowerCase())
      );
    const matchesDept = selectedDept === 'ALL' || a.departmentName === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
            Faculty Directory
          </span>
          <span className="text-xs text-slate-400">Curriculum Assignments</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Teacher & Subject Allocations
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Faculty teaching workload, subject assignments, and class group distributions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by faculty, code, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-ink-800 dark:text-white dark:placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition shrink-0 ${
                selectedDept === dept
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Teachers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((teacher) => (
          <Card key={teacher.teacherId} className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-base font-bold text-white shadow-md shadow-brand-500/20">
                  {teacher.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{teacher.fullName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{teacher.departmentName}</span>
                    <span>&bull;</span>
                    <span className="font-mono">{teacher.employeeCode}</span>
                  </div>
                </div>
              </div>
              <Badge tone="violet">
                {teacher.allocations.length} {teacher.allocations.length === 1 ? 'Subject' : 'Subjects'}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5" />
              <span>{teacher.email}</span>
            </div>

            {/* Allocations breakdown */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Assigned Classes & Subjects
              </p>
              {teacher.allocations.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No teaching assignments allocated this term.</p>
              ) : (
                <div className="space-y-2">
                  {teacher.allocations.map((alloc) => (
                    <div
                      key={`${alloc.subjectId}-${alloc.classId}`}
                      className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs shadow-xs dark:bg-ink-800"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-brand-500" />
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {alloc.subjectName}
                          </span>
                          <span className="ml-1.5 font-mono text-[11px] text-slate-400">
                            ({alloc.subjectCode})
                          </span>
                        </div>
                      </div>
                      <Badge tone="teal" className="text-[11px]">
                        {alloc.className}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-white/10 dark:text-slate-400">
            <UserCheck className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="font-semibold">No teachers found matching criteria.</p>
            <p className="text-xs mt-1">Try resetting your search query or department filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
