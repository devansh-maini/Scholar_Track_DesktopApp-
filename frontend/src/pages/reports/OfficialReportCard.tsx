import { Printer } from 'lucide-react';
import { ExportButton } from '../../components/reports/ExportButton';
import { Badge, Button, Card, Skeleton } from '../../components/ui';
import { useStudentTranscript } from '../../lib/reportQueries';

export default function OfficialReportCard() {
  const { data, isLoading, error } = useStudentTranscript();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-8 text-center text-red-500">
        Failed to load academic transcript. Ensure backend is running.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Official Academic Transcript
          </h1>
          <p className="text-sm text-slate-500">Official semester report card and cumulative credit record.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()} className="flex items-center gap-1.5">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <ExportButton endpoint="/reports/student/me" formats={['pdf', 'xlsx', 'csv']} />
        </div>
      </div>

      {/* Official Certificate Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-ink-850">
        {/* Header Branding */}
        <div className="border-b border-slate-100 pb-6 text-center dark:border-white/10">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">ScholarTrack Academic Registry</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Arya College of Engineering & I.T.</h2>
          <p className="text-xs text-slate-500">SP-42, RIICO Industrial Area, Kukas, Jaipur, Rajasthan</p>
          <p className="mt-2 text-sm font-semibold text-brand-600 dark:text-brand-400">
            SEMESTER GRADE CARD & CUMULATIVE TRANSCRIPT
          </p>
        </div>

        {/* Student Meta Details */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-b border-slate-100 pb-6 sm:grid-cols-4 dark:border-white/10">
          <div>
            <span className="text-xs text-slate-400">Student Name</span>
            <p className="font-semibold text-slate-900 dark:text-white">{data.fullName}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Roll Number</span>
            <p className="font-semibold text-slate-900 dark:text-white">{data.rollNo}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Class & Semester</span>
            <p className="font-semibold text-slate-900 dark:text-white">{data.className} (Sem {data.semesterNo})</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Current SGPA / CGPA</span>
            <p className="font-bold text-brand-600 dark:text-brand-400">{data.sgpa} / {data.cgpa}</p>
          </div>
        </div>

        {/* Current Semester Results Table */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Current Semester Course Performance</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Credits</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3">Grade Point</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {data.subjectResults.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{r.subjectName}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{r.credits}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{r.percentage.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{r.gradePoint}</td>
                    <td className="py-2.5 px-3">
                      <Badge tone={r.gradePoint >= 4 ? 'green' : 'red'}>
                        {r.gradePoint >= 4 ? 'PASS' : 'FAIL'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Previous Semesters Summary */}
        {data.previousSemesters.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-6 dark:border-white/10">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Historical Semester Progress</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {data.previousSemesters.map((p, i) => (
                <div key={i} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-white/5">
                  <p className="text-xs text-slate-500">{p.semesterLabel}</p>
                  <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">{p.sgpa.toFixed(2)}</p>
                  <p className="text-[11px] text-slate-400">{p.credits} Credits</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance & Fee Clearance */}
        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 dark:border-white/10">
          <div className="rounded-xl border border-slate-100 p-4 dark:border-white/5">
            <p className="text-xs font-semibold text-slate-500 uppercase">Attendance Clearance</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {data.attendedClasses} / {data.totalClasses} classes ({data.overallAttendancePercent.toFixed(1)}%)
              </span>
              <Badge tone={data.overallAttendancePercent >= 75 ? 'green' : 'red'}>
                {data.overallAttendancePercent >= 75 ? 'ELIGIBLE' : 'SHORTFALL'}
              </Badge>
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 dark:border-white/5">
            <p className="text-xs font-semibold text-slate-500 uppercase">Academic Risk Indicator</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-slate-700 dark:text-slate-300">Risk Score: {data.riskScore}/100</span>
              <Badge tone={data.riskLevel === 'LOW' ? 'green' : data.riskLevel === 'MEDIUM' ? 'amber' : 'red'}>
                {data.riskLevel}
              </Badge>
            </div>
          </div>
        </div>

        {/* Official Sign-off Stamp */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6 text-xs text-slate-400 dark:border-white/10">
          <span>Generated: {data.generatedDate}</span>
          <span>Official Digital Record • Signature Verified</span>
        </div>
      </div>
    </div>
  );
}

// Header Branding: Arya College of Engineering & I.T. official mark.

// Grade Table: credits, percentage, 10-point scale grade point, pass/fail tag.

// Progression Grid: historical SGPA cards across all completed semesters.

// Attendance Clearance: marks eligibility for university end-semester examination.
