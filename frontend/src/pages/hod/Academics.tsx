import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { TableSkeleton, Td, TableWrap, Th } from '../../components/common';
import { Async, Button, Card, EmptyState, Field, Modal, PageHeader, Tabs } from '../../components/ui';
import { api } from '../../lib/api';
import { errMsg } from '../../lib/errors';
import { useClasses, useDepartments, useSubjects } from '../../lib/staff';
import { useToast } from '../../state/toast';

type Tab = 'DEPARTMENTS' | 'CLASSES' | 'SUBJECTS';

function DepartmentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast(); const qc = useQueryClient();
  const [code, setCode] = useState(''); const [name, setName] = useState('');
  const m = useMutation({
    mutationFn: () => api.post('/hod/departments', { code: code.trim(), name: name.trim() }),
    onSuccess: () => { toast.push({ tone: 'success', message: 'Department created.' }); setCode(''); setName(''); void qc.invalidateQueries({ queryKey: ['departments'] }); onClose(); },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not create department', message: errMsg(e) }),
  });
  return (
    <Modal open={open} onClose={onClose} title="New department" footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon={Plus} loading={m.isPending} disabled={!code.trim() || !name.trim()} onClick={() => m.mutate()}>Create</Button></>}>
      <div className="space-y-4">
        <Field label="Code" hint="Short code, e.g. CSE"><input className="input" maxLength={20} value={code} onChange={(e) => setCode(e.target.value)} /></Field>
        <Field label="Name"><input className="input" maxLength={120} value={name} onChange={(e) => setName(e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

function ClassModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast(); const qc = useQueryClient();
  const departments = useDepartments();
  const [f, setF] = useState({ name: '', section: 'A', semesterNo: '1', academicYear: '2026-27', departmentId: '' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((c) => ({ ...c, [k]: e.target.value }));
  const departmentId = f.departmentId || String(departments.data?.[0]?.id ?? '');
  const m = useMutation({
    mutationFn: () => api.post('/hod/classes', { name: f.name.trim(), section: f.section.trim(), semesterNo: Number(f.semesterNo), academicYear: f.academicYear.trim(), departmentId: Number(departmentId) }),
    onSuccess: () => { toast.push({ tone: 'success', message: 'Class created.' }); setF({ ...f, name: '' }); void qc.invalidateQueries({ queryKey: ['classes'] }); onClose(); },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not create class', message: errMsg(e) }),
  });
  const sem = Number(f.semesterNo);
  return (
    <Modal open={open} onClose={onClose} title="New class" footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon={Plus} loading={m.isPending} disabled={!f.name.trim() || !f.section.trim() || !f.academicYear.trim() || !(sem >= 1 && sem <= 12) || !departmentId} onClick={() => m.mutate()}>Create</Button></>}>
      <div className="space-y-4">
        <Field label="Class name" hint="e.g. CSE-A Sem 5"><input className="input" maxLength={80} value={f.name} onChange={set('name')} /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Section"><input className="input" maxLength={10} value={f.section} onChange={set('section')} /></Field>
          <Field label="Semester"><input type="number" min={1} max={12} className="input" value={f.semesterNo} onChange={set('semesterNo')} /></Field>
          <Field label="Academic year"><input className="input" maxLength={20} value={f.academicYear} onChange={set('academicYear')} /></Field>
        </div>
        <Field label="Department"><select className="input" value={departmentId} onChange={set('departmentId')}>{(departments.data ?? []).map((d) => <option key={d.id} value={d.id}>{d.code} · {d.name}</option>)}</select></Field>
      </div>
    </Modal>
  );
}

function SubjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast(); const qc = useQueryClient();
  const departments = useDepartments();
  const [f, setF] = useState({ code: '', name: '', credits: '4', semesterNo: '1', departmentId: '' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((c) => ({ ...c, [k]: e.target.value }));
  const departmentId = f.departmentId || String(departments.data?.[0]?.id ?? '');
  const credits = Number(f.credits); const sem = Number(f.semesterNo);
  const m = useMutation({
    mutationFn: () => api.post('/hod/subjects', { code: f.code.trim(), name: f.name.trim(), credits, semesterNo: sem, departmentId: Number(departmentId) }),
    onSuccess: () => { toast.push({ tone: 'success', message: 'Subject created.' }); setF({ ...f, code: '', name: '' }); void qc.invalidateQueries({ queryKey: ['subjects'] }); onClose(); },
    onError: (e) => toast.push({ tone: 'error', title: 'Could not create subject', message: errMsg(e) }),
  });
  return (
    <Modal open={open} onClose={onClose} title="New subject" footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon={Plus} loading={m.isPending} disabled={!f.code.trim() || !f.name.trim() || !(credits >= 1 && credits <= 10) || !(sem >= 1 && sem <= 12) || !departmentId} onClick={() => m.mutate()}>Create</Button></>}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Code"><input className="input" maxLength={20} value={f.code} onChange={set('code')} /></Field>
          <Field label="Credits" hint="1 to 10"><input type="number" min={1} max={10} className="input" value={f.credits} onChange={set('credits')} /></Field>
          <Field label="Semester"><input type="number" min={1} max={12} className="input" value={f.semesterNo} onChange={set('semesterNo')} /></Field>
        </div>
        <Field label="Name"><input className="input" maxLength={150} value={f.name} onChange={set('name')} /></Field>
        <Field label="Department"><select className="input" value={departmentId} onChange={set('departmentId')}>{(departments.data ?? []).map((d) => <option key={d.id} value={d.id}>{d.code} · {d.name}</option>)}</select></Field>
      </div>
    </Modal>
  );
}

export default function Academics() {
  const [tab, setTab] = useState<Tab>('CLASSES');
  const [modal, setModal] = useState<Tab | null>(null);
  const departments = useDepartments();
  const classes = useClasses();
  const subjects = useSubjects();
  const addLabel = tab === 'DEPARTMENTS' ? 'New department' : tab === 'CLASSES' ? 'New class' : 'New subject';

  return (
    <div>
      <PageHeader title="Departments, classes & subjects" subtitle="The academic structure everything else hangs on. Create it here, then add students and assign teachers." actions={<Button icon={Plus} onClick={() => setModal(tab)}>{addLabel}</Button>} />
      <div className="mb-5"><Tabs<Tab> value={tab} onChange={setTab} options={[
        { value: 'CLASSES', label: 'Classes', count: classes.data?.length }, { value: 'SUBJECTS', label: 'Subjects', count: subjects.data?.length }, { value: 'DEPARTMENTS', label: 'Departments', count: departments.data?.length }]} /></div>

      {tab === 'DEPARTMENTS' && (
        <Async query={departments} skeleton={<TableSkeleton />}>
          {(list) => list.length === 0 ? <EmptyState title="No departments" /> : (
            <Card className="!p-0"><TableWrap className="border-0"><thead><tr><Th>Code</Th><Th>Name</Th></tr></thead>
              <tbody>{list.map((d) => <tr key={d.id}><Td className="font-mono text-xs">{d.code}</Td><Td className="font-medium text-slate-900 dark:text-white">{d.name}</Td></tr>)}</tbody></TableWrap></Card>
          )}
        </Async>
      )}
      {tab === 'CLASSES' && (
        <Async query={classes} skeleton={<TableSkeleton />}>
          {(list) => list.length === 0 ? <EmptyState title="No classes" /> : (
            <Card className="!p-0"><TableWrap className="border-0"><thead><tr><Th>Class</Th><Th>Section</Th><Th right>Semester</Th><Th>Academic year</Th></tr></thead>
              <tbody>{list.map((c) => <tr key={c.id}><Td className="font-medium text-slate-900 dark:text-white">{c.name}</Td><Td>{c.section}</Td><Td right>{c.semesterNo}</Td><Td>{c.academicYear}</Td></tr>)}</tbody></TableWrap></Card>
          )}
        </Async>
      )}
      {tab === 'SUBJECTS' && (
        <Async query={subjects} skeleton={<TableSkeleton />}>
          {(list) => list.length === 0 ? <EmptyState title="No subjects" /> : (
            <Card className="!p-0"><TableWrap className="border-0"><thead><tr><Th>Code</Th><Th>Name</Th><Th right>Credits</Th><Th right>Semester</Th></tr></thead>
              <tbody>{[...list].sort((a, b) => a.semesterNo - b.semesterNo || a.code.localeCompare(b.code)).map((s) => <tr key={s.id}><Td className="font-mono text-xs">{s.code}</Td><Td className="font-medium text-slate-900 dark:text-white">{s.name}</Td><Td right>{s.credits}</Td><Td right>{s.semesterNo}</Td></tr>)}</tbody></TableWrap></Card>
          )}
        </Async>
      )}
      <DepartmentModal open={modal === 'DEPARTMENTS'} onClose={() => setModal(null)} />
      <ClassModal open={modal === 'CLASSES'} onClose={() => setModal(null)} />
      <SubjectModal open={modal === 'SUBJECTS'} onClose={() => setModal(null)} />
    </div>
  );
}
