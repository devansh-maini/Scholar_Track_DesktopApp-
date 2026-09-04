import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ClipboardList, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import { Async, Badge, Button, Card, EmptyState, Field, Modal, PageHeader, Tabs } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { api } from '../../lib/api';
import { dueText, fmtDate, fmtDateTime } from '../../lib/format';
import { keys, useCoursework } from '../../lib/queries';
import type { CourseworkStatus, MyCoursework } from '../../lib/types';
import { useToast } from '../../state/toast';

type Filter = 'ALL' | 'PENDING' | 'SUBMITTED' | 'EVALUATED';
const statusTone: Record<CourseworkStatus, Tone> = { PENDING: 'amber', SUBMITTED: 'blue', LATE: 'red', EVALUATED: 'green' };

export default function Assignments() {
  const q = useCoursework();
  const qc = useQueryClient();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [target, setTarget] = useState<MyCoursework | null>(null);
  const [content, setContent] = useState('');

  const submit = useMutation({
    mutationFn: () => api.post(`/students/me/coursework/${target!.id}/submit`, { content: content.trim() }),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Submitted', message: `${target?.title} was submitted successfully.` });
      setTarget(null); setContent('');
      void qc.invalidateQueries({ queryKey: [...keys.coursework] });
      void qc.invalidateQueries({ queryKey: [...keys.risk] });
    },
    onError: (e: Error) => toast.push({ tone: 'error', title: 'Could not submit', message: e.message }),
  });

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Submit your work before the deadline. Late submissions are marked as late." />
      <Async query={q}>
        {(all) => {
          const list = all.filter((c) => filter === 'ALL' ? true : filter === 'PENDING' ? c.status === 'PENDING' : filter === 'SUBMITTED' ? c.status === 'SUBMITTED' || c.status === 'LATE' : c.status === 'EVALUATED')
            .sort((a, b) => a.deadline.localeCompare(b.deadline));
          const count = (f: Filter) => f === 'ALL' ? all.length : all.filter((c) => f === 'SUBMITTED' ? c.status === 'SUBMITTED' || c.status === 'LATE' : c.status === f).length;
          return (
            <div className="space-y-5">
              <Tabs<Filter> value={filter} onChange={setFilter} options={[
                { value: 'ALL', label: 'All', count: count('ALL') }, { value: 'PENDING', label: 'To do', count: count('PENDING') },
                { value: 'SUBMITTED', label: 'Submitted', count: count('SUBMITTED') }, { value: 'EVALUATED', label: 'Evaluated', count: count('EVALUATED') }]} />
              {list.length === 0 ? <EmptyState icon={ClipboardList} title="Nothing here" text="No assignments match this filter." /> : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {list.map((c) => {
                    const d = dueText(c.deadline);
                    return (
                      <Card key={c.id} hover>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{c.subjectCode} · {c.subjectName}</p>
                            <h3 className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">{c.title}</h3>
                            <p className="text-xs text-slate-500">{c.teacherName}</p>
                          </div>
                          <Badge tone={statusTone[c.status]}>{c.status}</Badge>
                        </div>
                        {c.description && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{c.description}</p>}
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {fmtDate(c.deadline)}</span>
                          <span>Max {c.maxMarks} marks</span>
                          {c.status === 'PENDING' && <Badge tone={d.overdue ? 'red' : d.soon ? 'amber' : 'blue'}>{d.text}</Badge>}
                        </div>
                        {c.status === 'EVALUATED' && (
                          <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm dark:bg-emerald-500/10">
                            <p className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Evaluation Score: {c.marks} / {c.maxMarks}</p>
                            {c.feedback && <p className="mt-1 text-emerald-900/80 dark:text-emerald-200/80">“{c.feedback}”</p>}
                          </div>
                        )}
                        {c.submittedAt && c.status !== 'EVALUATED' && <p className="mt-3 text-xs text-slate-500">Submitted {fmtDateTime(c.submittedAt)}. You can resubmit until it is evaluated.</p>}
                        {c.status !== 'EVALUATED' && (
                          <Button className="mt-4" variant={c.status === 'PENDING' ? 'primary' : 'secondary'} size="sm" icon={Send} onClick={() => { setTarget(c); setContent(''); }}>
                            {c.status === 'PENDING' ? 'Submit work' : 'Resubmit'}
                          </Button>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }}
      </Async>

      <Modal open={target !== null} onClose={() => setTarget(null)} title={`Submit: ${target?.title ?? ''}`}
        footer={<><Button variant="ghost" onClick={() => setTarget(null)}>Cancel</Button>
          <Button icon={Send} loading={submit.isPending} disabled={content.trim().length === 0} onClick={() => submit.mutate()}>Submit</Button></>}>
        <Field label="Link to your work or a short note" hint="Paste a Drive / GitHub link or write a note (max 500 characters).">
          <textarea className="input min-h-28 resize-y" maxLength={500} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste your answer, repo URL, or notes here..." />
        </Field>
        <p className="mt-2 text-right text-xs text-slate-400">{content.length}/500</p>
      </Modal>
    </div>
  );
}
