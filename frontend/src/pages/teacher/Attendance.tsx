import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarCheck, CheckCircle2, Download, Save,
  Users, XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Async, Badge, Button, Card, CardHeader, EmptyState, PageHeader, Stat } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { api } from '../../lib/api';
import { keys, useClassStudents, useTeacherAssignments, useTeacherAttendance } from '../../lib/queries';
import type { AttendanceEntry, AttendanceStatus } from '../../lib/types';
import { useToast } from '../../state/toast';

const statusTone: Record<AttendanceStatus, Tone> = {
  PRESENT: 'green',
  ABSENT: 'red',
  LATE: 'amber',
  EXCUSED: 'blue',
};

export default function TeacherAttendance() {
  const [params, setSearchParams] = useSearchParams();
  const assignmentsQ = useTeacherAssignments();
  const qc = useQueryClient();
  const toast = useToast();

  const assignments = assignmentsQ.data ?? [];
  const defaultAssignment = assignments[0];

  const selectedClassId = params.get('classId') ? Number(params.get('classId')) : defaultAssignment?.classId;
  const selectedSubjectId = params.get('subjectId') ? Number(params.get('subjectId')) : defaultAssignment?.subjectId;
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Current selected assignment details
  const currentAssignment = assignments.find(
    (a) => a.classId === selectedClassId && a.subjectId === selectedSubjectId
  );

  const studentsQ = useClassStudents(selectedClassId);
  const attendanceQ = useTeacherAttendance(selectedClassId, selectedSubjectId, date);

  // Local state for attendance records
  const [records, setRecords] = useState<Record<number, AttendanceStatus>>({});

  // Sync attendance data into local state when fetched or reset
  useEffect(() => {
    if (attendanceQ.data && attendanceQ.data.length > 0) {
      const initial: Record<number, AttendanceStatus> = {};
      attendanceQ.data.forEach((r) => {
        initial[r.studentId] = r.status;
      });
      setRecords(initial);
    } else if (studentsQ.data && studentsQ.data.length > 0) {
      // Default all to PRESENT if no sheet exists yet for this date
      const initial: Record<number, AttendanceStatus> = {};
      studentsQ.data.forEach((s) => {
        initial[s.id] = 'PRESENT';
      });
      setRecords(initial);
    }
  }, [attendanceQ.data, studentsQ.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClassId || !selectedSubjectId) return;
      const entries: AttendanceEntry[] = Object.entries(records).map(([studentId, status]) => ({
        studentId: Number(studentId),
        status,
      }));
      return api.put<{ saved: number }>('/teachers/me/attendance', {
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        date,
        records: entries,
      });
    },
    onSuccess: (data) => {
      toast.push({
        tone: 'success',
        title: 'Attendance Saved',
        message: `Successfully saved attendance records for ${data?.saved ?? 0} students.`,
      });
      if (selectedClassId && selectedSubjectId) {
        void qc.invalidateQueries({
          queryKey: keys.teacherAttendance(selectedClassId, selectedSubjectId, date),
        });
      }
    },
    onError: (err: Error) => {
      toast.push({ tone: 'error', title: 'Failed to Save', message: err.message });
    },
  });

  // Calculate stats
  const studentsList = studentsQ.data ?? [];
  const totalStudents = studentsList.length;
  const presentCount = Object.values(records).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(records).filter((s) => s === 'ABSENT').length;
  const lateCount = Object.values(records).filter((s) => s === 'LATE').length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Bulk actions
  const setAllStatus = (status: AttendanceStatus) => {
    const updated: Record<number, AttendanceStatus> = {};
    studentsList.forEach((s) => {
      updated[s.id] = status;
    });
    setRecords(updated);
  };

  // CSV Export
  const exportCsv = () => {
    if (!currentAssignment || studentsList.length === 0) return;
    const header = [
      `Attendance Report`,
      `${currentAssignment.className} - ${currentAssignment.subjectName} (${currentAssignment.subjectCode})`,
      `Generated,${new Date().toISOString().slice(0, 10)}`,
      `Session Date,${date}`,
      `Total Students,${totalStudents}`,
      `Present,${presentCount} (${attendanceRate}%)`,
      `Absent,${absentCount}`,
      `Late,${lateCount}`,
      ``,
      `Roll No,Student Name,Class,Status`,
    ];

    const rows = studentsList.map((s) => {
      const status = records[s.id] ?? 'PRESENT';
      return `"${s.rollNo}","${s.fullName}","${s.className}","${status}"`;
    });

    const csvContent = [...header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${currentAssignment.className.toLowerCase()}-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        subtitle="Mark, update, and export daily classroom attendance sheets for your allocated subjects."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={Download}
              size="sm"
              onClick={exportCsv}
              disabled={studentsList.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              icon={Save}
              size="sm"
              loading={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              disabled={studentsList.length === 0}
            >
              Save Attendance
            </Button>
          </div>
        }
      />

      {/* Class & Subject Selector */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-56">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Class & Subject
              </label>
              <select
                className="input py-2 text-sm"
                value={
                  selectedClassId && selectedSubjectId
                    ? `${selectedClassId}:${selectedSubjectId}`
                    : ''
                }
                onChange={(e) => {
                  const [cid, sid] = e.target.value.split(':');
                  setSearchParams({ classId: cid!, subjectId: sid! });
                }}
              >
                {assignments.map((a) => (
                  <option key={`${a.classId}:${a.subjectId}`} value={`${a.classId}:${a.subjectId}`}>
                    {a.className} — {a.subjectCode}: {a.subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Session Date
              </label>
              <input
                type="date"
                className="input py-2 text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={CheckCircle2}
              onClick={() => setAllStatus('PRESENT')}
            >
              Mark All Present
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={XCircle}
              onClick={() => setAllStatus('ABSENT')}
            >
              Mark All Absent
            </Button>
          </div>
        </div>
      </Card>

      {/* Session Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total Enrolled" value={totalStudents} hint="In this class section" icon={Users} tone="slate" />
        <Stat label="Present" value={presentCount} hint={`${attendanceRate}% attendance`} icon={CheckCircle2} tone="green" />
        <Stat label="Absent" value={absentCount} hint="Students missing" icon={XCircle} tone="red" />
        <Stat label="Late / Excused" value={lateCount} hint="Exceptions recorded" icon={CalendarCheck} tone="amber" />
      </div>

      {/* Student Attendance Table */}
      <Card>
        <CardHeader
          title={currentAssignment ? `${currentAssignment.className} — ${currentAssignment.subjectName}` : 'Student Sheet'}
          subtitle={`Attendance for ${date}. Select the status for each student and save.`}
        />

        <Async query={studentsQ}>
          {(list) =>
            list.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No students enrolled"
                text="There are no students registered in this class group yet."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                      <th className="pb-3 font-semibold">Roll No</th>
                      <th className="pb-3 font-semibold">Student Name</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 text-right font-semibold">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {list.map((student) => {
                      const currentStatus = records[student.id] ?? 'PRESENT';
                      return (
                        <tr key={student.id} className="transition hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                          <td className="py-3.5 font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {student.rollNo}
                          </td>
                          <td className="py-3.5 font-medium text-slate-900 dark:text-white">
                            {student.fullName}
                          </td>
                          <td className="py-3.5">
                            <Badge tone={statusTone[currentStatus]}>
                              {currentStatus}
                            </Badge>
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">
                              {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as AttendanceStatus[]).map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => setRecords((prev) => ({ ...prev, [student.id]: st }))}
                                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                                    currentStatus === st
                                      ? 'bg-white text-slate-900 shadow-sm dark:bg-ink-700 dark:text-white'
                                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                                  }`}
                                >
                                  {st[0] + st.slice(1).toLowerCase()}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
        </Async>
      </Card>
    </div>
  );
}
