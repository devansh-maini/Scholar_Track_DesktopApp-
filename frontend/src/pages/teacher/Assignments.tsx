import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ClipboardList, Plus, Send } from 'lucide-react';
import { useState } from 'react';
import { Td, TableSkeleton, TableWrap, Th, useTeachingOptions } from '../../components/common';
import { Async, Badge, Button, Card, EmptyState, Field, Modal, PageHeader } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { api } from '../../lib/api';
import { errMsg } from '../../lib/errors';
import { dueText, fmtDateTime } from '../../lib/format';
import { T, useTeacherCoursework } from '../../lib/staff';
import type { CourseworkDto, CourseworkStatus, SubmissionDto } from '../../lib/types';
import { useToast } from '../../state/toast';

const statusTone: Record<CourseworkStatus, Tone> = { PENDING: 'amber', SUBMITTED: 'blue', LATE: 'red', EVALUATED: 'green' };

/** Default deadline: one week from now at 17:00, in the datetime-local input format. */
function defaultDeadline(): string {
  const d = new Date(Date.now() + 7 * 86_400_000);
  d.setHours(17, 0, 0, 0);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function CreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [classId, setClassId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const { query, classes, subjects } = useTeachingOptions({ classId, subjectId });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(defaultDeadline());
  const [maxMarks, setMaxMarks] = useState('20');

  // default to the first class/subject the teacher has once the list arrives
  const effClass = classId ?? classes[0]?.id ?? null;
  const effSubjects = query.data?.filter((a) => a.classId === effClass) ?? [];
  const effSubject = subjectId !== null && effSubjects.some((s) => s.subjectId === subjectId) ? subjectId : effSubjects[0]?.subjectId ?? null;

  const create = useMutation({
    mutationFn: () => api.post('/teachers/me/coursework', {
      classId: effClass, subjectId: effSubject, title: title.trim(), description: description.trim() || null,
      deadline: deadline.length === 16 ? `${deadline}:00` : deadline, maxMarks: Number(maxMarks),
    }),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Assignment created', message: 'Students of the class have been notified.' });
      setTitle(''); setDescription(''); setDeadline(defaultDeadline()); setMaxMarks('20');
      void qc.invalidateQueries({ queryKey: [T] });
      onClose();
    },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not create assignment', message: errMsg(e) }),
  });

  return (
    <Modal open={open} onClose={onClose} title="New assignment"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button icon={Plus} loading={create.isPending} disabled={!title.trim() || effClass === null || effSubject === null || !(Number(maxMarks) > 0)} onClick={() => create.mutate()}>Create</Button></>}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Class">
            <select className="input" value={effClass ?? ''} onChange={(e) => { setClassId(Number(e.target.value)); setSubjectId(null); }}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Subject">
            <select className="input" value={effSubject ?? ''} onChange={(e) => setSubjectId(Number(e.target.value))}>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Title"><input className="input" maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Unit 2 problem set" /></Field>
        <Field label="Instructions (optional)"><textarea className="input min-h-24 resize-y" maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Deadline"><input type="datetime-local" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></Field>
          <Field label="Maximum marks"><input type="number" min={1} className="input" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} /></Field>
        </div>
      </div>
    </Modal>
  );
}

function SubmissionRow({ cw, s }: { cw: CourseworkDto; s: SubmissionDto }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [marks, setMarks] = useState(s.marks !== null ? String(s.marks) : '');
  const [feedback, setFeedback] = useState(s.feedback ?? '');
  const done = s.status === 'EVALUATED';
  const bad = marks === '' || Number.isNaN(Number(marks)) || Number(marks) < 0 || Number(marks) > cw.maxMarks;

  const evaluate = useMutation({
    mutationFn: () => api.put(`/teachers/me/coursework/${cw.id}/submissions/${s.id}/evaluate`, { marks: Number(marks), feedback: feedback.trim() || null }),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Evaluated', message: `${s.studentName} received ${marks}/${cw.maxMarks}.` });
      void qc.invalidateQueries({ queryKey: [T] });
    },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not evaluate', message: errMsg(e) }),
  });

  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><p className="font-semibold text-slate-900 dark:text-white">{s.studentName} <span className="font-mono text-xs font-normal text-slate-500">{s.rollNo}</span></p>
          <p className="text-xs text-slate-500">Submitted {fmtDateTime(s.submittedAt)}</p></div>
        <Badge tone={statusTone[s.status]}>{s.status}</Badge>
      </div>
      <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200">{s.content}</p>
      {done ? (
        <p className="mt-3 text-sm"><span className="font-semibold text-emerald-600">{s.marks}/{cw.maxMarks}</span>{s.feedback ? <span className="text-slate-600 dark:text-slate-300"> — {s.feedback}</span> : null}</p>
      ) : (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <Field label={`Marks (max ${cw.maxMarks})`}><input type="number" step="0.5" min={0} max={cw.maxMarks} className="input !w-32" value={marks} onChange={(e) => setMarks(e.target.value)} /></Field>
          <div className="min-w-56 flex-1"><Field label="Feedback"><input className="input" maxLength={1000} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Optional comment for the student" /></Field></div>
          <Button icon={CheckCircle2} loading={evaluate.isPending} disabled={bad} onClick={() => evaluate.mutate()}>Evaluate</Button>
        </div>
      )}
    </div>
  );
}

function SubmissionsModal({ cw, onClose }: { cw: CourseworkDto | null; onClose: () => void }) {
  const q = useQuery({
    queryKey: [T, 'submissions', cw?.id],
    queryFn: () => api.get<SubmissionDto[]>(`/teachers/me/coursework/${cw!.id}/submissions`),
    enabled: cw !== null,
  });
  return (
    <Modal open={cw !== null} onClose={onClose} size="xl" title={cw ? `${cw.title} — submissions` : ''} footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
      {cw && (
        <Async query={q} skeleton={<TableSkeleton rows={3} />}>
          {(subs) => subs.length === 0 ? <EmptyState icon={ClipboardList} title="No submissions yet" text="Students' submissions appear here the moment they send them." /> : (
            <div className="space-y-3">{subs.map((s) => <SubmissionRow key={s.id} cw={cw} s={s} />)}</div>
          )}
        </Async>
      )}
    </Modal>
  );
}

export default function TeacherAssignments() {
  const q = useTeacherCoursework();
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState<CourseworkDto | null>(null);

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Create coursework, then review and grade each submission." actions={<Button icon={Send} onClick={() => setCreating(true)}>New assignment</Button>} />
      <Async query={q} skeleton={<TableSkeleton />}>
        {(list) => list.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No assignments yet" text="Create your first assignment. Students in the class are notified immediately." action={<Button icon={Plus} onClick={() => setCreating(true)}>New assignment</Button>} />
        ) : (
          <Card className="!p-0">
            <TableWrap className="border-0">
              <thead><tr><Th>Assignment</Th><Th>Class</Th><Th>Deadline</Th><Th right>Max</Th><Th right>Submissions</Th><Th /></tr></thead>
              <tbody>
                {list.map((c) => {
                  const d = dueText(c.deadline);
                  return (
                    <tr key={c.id}>
                      <Td><p className="font-medium text-slate-900 dark:text-white">{c.title}</p><p className="text-xs text-slate-500">{c.subjectCode} · {c.subjectName}</p></Td>
                      <Td>{c.className}</Td>
                      <Td><p>{fmtDateTime(c.deadline)}</p><p className={`text-xs ${d.overdue ? 'text-slate-400' : d.soon ? 'text-amber-600' : 'text-slate-500'}`}>{d.text}</p></Td>
                      <Td right>{c.maxMarks}</Td>
                      <Td right><Badge tone={c.submissionCount > 0 ? 'blue' : 'slate'}>{c.submissionCount}</Badge></Td>
                      <Td right><Button size="sm" variant="secondary" onClick={() => setOpen(c)}>Review</Button></Td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
          </Card>
        )}
      </Async>
      <CreateModal open={creating} onClose={() => setCreating(false)} />
      <SubmissionsModal cw={open} onClose={() => setOpen(null)} />
    </div>
  );
}
