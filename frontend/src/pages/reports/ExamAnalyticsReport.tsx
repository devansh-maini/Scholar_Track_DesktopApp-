import { ExportButton } from '../../components/reports/ExportButton';
import { Badge, Card, Skeleton } from '../../components/ui';
import { useDepartmentReport } from '../../lib/reportQueries';

export default function ExamAnalyticsReport() {
  const { data, isLoading } = useDepartmentReport();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Department Exam Performance Analytics
          </h1>
          <p className="text-sm text-slate-500">
            Overall departmental performance metrics, pass/fail distributions, and risk curves.
          </p>
        </div>
        <ExportButton endpoint="/reports/department" formats={['pdf', 'xlsx']} />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : data ? (
        <>
          {/* Department KPIs */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="p-4">
              <span className="text-xs text-slate-400">Total Students</span>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{data.totalStudents}</p>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-slate-400">Average CGPA</span>
              <p className="mt-1 text-2xl font-bold text-brand-600 dark:text-brand-400">{data.averageCgpa.toFixed(2)}</p>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-slate-400">Average Attendance</span>
              <p className="mt-1 text-2xl font-bold text-emerald-500">{data.averageAttendancePercent.toFixed(1)}%</p>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-slate-400">High Risk Students</span>
              <p className="mt-1 text-2xl font-bold text-rose-500">{data.highRiskStudentsCount}</p>
            </Card>
          </div>

          {/* Subject Performance Ranking */}
          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 p-4 dark:border-white/10">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Subject Performance Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Subject Code</th>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Average Marks %</th>
                    <th className="py-3 px-4">Average Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {data.subjectPerformance.map((sub) => (
                    <tr key={sub.code} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                      <td className="py-3 px-4 font-mono font-semibold text-brand-600 dark:text-brand-400">{sub.code}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white">{sub.name}</td>
                      <td className="py-3 px-4 text-slate-500">{sub.semesterNo}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{sub.avgPercentage.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{sub.avgAttendancePercent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Student Performance Ranking */}
          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 p-4 dark:border-white/10">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Student Academic Risk & Performance Roster</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Attendance %</th>
                    <th className="py-3 px-4">Marks %</th>
                    <th className="py-3 px-4">SGPA</th>
                    <th className="py-3 px-4">CGPA</th>
                    <th className="py-3 px-4">Risk Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {data.studentPerformance.map((st) => (
                    <tr key={st.rollNo} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-900 dark:text-white">{st.rollNo}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white">{st.name}</td>
                      <td className="py-3 px-4 text-slate-500">{st.className}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{st.attendancePercent.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{st.marksPercent.toFixed(1)}%</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{st.sgpa.toFixed(2)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{st.cgpa.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <Badge tone={st.riskLevel === 'LOW' ? 'green' : st.riskLevel === 'MEDIUM' ? 'amber' : 'red'}>
                          {st.riskLevel} ({st.riskScore})
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
