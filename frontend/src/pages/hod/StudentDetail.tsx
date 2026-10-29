import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, FileText, Table2 } from 'lucide-react';
import { useState } from 'react';
import { Ring, SgpaTrend, levelColor } from '../../components/charts';
import { RiskBadge, Td, TableWrap, Th } from '../../components/common';
import { Async, Badge, Button, Modal, Progress, Skeleton, attendanceTone } from '../../components/ui';
import { api, download } from '../../lib/api';
import { errMsg } from '../../lib/errors';
import { num, pct } from '../../lib/format';
import { H } from '../../lib/staff';
import type { PerformanceDto, StudentRiskDetail } from '../../lib/types';
import { useToast } from '../../state/toast';

const label = (n: string) => n.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

/** Everything the HOD needs about one student: risk breakdown, attendance by subject, results and downloadable reports. */
export default function StudentDetail({ studentId, onClose }: { studentId: number | null; onClose: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const risk = useQuery({ queryKey: [H, 'risk', studentId], queryFn: () => api.get<StudentRiskDetail>(`/hod/analytics/risk/${studentId}`), enabled: studentId !== null });
  const perf = useQuery({ queryKey: [H, 'performance', studentId], queryFn: () => api.get<PerformanceDto>(`/hod/students/${studentId}/performance`), enabled: studentId !== null });

  async function get(format: string) {
    setBusy(format);
    try { toast.push({ tone: 'success', title: 'Report downloaded', message: await download(`/reports/student/${studentId}?format=${format}`) }); }
    catch (e) { toast.push({ tone: 'error', title: 'Download failed', message: errMsg(e) }); }
    finally { setBusy(null); }
  }

  return (
    <Modal open={studentId !== null} onClose={onClose} size="xl" title="Student profile"
      footer={<>
        <Button size="sm" variant="secondary" icon={FileText} loading={busy === 'pdf'} disabled={busy !== null} onClick={() => void get('pdf')}>PDF</Button>
        <Button size="sm" variant="secondary" icon={FileSpreadsheet} loading={busy === 'xlsx'} disabled={busy !== null} onClick={() => void get('xlsx')}>Excel</Button>
        <Button size="sm" variant="secondary" icon={Table2} loading={busy === 'csv'} disabled={busy !== null} onClick={() => void get('csv')}>CSV</Button>
        <Button onClick={onClose}>Close</Button></>}>
      <Async query={risk} skeleton={<Skeleton className="h-64 w-full" />}>
        {(r) => (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-5">
              <Ring value={r.risk.score} size={112} color={levelColor(r.risk.level)}>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{r.risk.score}</span><span className="text-[10px] uppercase tracking-wide text-slate-500">risk score</span>
              </Ring>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{r.student.name}</h3>
                <p className="text-sm text-slate-500"><span className="font-mono">{r.student.rollNo}</span> · {r.student.className} · Semester {r.student.semesterNo}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <RiskBadge level={r.risk.level} />
                  <Badge tone={attendanceTone(r.student.attendancePct)}>Attendance {pct(r.student.attendancePct)}</Badge>
                  <Badge tone="blue">SGPA {num(r.student.sgpa)}</Badge><Badge tone="teal">CGPA {num(r.student.cgpa)}</Badge>
                  <Badge tone="violet">Assignments {pct(r.student.assignmentCompletionPct, 0)}</Badge>
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Why this score</h4>
                {r.risk.reasons.length === 0 ? <p className="text-sm text-slate-500">No risk factors found.</p> : <ul className="ml-5 list-disc space-y-1 text-sm text-slate-700 dark:text-slate-300">{r.risk.reasons.map((x, i) => <li key={i}>{x}</li>)}</ul>}
                {(r.previousCgpa !== null || r.sgpaTrend !== null) && (
                  <p className="mt-3 text-xs text-slate-500">{r.previousCgpa !== null && <>Previous CGPA {num(r.previousCgpa)}. </>}{r.sgpaTrend !== null && <>SGPA change vs. last semester {r.sgpaTrend >= 0 ? '+' : ''}{num(r.sgpaTrend)}.</>}</p>
                )}
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Score breakdown</h4>
                <div className="space-y-3">
                  {r.risk.components.map((c) => (
                    <div key={c.name}>
                      <div className="mb-1 flex justify-between text-xs"><span className="font-medium text-slate-700 dark:text-slate-200">{label(c.name)} <span className="text-slate-400">({(c.weight * 100).toFixed(0)}% weight)</span></span>
                        <span className="text-slate-500">{c.value === null ? 'no data' : num(c.value, 1)} → {c.contribution.toFixed(1)} pts</span></div>
                      <Progress value={c.riskPoints} tone={c.riskPoints >= 55 ? 'red' : c.riskPoints >= 30 ? 'amber' : 'green'} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Async query={perf} skeleton={<Skeleton className="h-40 w-full" />}>
              {(p) => (
                <div className="space-y-5">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Attendance by subject</h4>
                    <TableWrap><thead><tr><Th>Subject</Th><Th right>Attended</Th><Th right>Percent</Th><Th right>Classes to reach 75%</Th></tr></thead>
                      <tbody>{p.attendance.subjects.map((s) => (
                        <tr key={s.subjectId}><Td>{s.subjectCode} · {s.subjectName}</Td><Td right>{s.attended}/{s.total}</Td>
                          <Td right><Badge tone={attendanceTone(s.percent)}>{pct(s.percent)}</Badge></Td><Td right>{s.classesNeededFor75 > 0 ? s.classesNeededFor75 : '—'}</Td></tr>
                      ))}</tbody></TableWrap>
                  </div>
                  <div className="grid gap-5 lg:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Semester {p.results.semesterNo} results · SGPA {num(p.results.sgpa)}</h4>
                      <TableWrap><thead><tr><Th>Subject</Th><Th right>Credits</Th><Th right>Marks</Th><Th right>GP</Th></tr></thead>
                        <tbody>{p.results.subjects.map((s) => (
                          <tr key={s.subjectId}><Td>{s.subjectCode}</Td><Td right>{s.credits}</Td><Td right>{pct(s.percentage)}</Td><Td right>{s.gradePoint}</Td></tr>
                        ))}</tbody></TableWrap>
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">SGPA trend · CGPA {num(p.results.cgpa)}</h4>
                      <SgpaTrend data={[...p.results.previous.map((x) => ({ label: `S${x.semesterNo}`, sgpa: x.sgpa })), { label: `S${p.results.semesterNo}`, sgpa: p.results.sgpa }]} />
                    </div>
                  </div>
                </div>
              )}
            </Async>
          </div>
        )}
      </Async>
    </Modal>
  );
}
