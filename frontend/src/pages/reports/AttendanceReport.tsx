import { useState } from 'react';
import { ExportButton } from '../../components/reports/ExportButton';
import { Badge, Card, Skeleton } from '../../components/ui';
import { useAttendanceReport } from '../../lib/reportQueries';

export default function AttendanceReport() {
  const [classId, setClassId] = useState(1);
  const [chronicOnly, setChronicOnly] = useState(false);
  const { data, isLoading } = useAttendanceReport(classId);

  const displayedRows = data?.studentAttendance.filter((s) => !chronicOnly || s.percent < 75) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Attendance Statistics & Absenteeism Audit
          </h1>
          <p className="text-sm text-slate-500">
            Eligibility threshold (75%) compliance analysis and chronic absenteeism monitoring.
          </p>
        </div>
        <ExportButton endpoint={`/reports/attendance?classId=${classId}`} formats={['csv']} />
      </div>

      {/* KPI Cards */}
      {data && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <span className="text-xs text-slate-400">Total Enrolled</span>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{data.totalStudents}</p>
          </Card>
          <Card className="p-4">
            <span className="text-xs text-slate-400">Class Average</span>
            <p className="mt-1 text-2xl font-bold text-brand-600 dark:text-brand-400">
              {data.averageAttendancePercent.toFixed(1)}%
            </p>
          </Card>
          <Card className="p-4">
            <span className="text-xs text-slate-400">Below 75% Threshold</span>
            <p className="mt-1 text-2xl font-bold text-amber-500">{data.below75Count}</p>
          </Card>
          <Card className="p-4">
            <span className="text-xs text-slate-400">Eligible for Exams</span>
            <p className="mt-1 text-2xl font-bold text-emerald-500">
              {data.totalStudents - data.below75Count}
            </p>
          </Card>
        </div>
      )}

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-white/10">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">Select Class:</label>
            <select
              value={classId}
              onChange={(e) => setClassId(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs dark:border-white/10 dark:bg-ink-800 dark:text-white"
            >
              <option value={1}>CSE-A (Semester 5)</option>
              <option value={2}>CSE-B (Semester 5)</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={chronicOnly}
              onChange={(e) => setChronicOnly(e.target.checked)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Show Only Below 75%
          </label>
        </div>

        {isLoading ? (
          <div className="p-6">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Classes Attended</th>
                  <th className="py-3 px-4">Attendance %</th>
                  <th className="py-3 px-4">Eligibility Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {displayedRows.map((row) => (
                  <tr key={row.rollNo} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                      {row.rollNo}
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{row.name}</td>
                    <td className="py-3 px-4 text-slate-500">{row.className}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {row.attended} / {row.total}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {row.percent.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone={row.status === 'OK' ? 'green' : 'red'}>
                        {row.status === 'OK' ? 'ELIGIBLE' : 'SHORTFALL'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// KPI Summary: total roster count, average attendance, and chronic shortfall tally.

// Class Selector: filters attendance roster by section A/B cohorts.
