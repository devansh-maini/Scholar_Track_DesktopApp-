import { useCallback, useMemo, useState } from 'react';
import { ClassSubjectPicker, RiskBadge, SearchBox, TableSkeleton, Td, TableWrap, Th, type ClassSubject } from '../../components/common';
import { Async, Badge, Card, EmptyState, PageHeader, Tabs, attendanceTone } from '../../components/ui';
import { num, pct } from '../../lib/format';
import { useClassPerformance } from '../../lib/staff';
import type { RiskLevel } from '../../lib/types';

type Filter = 'ALL' | RiskLevel | 'LOW_ATT';

export default function TeacherPerformance() {
  const [sel, setSel] = useState<ClassSubject>({ classId: null, subjectId: null });
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const onPick = useCallback((v: ClassSubject) => setSel(v), []);
  const q = useClassPerformance(sel.classId);

  const rows = useMemo(() => {
    const all = q.data ?? [];
    const term = search.trim().toLowerCase();
    return all
      .filter((s) => filter === 'ALL' ? true : filter === 'LOW_ATT' ? s.lowAttendance : s.riskLevel === filter)
      .filter((s) => !term || s.name.toLowerCase().includes(term) || s.rollNo.toLowerCase().includes(term))
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [q.data, filter, search]);
  const count = (f: Filter) => (q.data ?? []).filter((s) => f === 'ALL' ? true : f === 'LOW_ATT' ? s.lowAttendance : s.riskLevel === f).length;

  return (
    <div>
      <PageHeader title="Class performance" subtitle="How each student in your class is doing. The risk score is a transparent rule-based indicator, not a prediction." />
      <Card className="mb-6"><ClassSubjectPicker value={sel} onChange={onPick} withSubject={false} /></Card>
      {sel.classId === null ? null : (
        <Async query={q} skeleton={<TableSkeleton />}>
          {() => (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Tabs<Filter> value={filter} onChange={setFilter} options={[
                  { value: 'ALL', label: 'All', count: count('ALL') }, { value: 'HIGH', label: 'High risk', count: count('HIGH') },
                  { value: 'MEDIUM', label: 'Medium', count: count('MEDIUM') }, { value: 'LOW_ATT', label: 'Below 75%', count: count('LOW_ATT') }]} />
                <SearchBox className="w-72" value={search} onChange={setSearch} placeholder="Search name or roll number" />
              </div>
              {rows.length === 0 ? <EmptyState title="No students match" text="Try another filter." /> : (
                <Card className="!p-0">
                  <TableWrap className="border-0">
                    <thead><tr><Th>Student</Th><Th right>Attendance</Th><Th right>Marks</Th><Th right>Assignments</Th><Th right>SGPA</Th><Th right>CGPA</Th><Th right>Risk</Th></tr></thead>
                    <tbody>
                      {rows.map((s) => (
                        <tr key={s.studentId}>
                          <Td><p className="font-medium text-slate-900 dark:text-white">{s.name}</p><p className="font-mono text-xs text-slate-500">{s.rollNo}</p></Td>
                          <Td right><Badge tone={attendanceTone(s.attendancePct)}>{pct(s.attendancePct)}</Badge><p className="mt-0.5 text-xs text-slate-500">{s.attended}/{s.total}</p></Td>
                          <Td right>{pct(s.marksPct)}</Td><Td right>{pct(s.assignmentCompletionPct, 0)}</Td>
                          <Td right>{num(s.sgpa)}</Td><Td right>{num(s.cgpa)}</Td>
                          <Td right><RiskBadge level={s.riskLevel} score={s.riskScore} /></Td>
                        </tr>
                      ))}
                    </tbody>
                  </TableWrap>
                </Card>
              )}
            </div>
          )}
        </Async>
      )}
    </div>
  );
}
