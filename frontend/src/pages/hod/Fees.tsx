import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, IndianRupee, Plus, Receipt, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Pager, SearchBox, TableSkeleton, Td, TableWrap, Th, useDebounced } from '../../components/common';
import { Async, Badge, Button, Card, EmptyState, Field, Modal, PageHeader, Stat, Tabs } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { api } from '../../lib/api';
import { errMsg } from '../../lib/errors';
import { fmtDate, money } from '../../lib/format';
import { H, useClasses } from '../../lib/staff';
import type { FeeDto, FeeStatus, FeeSummary, Page, StudentDto } from '../../lib/types';
import { useToast } from '../../state/toast';

const tone: Record<FeeStatus, Tone> = { PAID: 'green', PARTIALLY_PAID: 'blue', PENDING: 'amber', OVERDUE: 'red' };
type Filter = 'ALL' | FeeStatus;

function CreateFee({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast(); const qc = useQueryClient();
  const classes = useClasses();
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('ALL');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [lateFee, setLateFee] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const effClass = classId || String(classes.data?.[0]?.id ?? '');
  const students = useQuery({ queryKey: [H, 'class-students', effClass], queryFn: () => api.get<StudentDto[]>(`/teachers/me/classes/${effClass}/students`), enabled: open && effClass !== '' });

  const create = useMutation({
    mutationFn: () => api.post<{ created?: number }>('/hod/fees', {
      classId: studentId === 'ALL' ? Number(effClass) : null, studentId: studentId === 'ALL' ? null : Number(studentId),
      title: title.trim(), amount: Number(amount), lateFee: Number(lateFee || 0), dueDate,
    }),
    onSuccess: (r) => {
      toast.push({ tone: 'success', title: 'Fee created', message: r?.created ? `${r.created} students have been billed.` : 'The student has been billed.' });
      setTitle(''); setAmount(''); setLateFee('0'); setDueDate('');
      void qc.invalidateQueries({ queryKey: [H] });
      onClose();
    },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not create fee', message: errMsg(e) }),
  });

  return (
    <Modal open={open} onClose={onClose} title="Create a fee"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon={Plus} loading={create.isPending} disabled={!title.trim() || !(Number(amount) > 0) || !dueDate || !effClass} onClick={() => create.mutate()}>Create</Button></>}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Class"><select className="input" value={effClass} onChange={(e) => { setClassId(e.target.value); setStudentId('ALL'); }}>{(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Bill"><select className="input" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="ALL">Whole class</option>{(students.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.rollNo} · {s.fullName}</option>)}</select></Field>
        </div>
        <Field label="Title"><input className="input" maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Semester 5 tuition" /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Amount (₹)"><input type="number" min={1} className="input" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          <Field label="Late fee (₹)" hint="Added after the due date"><input type="number" min={0} className="input" value={lateFee} onChange={(e) => setLateFee(e.target.value)} /></Field>
          <Field label="Due date"><input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
        </div>
      </div>
    </Modal>
  );
}

function PaymentModal({ fee, onClose }: { fee: FeeDto | null; onClose: () => void }) {
  const toast = useToast(); const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI');
  const [reference, setReference] = useState('');
  const pay = useMutation({
    mutationFn: () => api.post(`/hod/fees/${fee!.id}/payments`, { amount: Number(amount), method, reference: reference.trim() || null }),
    onSuccess: () => { toast.push({ tone: 'success', title: 'Payment recorded', message: `${money(Number(amount))} received from ${fee!.studentName}.` }); setAmount(''); setReference(''); void qc.invalidateQueries({ queryKey: [H] }); onClose(); },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not record payment', message: errMsg(e) }),
  });
  const out = fee ? Number(fee.outstanding) : 0;
  return (
    <Modal open={fee !== null} onClose={onClose} title="Record a payment"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon={CheckCircle2} loading={pay.isPending} disabled={!(Number(amount) > 0) || Number(amount) > out} onClick={() => pay.mutate()}>Record</Button></>}>
      {fee && (<div className="space-y-4">
        <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/5"><p className="font-medium text-slate-900 dark:text-white">{fee.studentName} · {fee.title}</p><p className="text-slate-500">Outstanding {money(out)} · due {fmtDate(fee.dueDate)}</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount (₹)" hint={`Up to ${money(out)}`}><input type="number" min={1} max={out} className="input" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          <Field label="Method"><select className="input" value={method} onChange={(e) => setMethod(e.target.value)}><option value="UPI">UPI</option><option value="CASH">Cash</option><option value="CARD">Card</option><option value="BANK_TRANSFER">Bank transfer</option></select></Field>
        </div>
        <Field label="Reference (optional)"><input className="input" maxLength={60} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Transaction or receipt number" /></Field>
        {fee.payments.length > 0 && <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Earlier payments</p>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">{fee.payments.map((p) => <li key={p.id}>{money(Number(p.amount))} · {p.method} · {fmtDate(p.paidAt)}</li>)}</ul></div>}
      </div>)}
    </Modal>
  );
}

export default function Fees() {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const term = useDebounced(search);
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState<FeeDto | null>(null);
  const summary = useQuery({ queryKey: [H, 'fee-summary'], queryFn: () => api.get<FeeSummary>('/hod/fees/summary') });
  const list = useQuery({ queryKey: [H, 'fees', filter, term, page], queryFn: () => api.get<Page<FeeDto>>(`/hod/fees?${filter === 'ALL' ? '' : `status=${filter}&`}q=${encodeURIComponent(term)}&page=${page}&size=15`) });

  return (
    <div>
      <PageHeader title="Fees" subtitle="Bill a class or a student, record payments, and watch what is overdue. Late fees apply automatically after the due date." actions={<Button icon={Plus} onClick={() => setCreating(true)}>Create fee</Button>} />
      <Async query={summary} skeleton={<div className="mb-6 h-24" />}>
        {(s) => (
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Billed" value={money(Number(s.totalBilled))} hint={`${s.feeCount} fees`} icon={Receipt} tone="blue" />
            <Stat label="Collected" value={money(Number(s.totalCollected))} hint={`${s.fullyPaidCount} fully paid`} icon={IndianRupee} tone="green" />
            <Stat label="Outstanding" value={money(Number(s.totalOutstanding))} icon={Wallet} tone="amber" />
            <Stat label="Overdue" value={s.overdueCount} hint="Past due and unpaid" icon={Wallet} tone={s.overdueCount ? 'red' : 'green'} />
          </div>
        )}
      </Async>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs<Filter> value={filter} onChange={(f) => { setFilter(f); setPage(0); }} options={[{ value: 'ALL', label: 'All' }, { value: 'OVERDUE', label: 'Overdue' }, { value: 'PENDING', label: 'Pending' }, { value: 'PARTIALLY_PAID', label: 'Partial' }, { value: 'PAID', label: 'Paid' }]} />
        <SearchBox className="w-72" value={search} onChange={(v) => { setSearch(v); setPage(0); }} placeholder="Search student or roll number" />
      </div>
      <Async query={list} skeleton={<TableSkeleton />}>
        {(p) => p.content.length === 0 ? <EmptyState icon={Wallet} title="No fees found" text="Create a fee or change the filter." /> : (<>
          <Card className="!p-0"><TableWrap className="border-0">
            <thead><tr><Th>Student</Th><Th>Fee</Th><Th>Due</Th><Th right>Total</Th><Th right>Paid</Th><Th right>Outstanding</Th><Th>Status</Th><Th /></tr></thead>
            <tbody>{p.content.map((f) => (
              <tr key={f.id}><Td><p className="font-medium text-slate-900 dark:text-white">{f.studentName}</p><p className="font-mono text-xs text-slate-500">{f.rollNo}</p></Td><Td>{f.title}</Td><Td>{fmtDate(f.dueDate)}</Td>
                <Td right>{money(Number(f.totalAmount) + Number(f.lateFeeApplied))}</Td><Td right>{money(Number(f.paid))}</Td><Td right className="font-semibold">{money(Number(f.outstanding))}</Td>
                <Td><Badge tone={tone[f.status]}>{f.status.replace('_', ' ')}</Badge></Td>
                <Td right>{Number(f.outstanding) > 0 && <Button size="sm" variant="secondary" onClick={() => setPaying(f)}>Record payment</Button>}</Td></tr>
            ))}</tbody></TableWrap></Card>
          <Pager page={p.page} totalPages={p.totalPages} total={p.totalElements} onChange={setPage} />
        </>)}
      </Async>
      <CreateFee open={creating} onClose={() => setCreating(false)} />
      <PaymentModal key={paying?.id ?? 'none'} fee={paying} onClose={() => setPaying(null)} />
    </div>
  );
}
