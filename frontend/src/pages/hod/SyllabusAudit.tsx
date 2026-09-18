import { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Filter } from 'lucide-react';
import { Badge, Card, Skeleton } from '../../components/ui';
import { useSyllabusAudit } from '../../lib/queries';

export default function SyllabusAudit() {
  const { data: auditList, isLoading, error } = useSyllabusAudit();
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'BEHIND' | 'ON_TRACK' | 'AHEAD'>('ALL');

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !auditList) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
        <p className="font-semibold">Unable to load syllabus audit report.</p>
        <p className="text-sm mt-1">Please ensure the backend is running and you have HOD privileges.</p>
      </div>
    );
  }

  // Calculate statistics
  const totalCourses = auditList.length;
  const avgCompletion =
    totalCourses === 0
      ? 0
      : Math.round(
          auditList.reduce((acc, curr) => acc + curr.percentComplete, 0) / totalCourses
        );

  const behindCourses = auditList.filter((c) => c.percentComplete < 40);
  const onTrackCourses = auditList.filter(
    (c) => c.percentComplete >= 40 && c.percentComplete < 75
  );
  const aheadCourses = auditList.filter((c) => c.percentComplete >= 75);

  const filtered = auditList.filter((c) => {
    if (filterStatus === 'BEHIND') return c.percentComplete < 40;
    if (filterStatus === 'ON_TRACK') return c.percentComplete >= 40 && c.percentComplete < 75;
    if (filterStatus === 'AHEAD') return c.percentComplete >= 75;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Curriculum Audit
          </span>
          <span className="text-xs text-slate-400">Syllabus Pacing & Coverage</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Academic Syllabus Completion Audit
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor module completion rates across departmental courses to ensure compliance with university deadlines.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Overall Dept Completion</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{avgCompletion}%</p>
          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-white/10">
            <div
              className="h-full bg-brand-500 rounded-full transition-all"
              style={{ width: `${avgCompletion}%` }}
            />
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Behind Pace (&lt;40%)</p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {behindCourses.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Require academic review</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">On Track (40% - 75%)</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {onTrackCourses.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Meeting current milestones</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Ahead of Pace (&gt;75%)</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {aheadCourses.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Near or fully finished</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400 mr-1" />
        <span className="text-xs text-slate-400 font-medium mr-2">Filter Status:</span>
        {(['ALL', 'BEHIND', 'ON_TRACK', 'AHEAD'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              filterStatus === status
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
            }`}
          >
            {status === 'ALL'
              ? `All (${totalCourses})`
              : status === 'BEHIND'
              ? `Behind (${behindCourses.length})`
              : status === 'ON_TRACK'
              ? `On Track (${onTrackCourses.length})`
              : `Ahead (${aheadCourses.length})`}
          </button>
        ))}
      </div>

      {/* Courses Audit Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Course Code</th>
                <th className="px-6 py-3.5 font-semibold">Course Name</th>
                <th className="px-6 py-3.5 font-semibold">Class Section</th>
                <th className="px-6 py-3.5 font-semibold">Units Completed</th>
                <th className="px-6 py-3.5 font-semibold">Coverage Status</th>
                <th className="px-6 py-3.5 font-semibold">Progress Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map((item) => {
                const isBehind = item.percentComplete < 40;
                const isAhead = item.percentComplete >= 75;

                return (
                  <tr
                    key={`${item.subjectId}-${item.classId}`}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {item.subjectCode}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                      {item.subjectName}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone="violet">{item.className}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">{item.topicsDone}</span>
                      <span className="text-slate-400"> / {item.topicsTotal} topics</span>
                    </td>
                    <td className="px-6 py-4">
                      {isBehind ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Behind Schedule
                        </span>
                      ) : isAhead ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Ahead of Target
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          <Clock className="h-3.5 w-3.5" />
                          On Schedule
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden dark:bg-white/10">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isBehind ? 'bg-rose-500' : isAhead ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(item.percentComplete, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {item.percentComplete}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
