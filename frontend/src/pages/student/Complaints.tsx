import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LifeBuoy, Plus, Send } from 'lucide-react';
import { useState } from 'react';
import { Async, Badge, Button, Card, EmptyState, Field, Modal, PageHeader } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { api } from '../../lib/api';
import { fmtDate } from '../../lib/format';
import { keys, useComplaints } from '../../lib/queries';
import type { ComplaintCategory, ComplaintStatus } from '../../lib/types';
import { useToast } from '../../state/toast';

const tone: Record<ComplaintStatus, Tone> = { OPEN: 'amber', IN_PROGRESS: 'blue', RESOLVED: 'green', REJECTED: 'red' };
const categories: ComplaintCategory[] = ['ACADEMIC', 'ATTENDANCE', 'FEES', 'FACILITIES', 'OTHER'];

export default function Complaints() {
  const q = useComplaints();
  const qc = useQueryClient();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ComplaintCategory>('ACADEMIC');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const create = useMutation({
    mutationFn: () => api.post('/complaints', { category, title: title.trim(), description: description.trim() }),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Complaint submitted', message: 'The department will review it and update the status here.' });
      setOpen(false); setTitle(''); setDescription(''); setCategory('ACADEMIC');
      void qc.invalidateQueries({ queryKey: [...keys.complaints] });
    },
    onError: (e: Error) => toast.push({ tone: 'error', title: 'Could not submit', message: e.message }),
  });

  return (
    <div>
      <PageHeader title="Complaints" subtitle="Raise an issue and track it from open to resolved." actions={<Button icon={Plus} onClick={() => setOpen(true)}>New complaint</Button>} />
      <Async query={q}>
        {(list) => list.length === 0 ? (
          <EmptyState icon={LifeBuoy} title="No complaints" text="Anything wrong with marks, attendance, fees or facilities? Tell us." action={<Button icon={Plus} onClick={() => setOpen(true)}>New complaint</Button>} />
        ) : (
          <div className="space-y-3">
            {list.map((c) => (
              <Card key={c.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{c.category}</p><h3 className="font-semibold text-slate-900 dark:text-white">{c.title}</h3></div>
                  <Badge tone={tone[c.status]}>{c.status.replace('_', ' ')}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{c.description}</p>
                <p className="mt-3 text-xs text-slate-500">Submitted {fmtDate(c.createdAt)}{c.assignedToName ? ` · handled by ${c.assignedToName}` : ' · waiting to be assigned'}</p>
                {c.resolution && (
                  <div className={`mt-3 rounded-xl p-3 text-sm ${c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200' : 'bg-red-50 text-red-900 dark:bg-red-500/10 dark:text-red-200'}`}>
                    <span className="font-semibold">Response: </span>{c.resolution}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Async>

      <Modal open={open} onClose={() => setOpen(false)} title="New complaint"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button icon={Send} loading={create.isPending} disabled={title.trim().length === 0 || description.trim().length === 0} onClick={() => create.mutate()}>Submit</Button></>}>
        <div className="space-y-4">
          <Field label="Category">
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value as ComplaintCategory)}>
              {categories.map((c) => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
            </select>
          </Field>
          <Field label="Title"><input className="input" maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short summary" /></Field>
          <Field label="Details"><textarea className="input min-h-28 resize-y" maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue" /></Field>
        </div>
      </Modal>
    </div>
  );
}
