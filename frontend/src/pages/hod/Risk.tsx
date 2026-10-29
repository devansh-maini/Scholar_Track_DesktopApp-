import { useQuery } from '@tanstack/react-query';
import { GitCompareArrows } from 'lucide-react';
import { useState } from 'react';
import { RiskBadge, Pager, TableSkeleton, Td, TableWrap, Th } from '../../components/common';
import { Async, Badge, Button, Card, EmptyState, Modal, PageHeader, Tabs, attendanceTone } from '../../components/ui';
import { api } from '../../lib/api';
import { num, pct } from '../../lib/format';
import { H } from '../../lib/staff';
import type { Page, RiskLevel, StudentRow } from '../../lib/types';
import StudentDetail from './StudentDetail';

type Filter = 'ALL' | RiskLevel | 'LOW_ATT';
const MAX_COMPARE = 5;

function CompareModal({ ids, onClose }: { ids: number[] | null; onClose: () => void }) {
  const q = useQuery({ queryKey: [H, 'compare', ids], queryFn: () => api.get<StudentRow[]>(`/hod/analytics/compare?studentIds=${ids!.join(',')}`), enabled: ids !== null && ids.length > 0 });
  return (
    <Modal open={ids !== null} onClose={onClose} size="xl" title="Compare students" footer={<Button onClick={onClose}>Close</Button>}>
      <Async query={q} skeleton={<TableSkeleton rows={4} />}>
        {(rows) => (
          <TableWrap>
            <thead><tr><Th>Measure</Th>{rows.map((r) => <Th key={r.studentId} right>{r.name}</Th>)}</tr></thead>
            <tbody>
              {([
                ['Roll number', (r: StudentRow) => r.rollNo], ['Class', (r: StudentRow) => r.className],
                ['Attendance', (r: StudentRow) => pct(r.attendancePct)], ['Marks', (r: StudentRow) => pct(r.marksPct)],
                ['Assignments done', (r: StudentRow) => pct(r.assignmentCompletionPct, 0)], ['SGPA', (r: StudentRow) => num(r.sgpa)],
                ['CGPA', (r: StudentRow) => num(r.cgpa)], ['Risk score', (r: StudentRow) => `${r.riskScore} (${r.riskLevel})`],
              ] as const).map(([name, fn]) => <tr key={name}><Td className="font-medium">{name}</Td>{rows.map((r) => <Td key={r.studentId} right>{fn(r)}</Td>)}</tr>)}
            </tbody>
          </TableWrap>
        )}
      </Async>
    </Modal>
  );
}

export default function Risk() {
  const [filter, setFilter] = useState<Filter>('HIGH');
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const [comparing, setComparing] = useState<number[] | null>(null);

  const paged = useQuery({
    queryKey: [H, 'risk-list', filter, page],
    queryFn: () => api.get<Page<StudentRow>>(`/hod/analytics/risk?${filter === 'ALL' || filter === 'LOW_ATT' ? '' : `level=${filter}&`}page=${page}&size=15`),
    enabled: filter !== 'LOW_ATT',
  });
  const low = useQuery({ queryKey: [H, 'low-attendance'], queryFn: () => api.get<StudentRow[]>('/hod/analytics/low-attendance'), enabled: filter === 'LOW_ATT' });
  const toggle = (id: number) => setPicked((p) => p.includes(id) ? p.filter((x) => x !== id) : p.length >= MAX_COMPARE ? p : [...p, id]);

  const table = (rows: StudentRow[]) => rows.length === 0 ? <EmptyState title="No students here" text="Nobody matches this filter right now." /> : (
    <Card className="!p-0">
      <TableWrap className="border-0">
        <thead><tr><Th /><Th>Student</Th><Th>Class</Th><Th right>Attendance</Th><Th right>Marks</Th><Th right>Assignments</Th><Th right>CGPA</Th><Th right>Risk</Th></tr></thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.studentId} className="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-white/5" onClick={() => setOpen(s.studentId)}>
              <Td><input type="checkbox" aria-label={`Select ${s.name} for comparison`} checked={picked.includes(s.studentId)} disabled={!picked.includes(s.studentId) && picked.length >= MAX_COMPARE}
                onClick={(e) => e.stopPropagation()} onChange={() => toggle(s.studentId)} /></Td>
              <Td><p className="font-medium text-slate-900 dark:text-white">{s.name}</p><p className="font-mono text-xs text-slate-500">{s.rollNo}</p></Td><Td>{s.className}</Td>
              <Td right><Badge tone={attendanceTone(s.attendancePct)}>{pct(s.attendancePct)}</Badge></Td><Td right>{pct(s.marksPct)}</Td><Td right>{pct(s.assignmentCompletionPct, 0)}</Td>
              <Td right>{num(s.cgpa)}</Td><Td right><RiskBadge level={s.riskLevel} score={s.riskScore} /></Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </Card>
  );

  return (
    <div>
      <PageHeader title="Student risk" subtitle="A transparent rule-based score (attendance 35%, marks 30%, assignments 15%, previous CGPA 10%, SGPA trend 10%). It highlights who may need help; it is not a prediction."
        actions={<Button icon={GitCompareArrows} disabled={picked.length < 2} onClick={() => setComparing(picked)}>Compare{picked.length ? ` (${picked.length})` : ''}</Button>} />
      <div className="mb-5"><Tabs<Filter> value={filter} onChange={(f) => { setFilter(f); setPage(0); }} options={[
        { value: 'HIGH', label: 'High' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'LOW', label: 'Low' }, { value: 'ALL', label: 'Everyone' }, { value: 'LOW_ATT', label: 'Below 75% attendance' }]} /></div>
      {filter === 'LOW_ATT' ? <Async query={low} skeleton={<TableSkeleton />}>{(rows) => table(rows)}</Async> : (
        <Async query={paged} skeleton={<TableSkeleton />}>
          {(p) => (<>{table(p.content)}<Pager page={p.page} totalPages={p.totalPages} total={p.totalElements} onChange={setPage} /></>)}
        </Async>
      )}
      <p className="mt-3 text-xs text-slate-500">Tick up to {MAX_COMPARE} students to compare them side by side. Click a row for the full profile.</p>
      <StudentDetail studentId={open} onClose={() => setOpen(null)} />
      <CompareModal ids={comparing} onClose={() => setComparing(null)} />
    </div>
  );
}
