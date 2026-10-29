import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Plus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Pager, SearchBox, TableSkeleton, Td, TableWrap, Th, useDebounced } from '../../components/common';
import { Async, Button, Card, EmptyState, Field, Modal, PageHeader } from '../../components/ui';
import { api } from '../../lib/api';
import { errMsg } from '../../lib/errors';
import { H, useClasses } from '../../lib/staff';
import type { Page, StudentDto } from '../../lib/types';
import { useToast } from '../../state/toast';
import StudentDetail from './StudentDetail';

function CreateStudent({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const classes = useClasses();
  const [f, setF] = useState({ fullName: '', username: '', email: '', password: '', rollNo: '', classId: '' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((c) => ({ ...c, [k]: e.target.value }));
  const classId = f.classId || String(classes.data?.[0]?.id ?? '');
  const valid = f.fullName.trim() && f.username.trim().length >= 3 && /\S+@\S+\.\S+/.test(f.email) && f.password.length >= 6 && f.rollNo.trim() && classId;

  const create = useMutation({
    mutationFn: () => api.post('/hod/students', { fullName: f.fullName.trim(), username: f.username.trim(), email: f.email.trim(), password: f.password, rollNo: f.rollNo.trim(), classId: Number(classId) }),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Student created', message: `${f.fullName.trim()} can now sign in as "${f.username.trim()}".` });
      setF({ fullName: '', username: '', email: '', password: '', rollNo: '', classId: '' });
      void qc.invalidateQueries({ queryKey: [H] });
      onClose();
    },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not create student', message: errMsg(e) }),
  });

  return (
    <Modal open={open} onClose={onClose} title="Add a student"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon={UserPlus} loading={create.isPending} disabled={!valid} onClick={() => create.mutate()}>Create student</Button></>}>
      <div className="space-y-4">
        <Field label="Full name"><input className="input" maxLength={120} value={f.fullName} onChange={set('fullName')} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Username" hint="At least 3 characters"><input className="input" maxLength={50} value={f.username} onChange={set('username')} autoComplete="off" /></Field>
          <Field label="Roll number"><input className="input" maxLength={30} value={f.rollNo} onChange={set('rollNo')} /></Field>
        </div>
        <Field label="Email"><input type="email" className="input" value={f.email} onChange={set('email')} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Temporary password" hint="At least 6 characters"><input type="password" className="input" maxLength={72} value={f.password} onChange={set('password')} autoComplete="new-password" /></Field>
          <Field label="Class"><select className="input" value={classId} onChange={set('classId')}>{(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        </div>
      </div>
    </Modal>
  );
}

export default function Students() {
  const [search, setSearch] = useState('');
  const term = useDebounced(search);
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const q = useQuery({ queryKey: [H, 'students', term, page], queryFn: () => api.get<Page<StudentDto>>(`/hod/students?q=${encodeURIComponent(term)}&page=${page}&size=15`) });

  return (
    <div>
      <PageHeader title="Students" subtitle="Search the department's students, open a full profile, or add a new student." actions={<Button icon={Plus} onClick={() => setCreating(true)}>Add student</Button>} />
      <SearchBox className="mb-5 max-w-md" value={search} onChange={(v) => { setSearch(v); setPage(0); }} placeholder="Search by name, roll number or username" />
      <Async query={q} skeleton={<TableSkeleton />}>
        {(p) => p.content.length === 0 ? <EmptyState icon={GraduationCap} title="No students found" text="Try another search, or add the student." /> : (
          <>
            <Card className="!p-0"><TableWrap className="border-0">
              <thead><tr><Th>Roll no.</Th><Th>Name</Th><Th>Class</Th><Th right>Sem</Th><Th>Email</Th></tr></thead>
              <tbody>{p.content.map((s) => (
                <tr key={s.id} className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-white/5" onClick={() => setOpen(s.id)}>
                  <Td className="font-mono text-xs">{s.rollNo}</Td><Td className="font-medium text-slate-900 dark:text-white">{s.fullName}</Td><Td>{s.className}</Td><Td right>{s.semesterNo}</Td><Td className="text-slate-500">{s.email}</Td></tr>
              ))}</tbody></TableWrap></Card>
            <Pager page={p.page} totalPages={p.totalPages} total={p.totalElements} onChange={setPage} />
          </>
        )}
      </Async>
      <CreateStudent open={creating} onClose={() => setCreating(false)} />
      <StudentDetail studentId={open} onClose={() => setOpen(null)} />
    </div>
  );
}
