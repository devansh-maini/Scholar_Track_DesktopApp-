import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Plus, Send, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { TableSkeleton } from '../../components/common';
import { Async, Badge, Button, Card, EmptyState, Field, Modal, PageHeader } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { api } from '../../lib/api';
import { errMsg } from '../../lib/errors';
import { fmtDate, timeAgo } from '../../lib/format';
import { useClasses, useDepartments, useStaffNotices, useSubjects, useTeaching } from '../../lib/staff';
import type { NoticeDto, NoticeTargetType, Priority } from '../../lib/types';
import { useAuth } from '../../state/auth';
import { useToast } from '../../state/toast';

const priorityTone: Record<Priority, Tone> = { NORMAL: 'slate', IMPORTANT: 'amber', URGENT: 'red' };
const hodTargets: { value: NoticeTargetType; label: string }[] = [
  { value: 'ALL', label: 'Everyone' }, { value: 'STUDENTS', label: 'All students' }, { value: 'TEACHERS', label: 'All teachers' },
  { value: 'DEPARTMENT', label: 'A department' }, { value: 'SEMESTER', label: 'A semester' }, { value: 'CLASS', label: 'A class' }, { value: 'SUBJECT', label: 'A subject' },
];
const teacherTargets: { value: NoticeTargetType; label: string }[] = [{ value: 'CLASS', label: 'One of my classes' }, { value: 'SUBJECT', label: 'One of my subjects' }];

function Composer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const isHod = user?.role === 'HOD';
  const toast = useToast();
  const qc = useQueryClient();
  const departments = useDepartments();
  const classes = useClasses();
  const subjects = useSubjects();
  const teaching = useTeaching();
  const targets = isHod ? hodTargets : teacherTargets;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('NORMAL');
  const [type, setType] = useState<NoticeTargetType>(targets[0].value);
  const [targetId, setTargetId] = useState<string>('');
  const [expiry, setExpiry] = useState('');

  const options = useMemo(() => {
    if (type === 'DEPARTMENT') return (departments.data ?? []).map((d) => ({ id: d.id, label: `${d.code} · ${d.name}` }));
    if (type === 'SEMESTER') return Array.from({ length: 8 }, (_, i) => ({ id: i + 1, label: `Semester ${i + 1}` }));
    if (type === 'CLASS') {
      if (isHod) return (classes.data ?? []).map((c) => ({ id: c.id, label: c.name }));
      const m = new Map<number, string>(); (teaching.data ?? []).forEach((a) => m.set(a.classId, a.className));
      return [...m.entries()].map(([id, label]) => ({ id, label }));
    }
    if (type === 'SUBJECT') {
      if (isHod) return (subjects.data ?? []).map((s) => ({ id: s.id, label: `${s.code} · ${s.name}` }));
      const m = new Map<number, string>(); (teaching.data ?? []).forEach((a) => m.set(a.subjectId, `${a.subjectCode} · ${a.subjectName}`));
      return [...m.entries()].map(([id, label]) => ({ id, label }));
    }
    return [];
  }, [type, isHod, departments.data, classes.data, subjects.data, teaching.data]);

  const needsTarget = !['ALL', 'STUDENTS', 'TEACHERS'].includes(type);
  const effTarget = needsTarget ? (targetId !== '' && options.some((o) => String(o.id) === targetId) ? Number(targetId) : options[0]?.id ?? null) : null;

  const publish = useMutation({
    mutationFn: () => api.post('/notices', { title: title.trim(), description: description.trim(), priority, targetType: type, targetId: effTarget, expiryDate: expiry || null }),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Notice published', message: 'Everyone in the audience is notified live.' });
      setTitle(''); setDescription(''); setExpiry(''); setPriority('NORMAL');
      void qc.invalidateQueries({ queryKey: ['notices'] });
      onClose();
    },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not publish', message: errMsg(e) }),
  });

  return (
    <Modal open={open} onClose={onClose} title="Publish a notice"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button icon={Send} loading={publish.isPending} disabled={!title.trim() || !description.trim() || (needsTarget && effTarget === null)} onClick={() => publish.mutate()}>Publish</Button></>}>
      <div className="space-y-4">
        <Field label="Title"><input className="input" maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Message"><textarea className="input min-h-28 resize-y" maxLength={4000} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Audience">
            <select className="input" value={type} onChange={(e) => { setType(e.target.value as NoticeTargetType); setTargetId(''); }}>
              {targets.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          {needsTarget && (
            <Field label="Which one?">
              <select className="input" value={effTarget ?? ''} onChange={(e) => setTargetId(e.target.value)}>
                {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </Field>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Priority">
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="NORMAL">Normal</option><option value="IMPORTANT">Important</option><option value="URGENT">Urgent</option>
            </select>
          </Field>
          <Field label="Expires on (optional)"><input type="date" className="input" min={new Date().toISOString().slice(0, 10)} value={expiry} onChange={(e) => setExpiry(e.target.value)} /></Field>
        </div>
      </div>
    </Modal>
  );
}

export default function Notices() {
  const { user } = useAuth();
  const isHod = user?.role === 'HOD';
  const q = useStaffNotices();
  const toast = useToast();
  const qc = useQueryClient();
  const [composing, setComposing] = useState(false);

  const del = useMutation({
    mutationFn: (id: number) => api.del(`/notices/${id}`),
    onSuccess: () => { toast.push({ tone: 'success', message: 'Notice deleted.' }); void qc.invalidateQueries({ queryKey: ['notices'] }); },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not delete', message: errMsg(e) }),
  });
  const canDelete = (n: NoticeDto) => isHod || n.authorName === user?.fullName;

  return (
    <div>
      <PageHeader title="Notices" subtitle={isHod ? 'Publish announcements to any audience. Expired notices are hidden from everyone.' : 'Publish notices to your own classes and subjects, and read notices sent to you.'}
        actions={<Button icon={Plus} onClick={() => setComposing(true)}>New notice</Button>} />
      <Async query={q} skeleton={<TableSkeleton />}>
        {(list) => list.length === 0 ? <EmptyState icon={Megaphone} title="No notices" text="Nothing has been published for you yet." /> : (
          <div className="space-y-3">
            {list.map((n) => (
              <Card key={n.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900 dark:text-white">{n.title}</h3><Badge tone={priorityTone[n.priority]}>{n.priority}</Badge>{n.expired && <Badge tone="slate">Expired</Badge>}</div>
                    <p className="mt-0.5 text-xs text-slate-500">{n.authorName} ({n.authorRole}) · {timeAgo(n.createdAt)} · to {n.targetLabel}{n.expiryDate ? ` · expires ${fmtDate(n.expiryDate)}` : ''}</p>
                  </div>
                  {canDelete(n) && <Button size="sm" variant="ghost" icon={Trash2} loading={del.isPending && del.variables === n.id} onClick={() => del.mutate(n.id)}>Delete</Button>}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{n.description}</p>
              </Card>
            ))}
          </div>
        )}
      </Async>
      <Composer open={composing} onClose={() => setComposing(false)} />
    </div>
  );
}
