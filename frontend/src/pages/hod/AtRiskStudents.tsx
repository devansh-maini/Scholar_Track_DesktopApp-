import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Badge, Card, Skeleton } from '../../components/ui';
import { useAtRiskStudents } from '../../lib/queries';

export default function AtRiskStudents() {
  const [searchParams] = useSearchParams();
  const initialDept = searchParams.get('dept') || '';

  const [selectedDept, setSelectedDept] = useState<string>(initialDept);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: students, isLoading, error } = useAtRiskStudents(selectedDept || undefined);

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

  if (error || !students) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
        <p className="font-semibold">Unable to load at-risk students data.</p>
        <p className="text-sm mt-1">Please ensure the backend service is operational.</p>
      </div>
    );
  }

  const filtered = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highRiskCount = students.filter((s) => s.riskLevel === 'HIGH').length;
  const mediumRiskCount = students.filter((s) => s.riskLevel === 'MEDIUM').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
            Academic Early Warning
          </span>
          <span className="text-xs text-slate-400">Explainable Risk Detection</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          At-Risk Student Identification & Diagnostic
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Algorithmic identification of students below statutory thresholds with explainable risk reasons.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">High Risk Students</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{highRiskCount}</p>
            <p className="text-[11px] text-slate-400">Multiple compounding factors</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Medium Risk Students</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{mediumRiskCount}</p>
            <p className="text-[11px] text-slate-400">Attendance or test score warning</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Explainable Criteria</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
              Attendance &lt; 75% | Marks &lt; 40%
            </p>
            <p className="text-[11px] text-slate-400">Deterministic transparent rules</p>
          </div>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll no, or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-ink-800 dark:text-white dark:placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium mr-1">Dept Filter:</span>
          {['', 'CSE', 'ECE', 'ME', 'CE'].map((code) => (
            <button
              key={code}
              onClick={() => setSelectedDept(code)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedDept === code
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
              }`}
            >
              {code || 'All Departments'}
            </button>
          ))}
        </div>
      </div>

      {/* Students Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((s) => (
          <Card key={s.studentId} className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {s.fullName}
                  </h3>
                  <Badge tone={s.riskLevel === 'HIGH' ? 'red' : 'amber'}>
                    {s.riskLevel} RISK
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="font-mono font-semibold">{s.rollNo}</span>
                  <span>&bull;</span>
                  <span>{s.department}</span>
                  <span>&bull;</span>
                  <span>{s.className}</span>
                </div>
              </div>
            </div>

            {/* Metrics pills */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl border border-slate-100 bg-slate-50/75 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                <p className="text-[11px] font-medium text-slate-400">Attendance Rate</p>
                <p
                  className={`text-lg font-bold mt-0.5 ${
                    s.attendancePct < 75 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800'
                  }`}
                >
                  {s.attendancePct}%
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Threshold: 75% minimum</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/75 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                <p className="text-[11px] font-medium text-slate-400">Continuous Assessment Marks</p>
                <p
                  className={`text-lg font-bold mt-0.5 ${
                    s.avgMarks < 40 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800'
                  }`}
                >
                  {s.avgMarks}%
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Pass benchmark: 40%</p>
              </div>
            </div>

            {/* Explainable reasons */}
            <div className="rounded-xl border border-amber-200/60 bg-amber-50/40 p-3.5 dark:border-amber-900/30 dark:bg-amber-950/20">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Explainable Risk Diagnostics:
              </p>
              <ul className="space-y-1">
                {s.reasons.map((reason, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-amber-900 dark:text-amber-200/90 flex items-start gap-1.5"
                  >
                    <span className="text-amber-500 font-bold">&bull;</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-white/10 dark:text-slate-400">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            <p className="font-semibold">No students currently flagged as at-risk.</p>
            <p className="text-xs mt-1">All enrolled students are above the 75% attendance and passing marks criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
