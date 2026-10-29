import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { ClassSubjectPicker, TableSkeleton, type ClassSubject } from '../../components/common';
import { Async, Badge, Button, Card, CardHeader, EmptyState, Field, PageHeader, Progress, cn } from '../../components/ui';
import { api } from '../../lib/api';
import { errMsg } from '../../lib/errors';
import { fmtDate } from '../../lib/format';
import { T } from '../../lib/staff';
import type { SyllabusDto } from '../../lib/types';
import { useToast } from '../../state/toast';

export default function TeacherSyllabus() {
  const toast = useToast();
  const qc = useQueryClient();
  const [sel, setSel] = useState<ClassSubject>({ classId: null, subjectId: null });
  const [unit, setUnit] = useState('1');
  const [title, setTitle] = useState('');
  const onPick = useCallback((v: ClassSubject) => setSel(v), []);
  const ready = sel.classId !== null && sel.subjectId !== null;
  const key = [T, 'syllabus', sel.classId, sel.subjectId];

  const q = useQuery({ queryKey: key, queryFn: () => api.get<SyllabusDto>(`/teachers/me/classes/${sel.classId}/subjects/${sel.subjectId}/syllabus`), enabled: ready });

  const toggle = useMutation({
    mutationFn: (v: { topicId: number; completed: boolean }) => api.put(`/teachers/me/classes/${sel.classId}/subjects/${sel.subjectId}/syllabus/${v.topicId}`, { completed: v.completed }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [T, 'syllabus'] }),
    onError: (e) => toast.push({ tone: 'error', title: 'Could not update topic', message: errMsg(e) }),
  });
  const add = useMutation({
    mutationFn: () => api.post(`/teachers/me/subjects/${sel.subjectId}/syllabus`, { unitNo: Number(unit), title: title.trim() }),
    onSuccess: () => {
      toast.push({ tone: 'success', message: 'Topic added to the syllabus.' });
      setTitle('');
      void qc.invalidateQueries({ queryKey: [T, 'syllabus'] });
    },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not add topic', message: errMsg(e) }),
  });

  return (
    <div>
      <PageHeader title="Syllabus" subtitle="Tick topics off as you finish teaching them. Students and the HOD see the progress live." />
      <Card className="mb-6"><ClassSubjectPicker value={sel} onChange={onPick} /></Card>
      {!ready ? null : (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Async query={q} skeleton={<TableSkeleton />}>
              {(s) => (
                <Card>
                  <CardHeader title={`${s.subjectCode} · ${s.subjectName}`} subtitle={s.className} action={<Badge tone={s.percentComplete >= 75 ? 'green' : s.percentComplete >= 40 ? 'amber' : 'slate'}>{s.topicsDone}/{s.topicsTotal} topics</Badge>} />
                  <div className="mb-5"><div className="mb-1 flex justify-between text-xs text-slate-500"><span>Course covered</span><span>{s.percentComplete.toFixed(0)}%</span></div><Progress value={s.percentComplete} /></div>
                  {s.topics.length === 0 ? <EmptyState title="No topics yet" text="Add the first topic using the form." /> : (
                    <ul className="space-y-2">
                      {s.topics.map((t) => (
                        <li key={t.id}>
                          <button onClick={() => toggle.mutate({ topicId: t.id, completed: !t.completed })} disabled={toggle.isPending}
                            className={cn('flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition',
                              t.completed ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10' : 'border-slate-200 hover:border-brand-300 dark:border-white/10 dark:hover:bg-white/5')}>
                            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2', t.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-white/20')}>{t.completed && <Check className="h-3.5 w-3.5" />}</span>
                            <span className="min-w-0 flex-1"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unit {t.unitNo}</span><span className="block text-sm font-medium text-slate-900 dark:text-white">{t.title}</span></span>
                            {t.completed && t.completedOn && <span className="text-xs text-emerald-700 dark:text-emerald-300">{fmtDate(t.completedOn)}</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              )}
            </Async>
          </div>
          <Card className="h-fit">
            <CardHeader title="Add a topic" subtitle="Topics belong to the subject and are shared by all classes you teach it to." />
            <div className="space-y-4">
              <Field label="Unit number"><input type="number" min={1} max={20} className="input" value={unit} onChange={(e) => setUnit(e.target.value)} /></Field>
              <Field label="Topic title"><input className="input" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Binary search trees" /></Field>
              <Button className="w-full" icon={Plus} loading={add.isPending} disabled={!title.trim() || !(Number(unit) >= 1 && Number(unit) <= 20)} onClick={() => add.mutate()}>Add topic</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
