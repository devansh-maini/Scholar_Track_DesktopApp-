import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link2, Plus, UserPlus, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { TableSkeleton, Td, TableWrap, Th } from '../../components/common';
import { Async, Button, Card, EmptyState, Field, Modal, PageHeader, Tabs } from '../../components/ui';
import { api } from '../../lib/api';
import { errMsg } from '../../lib/errors';
import { H, useClasses, useDepartments, useSubjects } from '../../lib/staff';
import type { TeacherDto, TeachingDto } from '../../lib/types';
import { useToast } from '../../state/toast';

type Tab = 'TEACHERS' | 'TEACHING';

function CreateTeacher({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const departments = useDepartments();
  const [f, setF] = useState({ fullName: '', username: '', email: '', password: '', employeeCode: '', departmentId: '' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((c) => ({ ...c, [k]: e.target.value }));
  const departmentId = f.departmentId || String(departments.data?.[0]?.id ?? '');
  const valid = f.fullName.trim() && f.username.trim().length >= 3 && /\S+@\S+\.\S+/.test(f.email) && f.password.length >= 6 && f.employeeCode.trim() && departmentId;

  const create = useMutation({
    mutationFn: () => api.post('/hod/teachers', { fullName: f.fullName.trim(), username: f.username.trim(), email: f.email.trim(), password: f.password, employeeCode: f.employeeCode.trim(), departmentId: Number(departmentId) }),
    onSuccess: () => {
      toast.push({ tone: 'success', title: 'Teacher created', message: `${f.fullName.trim()} can now sign in as "${f.username.trim()}".` });
      setF({ fullName: '', username: '', email: '', password: '', employeeCode: '', departmentId: '' });
      void qc.invalidateQueries({ queryKey: [H] });
      onClose();
    },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not create teacher', message: errMsg(e) }),
  });

  return (
    <Modal open={open} onClose={onClose} title="Add a teacher"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon={UserPlus} loading={create.isPending} disabled={!valid} onClick={() => create.mutate()}>Create teacher</Button></>}>
      <div className="space-y-4">
        <Field label="Full name"><input className="input" maxLength={120} value={f.fullName} onChange={set('fullName')} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Username" hint="At least 3 characters"><input className="input" maxLength={50} value={f.username} onChange={set('username')} autoComplete="off" /></Field>
          <Field label="Employee code"><input className="input" maxLength={30} value={f.employeeCode} onChange={set('employeeCode')} /></Field>
        </div>
        <Field label="Email"><input type="email" className="input" value={f.email} onChange={set('email')} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Temporary password" hint="At least 6 characters"><input type="password" className="input" maxLength={72} value={f.password} onChange={set('password')} autoComplete="new-password" /></Field>
          <Field label="Department"><select className="input" value={departmentId} onChange={set('departmentId')}>{(departments.data ?? []).map((d) => <option key={d.id} value={d.id}>{d.code} · {d.name}</option>)}</select></Field>
        </div>
      </div>
    </Modal>
  );
}

function AssignTeaching({ open, onClose, teachers }: { open: boolean; onClose: () => void; teachers: TeacherDto[] }) {
  const toast = useToast();
  const qc = useQueryClient();
  const classes = useClasses();
  const subjects = useSubjects();
  const [teacherId, setTeacherId] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const effClass = classId || String(classes.data?.[0]?.id ?? '');
  const cls = classes.data?.find((c) => String(c.id) === effClass);
  // only offer subjects of the class's semester: the server expects a matching subject
  const subjectOptions = (subjects.data ?? []).filter((s) => !cls || s.semesterNo === cls.semesterNo);
  const effSubject = subjectOptions.some((s) => String(s.id) === subjectId) ? subjectId : String(subjectOptions[0]?.id ?? '');
  const effTeacher = teacherId || String(teachers[0]?.id ?? '');

  const assign = useMutation({
    mutationFn: () => api.post('/hod/assignments', { teacherId: Number(effTeacher), subjectId: Number(effSubject), classId: Number(effClass) }),
    onSuccess: () => { toast.push({ tone: 'success', title: 'Teaching assigned', message: 'The teacher can now manage this class and subject.' }); void qc.invalidateQueries({ queryKey: [H] }); onClose(); },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not assign', message: errMsg(e) }),
  });

  return (
    <Modal open={open} onClose={onClose} title="Assign a teacher to a class and subject"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon={Link2} loading={assign.isPending} disabled={!effTeacher || !effClass || !effSubject} onClick={() => assign.mutate()}>Assign</Button></>}>
      <div className="space-y-4">
        <Field label="Teacher"><select className="input" value={effTeacher} onChange={(e) => setTeacherId(e.target.value)}>{teachers.map((t) => <option key={t.id} value={t.id}>{t.fullName} · {t.employeeCode}</option>)}</select></Field>
        <Field label="Class"><select className="input" value={effClass} onChange={(e) => setClassId(e.target.value)}>{(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name} (Sem {c.semesterNo})</option>)}</select></Field>
        <Field label="Subject" hint="Subjects of the class's semester"><select className="input" value={effSubject} onChange={(e) => setSubjectId(e.target.value)}>{subjectOptions.map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</select></Field>
      </div>
    </Modal>
  );
}

export default function Faculty() {
  const [tab, setTab] = useState<Tab>('TEACHERS');
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const teachers = useQuery({ queryKey: [H, 'teachers'], queryFn: () => api.get<TeacherDto[]>('/hod/teachers') });
  const teaching = useQuery({ queryKey: [H, 'teaching'], queryFn: () => api.get<TeachingDto[]>('/hod/assignments') });

  return (
    <div>
      <PageHeader title="Faculty & teaching" subtitle="Add teachers and decide who teaches which subject to which class. A teacher only sees the classes assigned here."
        actions={tab === 'TEACHERS' ? <Button icon={Plus} onClick={() => setCreating(true)}>Add teacher</Button> : <Button icon={Link2} onClick={() => setAssigning(true)} disabled={!teachers.data?.length}>Assign teaching</Button>} />
      <div className="mb-5"><Tabs<Tab> value={tab} onChange={setTab} options={[{ value: 'TEACHERS', label: 'Teachers', count: teachers.data?.length }, { value: 'TEACHING', label: 'Teaching assignments', count: teaching.data?.length }]} /></div>

      {tab === 'TEACHERS' ? (
        <Async query={teachers} skeleton={<TableSkeleton />}>
          {(list) => list.length === 0 ? <EmptyState icon={UsersRound} title="No teachers yet" action={<Button icon={Plus} onClick={() => setCreating(true)}>Add teacher</Button>} /> : (
            <Card className="!p-0"><TableWrap className="border-0">
              <thead><tr><Th>Code</Th><Th>Name</Th><Th>Username</Th><Th>Email</Th><Th>Department</Th></tr></thead>
              <tbody>{list.map((t) => <tr key={t.id}><Td className="font-mono text-xs">{t.employeeCode}</Td><Td className="font-medium text-slate-900 dark:text-white">{t.fullName}</Td><Td>{t.username}</Td><Td className="text-slate-500">{t.email}</Td><Td>{t.departmentCode}</Td></tr>)}</tbody></TableWrap></Card>
          )}
        </Async>
      ) : (
        <Async query={teaching} skeleton={<TableSkeleton />}>
          {(list) => list.length === 0 ? <EmptyState icon={Link2} title="No teaching assignments" text="Assign a teacher to a subject and class so they can mark attendance and enter marks." /> : (
            <Card className="!p-0"><TableWrap className="border-0">
              <thead><tr><Th>Teacher</Th><Th>Subject</Th><Th>Class</Th></tr></thead>
              <tbody>{list.map((a) => <tr key={a.id}><Td className="font-medium text-slate-900 dark:text-white">{a.teacherName}</Td><Td>{a.subjectCode} · {a.subjectName}</Td><Td>{a.className}</Td></tr>)}</tbody></TableWrap></Card>
          )}
        </Async>
      )}
      <CreateTeacher open={creating} onClose={() => setCreating(false)} />
      <AssignTeaching key={String(assigning)} open={assigning} onClose={() => setAssigning(false)} teachers={teachers.data ?? []} />
    </div>
  );
}
