import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClassSubjectPicker, TableSkeleton, Td, TableWrap, Th, type ClassSubject } from '../../components/common';
import { Badge, Button, Card, EmptyState, Field, PageHeader } from '../../components/ui';
import { api } from '../../lib/api';
import { errMsg } from '../../lib/errors';
import { T } from '../../lib/staff';
import type { AssessmentType, MarkDto, StudentDto } from '../../lib/types';
import { useToast } from '../../state/toast';

const types: { value: AssessmentType; label: string; defaultMax: number }[] = [
  { value: 'MIDTERM', label: 'Midterm', defaultMax: 50 },
  { value: 'INTERNAL', label: 'Internal', defaultMax: 30 },
  { value: 'ASSIGNMENT', label: 'Assignment', defaultMax: 20 },
  { value: 'PRACTICAL', label: 'Practical', defaultMax: 50 },
];

export default function TeacherMarks() {
  const toast = useToast();
  const qc = useQueryClient();
  const [sel, setSel] = useState<ClassSubject>({ classId: null, subjectId: null });
  const [type, setType] = useState<AssessmentType>('MIDTERM');
  const [maxMarks, setMaxMarks] = useState('50');
  const [values, setValues] = useState<Record<number, string>>({});
  const onPick = useCallback((v: ClassSubject) => setSel(v), []);
  const ready = sel.classId !== null && sel.subjectId !== null;

  const students = useQuery({ queryKey: [T, 'class-students', sel.classId], queryFn: () => api.get<StudentDto[]>(`/teachers/me/classes/${sel.classId}/students`), enabled: ready });
  const existing = useQuery({ queryKey: [T, 'class-marks', sel.classId, sel.subjectId], queryFn: () => api.get<MarkDto[]>(`/teachers/me/classes/${sel.classId}/subjects/${sel.subjectId}/marks`), enabled: ready });

  const ofType = useMemo(() => (existing.data ?? []).filter((m) => m.assessmentType === type), [existing.data, type]);

  // Pre-fill with the marks already saved for this assessment so a correction is a one-field edit.
  useEffect(() => {
    if (!existing.data) return;
    const next: Record<number, string> = {};
    ofType.forEach((m) => { next[m.studentId] = String(m.marks); });
    setValues(next);
    setMaxMarks(String(ofType[0]?.maxMarks ?? types.find((t) => t.value === type)!.defaultMax));
  }, [existing.data, ofType, type]);

  const max = Number(maxMarks);
  const invalid = (id: number): boolean => { const v = values[id]; return v !== undefined && v !== '' && (Number.isNaN(Number(v)) || Number(v) < 0 || Number(v) > max); };
  const entries = Object.entries(values).filter(([, v]) => v !== '').map(([id, v]) => ({ studentId: Number(id), marks: Number(v) }));
  const anyInvalid = (students.data ?? []).some((s) => invalid(s.id));
  const filled = entries.length;

  const save = useMutation({
    mutationFn: () => api.put<{ saved: number }>('/teachers/me/marks', { classId: sel.classId, subjectId: sel.subjectId, assessmentType: type, maxMarks: max, entries }),
    onSuccess: (r) => {
      toast.push({ tone: 'success', title: 'Marks saved', message: `${r.saved} ${type.toLowerCase()} marks saved. Students see them instantly.` });
      void qc.invalidateQueries({ queryKey: [T] });
    },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not save marks', message: errMsg(e) }),
  });

  return (
    <div>
      <PageHeader title="Marks" subtitle="Enter or correct marks for one assessment. SGPA, CGPA and risk are recalculated from the saved marks." />
      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <ClassSubjectPicker value={sel} onChange={onPick} />
          <Field label="Assessment">
            <select className="input min-w-40" value={type} onChange={(e) => setType(e.target.value as AssessmentType)}>
              {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Maximum marks"><input type="number" min={1} className="input w-32" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} /></Field>
        </div>
      </Card>

      {!ready ? null : students.isPending || existing.isPending ? <TableSkeleton /> : students.isError ? <p className="text-sm text-red-600">{students.error.message}</p> : (students.data?.length ?? 0) === 0 ? <EmptyState title="No students in this class" /> : (
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge tone="teal">{filled} of {students.data.length} entered</Badge>
            {ofType.length > 0 && <Badge tone="blue">Editing saved marks</Badge>}
            {anyInvalid && <Badge tone="red">Marks must be between 0 and {maxMarks}</Badge>}
          </div>
          <TableWrap>
            <thead><tr><Th>Roll no.</Th><Th>Student</Th><Th right>Marks (out of {maxMarks || '?'})</Th></tr></thead>
            <tbody>
              {students.data.map((s) => (
                <tr key={s.id}>
                  <Td className="font-mono text-xs">{s.rollNo}</Td><Td className="font-medium">{s.fullName}</Td>
                  <Td right>
                    <input type="number" step="0.5" min={0} max={max} value={values[s.id] ?? ''} placeholder="—"
                      onChange={(e) => setValues((cur) => ({ ...cur, [s.id]: e.target.value }))}
                      className={`input !w-28 text-right ${invalid(s.id) ? '!border-red-400' : ''}`} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <div className="mt-5 flex justify-end">
            <Button icon={Save} loading={save.isPending} disabled={filled === 0 || anyInvalid || !(max > 0)} onClick={() => save.mutate()}>Save marks</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
