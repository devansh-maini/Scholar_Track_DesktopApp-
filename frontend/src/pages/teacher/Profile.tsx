import { BookOpen, Building, IdCard, Mail, User } from 'lucide-react';
import { Async, Badge, Card, CardHeader, PageHeader, Stat } from '../../components/ui';
import { initials } from '../../lib/format';
import { useTeacherAssignments, useTeacherMe } from '../../lib/queries';

export default function TeacherProfile() {
  const meQ = useTeacherMe();
  const assignmentsQ = useTeacherAssignments();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Profile"
        subtitle="Your institutional employee credentials, departmental affiliation, and teaching allocations."
      />

      <Async query={meQ}>
        {(t) => (
          <div className="space-y-6">
            {/* Header Profile Card */}
            <Card className="flex flex-wrap items-center gap-6 p-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-violet-500/20">
                {initials(t.fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {t.fullName}
                  </h2>
                  <Badge tone="violet">FACULTY</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Employee ID: <span className="font-semibold text-slate-700 dark:text-slate-200">{t.employeeCode}</span> · Department of{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{t.departmentCode}</span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" /> @{t.username}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" /> {t.email}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-slate-400" /> {t.departmentCode} Faculty Room
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Metrics */}
            <Async query={assignmentsQ}>
              {(list) => (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  <Stat label="Allocated Subjects" value={new Set(list.map((a) => a.subjectId)).size} hint="Curriculum subjects" icon={BookOpen} tone="teal" />
                  <Stat label="Active Cohorts" value={new Set(list.map((a) => a.classId)).size} hint="Assigned classes" icon={Building} tone="violet" />
                  <Stat label="Total Assignments" value={list.length} hint="Teaching lecture blocks" icon={IdCard} tone="blue" />
                </div>
              )}
            </Async>

            {/* Teaching Allocations Table */}
            <Card>
              <CardHeader
                title="Teaching Course Allocations"
                subtitle="Official academic courses assigned to you by the Head of Department (HOD)"
              />
              <Async query={assignmentsQ}>
                {(list) =>
                  list.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4 text-center">
                      No courses currently allocated.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200/80 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                            <th className="pb-3 font-semibold">Subject Code</th>
                            <th className="pb-3 font-semibold">Subject Title</th>
                            <th className="pb-3 font-semibold">Class Group</th>
                            <th className="pb-3 text-right font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {list.map((a) => (
                            <tr key={a.id} className="transition hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                              <td className="py-3.5 font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                                {a.subjectCode}
                              </td>
                              <td className="py-3.5 font-medium text-slate-900 dark:text-white">
                                {a.subjectName}
                              </td>
                              <td className="py-3.5 font-medium text-slate-600 dark:text-slate-300">
                                {a.className}
                              </td>
                              <td className="py-3.5 text-right">
                                <Badge tone="green">Active</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </Async>
            </Card>
          </div>
        )}
      </Async>
    </div>
  );
}
