import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCheck, Save, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClassSubjectPicker, TableSkeleton, Td, TableWrap, Th, todayIso, type ClassSubject } from '../../components/common';
import { Async, Badge, Button, Card, EmptyState, Field, PageHeader, cn } from '../../components/ui';
import { api } from '../../lib/api';
import { errMsg } from '../../lib/errors';
import { T } from '../../lib/staff';
import type { AttendanceRow } from '../../lib/types';
import { useToast } from '../../state/toast';

type Mark = 'PRESENT' | 'ABSENT';

export default function TeacherAttendance() {
  const toast = useToast();
  const qc = useQueryClient();
  const [sel, setSel] = useState<ClassSubject>({ classId: null, subjectId: null });
  const [date, setDate] = useState(todayIso());
  const [marks, setMarks] = useState<Record<number, Mark>>({});
  const onPick = useCallback((v: ClassSubject) => setSel(v), []);

  const sheet = useQuery({
    queryKey: [T, 'attendance', sel.classId, sel.subjectId, date],
    queryFn: () => api.get<AttendanceRow[]>(`/teachers/me/classes/${sel.classId}/subjects/${sel.subjectId}/attendance?date=${date}`),
    enabled: sel.classId !== null && sel.subjectId !== null && date !== '',
  });

  // Start from what is already saved for that day; students not yet marked default to PRESENT (the common case).
  useEffect(() => {
    if (!sheet.data) return;
    const next: Record<number, Mark> = {};
    sheet.data.forEach((r) => { next[r.studentId] = r.status ?? 'PRESENT'; });
    setMarks(next);
  }, [sheet.data]);

  const alreadySaved = useMemo(() => (sheet.data ?? []).some((r) => r.status !== null), [sheet.data]);
  const counts = useMemo(() => {
    const v = Object.values(marks);
    return { present: v.filter((m) => m === 'PRESENT').length, absent: v.filter((m) => m === 'ABSENT').length };
  }, [marks]);

  const save = useMutation({
    mutationFn: () => api.put<{ saved: number }>('/teachers/me/attendance', {
      classId: sel.classId, subjectId: sel.subjectId, date,
      records: Object.entries(marks).map(([studentId, status]) => ({ studentId: Number(studentId), status })),
    }),
    onSuccess: (r) => {
      toast.push({ tone: 'success', title: 'Attendance saved', message: `${r.saved} students recorded for ${date}. Students see it instantly.` });
      void qc.invalidateQueries({ queryKey: [T] });
    },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not save attendance', message: errMsg(e) }),
  });

  const setAll = (m: Mark) => setMarks((cur) => Object.fromEntries(Object.keys(cur).map((k) => [k, m])));

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Mark one subject for one day. Re-saving the same day updates the earlier record." />
      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <ClassSubjectPicker value={sel} onChange={onPick} />
          <Field label="Date"><input type="date" className="input" max={todayIso()} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        </div>
      </Card>

      {sel.classId === null || sel.subjectId === null ? null : (
        <Async query={sheet} skeleton={<TableSkeleton />}>
          {(rows) => rows.length === 0 ? <EmptyState title="No students in this class" /> : (
            <Card>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="green">{counts.present} present</Badge><Badge tone="red">{counts.absent} absent</Badge>
                  {alreadySaved && <Badge tone="blue">Already recorded for this day</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" icon={CheckCheck} onClick={() => setAll('PRESENT')}>All present</Button>
                  <Button size="sm" variant="secondary" icon={XCircle} onClick={() => setAll('ABSENT')}>All absent</Button>
                </div>
              </div>
              <TableWrap>
                <thead><tr><Th>Roll no.</Th><Th>Student</Th><Th right>Status</Th></tr></thead>
                <tbody>
                  {rows.map((r) => {
                    const m = marks[r.studentId] ?? 'PRESENT';
                    return (
                      <tr key={r.studentId}>
                        <Td className="font-mono text-xs">{r.rollNo}</Td><Td className="font-medium">{r.fullName}</Td>
                        <Td right>
                          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-white/5">
                            {(['PRESENT', 'ABSENT'] as const).map((opt) => (
                              <button key={opt} onClick={() => setMarks((cur) => ({ ...cur, [r.studentId]: opt }))}
                                className={cn('rounded-md px-3.5 py-1 text-xs font-semibold transition',
                                  m === opt ? (opt === 'PRESENT' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-red-500 text-white shadow-sm') : 'text-slate-500 hover:text-slate-800 dark:hover:text-white')}>
                                {opt === 'PRESENT' ? 'Present' : 'Absent'}
                              </button>
                            ))}
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </TableWrap>
              <div className="mt-5 flex justify-end"><Button icon={Save} loading={save.isPending} onClick={() => save.mutate()}>Save attendance</Button></div>
            </Card>
          )}
        </Async>
      )}
    </div>
  );
}
