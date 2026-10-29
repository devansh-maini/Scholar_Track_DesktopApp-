import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, LifeBuoy, UserCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { TableSkeleton } from '../../components/common';
import { Async, Badge, Button, Card, EmptyState, Field, Modal, PageHeader, Tabs } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { api } from '../../lib/api';
import { errMsg } from '../../lib/errors';
import { fmtDate } from '../../lib/format';
import { H, useStaffComplaints } from '../../lib/staff';
import type { ComplaintDto, ComplaintStatus, TeacherDto } from '../../lib/types';
import { useAuth } from '../../state/auth';
import { useToast } from '../../state/toast';

const tone: Record<ComplaintStatus, Tone> = { OPEN: 'amber', IN_PROGRESS: 'blue', RESOLVED: 'green', REJECTED: 'red' };
type Filter = 'ACTIVE' | 'CLOSED' | 'ALL';

function AssignModal({ c, onClose }: { c: ComplaintDto | null; onClose: () => void }) {
  const { user } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const teachers = useQuery({ queryKey: [H, 'teachers'], queryFn: () => api.get<TeacherDto[]>('/hod/teachers'), enabled: c !== null });
  const [who, setWho] = useState('');
  const options = [{ userId: user?.id ?? 0, label: `${user?.fullName ?? 'Me'} (HOD)` }, ...(teachers.data ?? []).map((t) => ({ userId: t.userId, label: `${t.fullName} · ${t.employeeCode}` }))];
  const eff = who || String(options[0].userId);

  const assign = useMutation({
    mutationFn: () => api.put(`/complaints/${c!.id}/assign`, { assigneeUserId: Number(eff) }),
    onSuccess: () => { toast.push({ tone: 'success', message: 'Complaint assigned. The handler and the student are notified.' }); void qc.invalidateQueries({ queryKey: ['complaints'] }); onClose(); },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not assign', message: errMsg(e) }),
  });
  return (
    <Modal open={c !== null} onClose={onClose} title="Assign complaint" footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon={UserCheck} loading={assign.isPending} onClick={() => assign.mutate()}>Assign</Button></>}>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{c?.title}</p>
      <Field label="Handled by"><select className="input" value={eff} onChange={(e) => setWho(e.target.value)}>{options.map((o) => <option key={o.userId} value={o.userId}>{o.label}</option>)}</select></Field>
    </Modal>
  );
}

function CloseModal({ c, onClose }: { c: ComplaintDto | null; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [note, setNote] = useState('');
  const set = useMutation({
    mutationFn: (status: ComplaintStatus) => api.put(`/complaints/${c!.id}/status`, { status, resolution: status === 'IN_PROGRESS' ? null : note.trim() }),
    onSuccess: (_d, status) => { toast.push({ tone: 'success', message: `Complaint marked ${status.replace('_', ' ').toLowerCase()}.` }); setNote(''); void qc.invalidateQueries({ queryKey: ['complaints'] }); onClose(); },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not update', message: errMsg(e) }),
  });
  return (
    <Modal open={c !== null} onClose={onClose} title="Respond to complaint"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" icon={XCircle} loading={set.isPending} disabled={!note.trim()} onClick={() => set.mutate('REJECTED')}>Reject</Button>
        <Button icon={CheckCircle2} loading={set.isPending} disabled={!note.trim()} onClick={() => set.mutate('RESOLVED')}>Resolve</Button></>}>
      <p className="mb-1 font-medium text-slate-900 dark:text-white">{c?.title}</p>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{c?.description}</p>
      <Field label="Resolution note" hint="Required to resolve or reject. The student sees this note, and a closed complaint cannot be reopened.">
        <textarea className="input min-h-24 resize-y" maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
    </Modal>
  );
}

export default function ComplaintsManage() {
  const { user } = useAuth();
  const isHod = user?.role === 'HOD';
  const q = useStaffComplaints();
  const toast = useToast();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>('ACTIVE');
  const [assigning, setAssigning] = useState<ComplaintDto | null>(null);
  const [closing, setClosing] = useState<ComplaintDto | null>(null);

  const start = useMutation({
    mutationFn: (id: number) => api.put(`/complaints/${id}/status`, { status: 'IN_PROGRESS' }),
    onSuccess: () => { toast.push({ tone: 'success', message: 'Marked in progress.' }); void qc.invalidateQueries({ queryKey: ['complaints'] }); },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not update', message: errMsg(e) }),
  });

  return (
    <div>
      <PageHeader title="Complaints" subtitle={isHod ? 'Every complaint in the department. Assign each to a handler and close it with a written resolution.' : 'Complaints the HOD has assigned to you.'} />
      <Async query={q} skeleton={<TableSkeleton />}>
        {(all) => {
          const closed = (c: ComplaintDto) => c.status === 'RESOLVED' || c.status === 'REJECTED';
          const list = all.filter((c) => filter === 'ALL' ? true : filter === 'CLOSED' ? closed(c) : !closed(c));
          return (
            <div className="space-y-5">
              <Tabs<Filter> value={filter} onChange={setFilter} options={[
                { value: 'ACTIVE', label: 'Active', count: all.filter((c) => !closed(c)).length }, { value: 'CLOSED', label: 'Closed', count: all.filter(closed).length }, { value: 'ALL', label: 'All', count: all.length }]} />
              {list.length === 0 ? <EmptyState icon={LifeBuoy} title="Nothing here" text={isHod ? 'No complaints match this filter.' : 'No complaints are assigned to you.'} /> : (
                <div className="space-y-3">
                  {list.map((c) => (
                    <Card key={c.id}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div><p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{c.category}</p><h3 className="font-semibold text-slate-900 dark:text-white">{c.title}</h3></div>
                        <Badge tone={tone[c.status]}>{c.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{c.description}</p>
                      <p className="mt-3 text-xs text-slate-500">From {c.submittedByName} · {fmtDate(c.createdAt)}{c.assignedToName ? ` · handled by ${c.assignedToName}` : ' · unassigned'}</p>
                      {c.resolution && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200"><span className="font-semibold">Resolution: </span>{c.resolution}</p>}
                      {!closed(c) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {isHod && <Button size="sm" variant="secondary" icon={UserCheck} onClick={() => setAssigning(c)}>{c.assignedToName ? 'Reassign' : 'Assign'}</Button>}
                          {c.status === 'OPEN' && c.assignedToName && <Button size="sm" variant="secondary" loading={start.isPending && start.variables === c.id} onClick={() => start.mutate(c.id)}>Start working</Button>}
                          {(c.assignedToName || isHod) && <Button size="sm" onClick={() => setClosing(c)}>Resolve / reject</Button>}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        }}
      </Async>
      <AssignModal c={assigning} onClose={() => setAssigning(null)} />
      <CloseModal key={closing?.id ?? 'none'} c={closing} onClose={() => setClosing(null)} />
    </div>
  );
}
