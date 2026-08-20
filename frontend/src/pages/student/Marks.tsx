import { Trophy } from 'lucide-react';
import { SgpaTrend } from '../../components/charts';
import { Async, Badge, Card, CardHeader, EmptyState, PageHeader, Progress, Skeleton, Stat } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { num, pct } from '../../lib/format';
import { useMarks, useResults } from '../../lib/queries';
import type { AssessmentType, MarkDto } from '../../lib/types';

const gradeTone = (gp: number): Tone => (gp >= 9 ? 'green' : gp >= 7 ? 'teal' : gp >= 5 ? 'amber' : 'red');
const typeLabel: Record<AssessmentType, string> = { MIDTERM: 'Midterm', INTERNAL: 'Internal', ASSIGNMENT: 'Assignment', PRACTICAL: 'Practical' };

export default function Marks() {
  const marks = useMarks();
  const res = useResults();

  return (
    <div className="space-y-6">
      <PageHeader title="Marks & Results" subtitle="Official marks entered by your teachers, with SGPA and CGPA calculated by the system." />

      <Async query={res} skeleton={<div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>}>
        {(r) => (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Stat label={`SGPA · Semester ${r.semesterNo}`} value={num(r.sgpa)} icon={Trophy} tone="teal" hint="Credit-weighted grade points" />
              <Stat label="CGPA" value={num(r.cgpa)} icon={Trophy} tone="violet" hint="Across all semesters" />
              <Stat label="Subjects graded" value={r.subjects.length} icon={Trophy} tone="blue" hint={`${r.subjects.reduce((s, x) => s + x.credits, 0)} credits`} />
            </div>
            <div className="grid gap-6 xl:grid-cols-5">
              <Card className="xl:col-span-3">
                <CardHeader title="Subject results" subtitle="Grade Point Evaluation Scale: 90%+ = 10, 80% = 9, 70% = 8, 60% = 7, 50% = 6, 45% = 5, 40% = 4" />
                {r.subjects.length === 0 ? <EmptyState title="No results yet" text="Results appear once marks are entered." /> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                        <th className="pb-2 font-medium">Subject</th><th className="pb-2 font-medium">Credits</th><th className="pb-2 font-medium">Score</th><th className="pb-2 text-right font-medium">Grade point</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {r.subjects.map((s) => (
                          <tr key={s.subjectId}>
                            <td className="py-3"><p className="font-medium text-slate-800 dark:text-slate-100">{s.subjectName}</p><p className="text-xs text-slate-500">{s.subjectCode}</p></td>
                            <td className="py-3 text-slate-600 dark:text-slate-300">{s.credits}</td>
                            <td className="w-48 py-3"><div className="flex items-center gap-3"><Progress value={s.percentage} tone={gradeTone(s.gradePoint)} /><span className="w-14 text-right font-medium">{pct(s.percentage)}</span></div></td>
                            <td className="py-3 text-right"><Badge tone={gradeTone(s.gradePoint)}>{s.gradePoint}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
              <Card className="xl:col-span-2">
                <CardHeader title="SGPA trend" />
                <SgpaTrend data={[...r.previous.map((p) => ({ label: `Sem ${p.semesterNo}`, sgpa: p.sgpa })), ...(r.sgpa > 0 ? [{ label: `Sem ${r.semesterNo}`, sgpa: r.sgpa }] : [])]} />
              </Card>
            </div>
          </>
        )}
      </Async>

      <Card>
        <CardHeader title="All assessments" subtitle="Midterm, internal, assignment and practical marks" />
        <Async query={marks} skeleton={<Skeleton className="h-40" />}>
          {(list) => {
            if (list.length === 0) return <EmptyState icon={Trophy} title="No marks yet" text="Marks will appear here as soon as a teacher records them." />;
            const grouped = list.reduce<Record<string, MarkDto[]>>((acc, m) => { (acc[m.subjectCode] ??= []).push(m); return acc; }, {});
            return (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(grouped).map(([code, rows]) => (
                  <div key={code} className="rounded-xl border border-slate-100 p-4 dark:border-white/5">
                    <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">{code}</p>
                    <div className="space-y-3">
                      {rows.map((m) => {
                        const p = (m.marks / m.maxMarks) * 100;
                        return (
                          <div key={m.id}>
                            <div className="mb-1 flex justify-between text-xs"><span className="text-slate-500">{typeLabel[m.assessmentType]}</span><span className="font-medium text-slate-800 dark:text-slate-100">{m.marks} / {m.maxMarks}</span></div>
                            <Progress value={p} tone={p >= 75 ? 'green' : p >= 50 ? 'amber' : 'red'} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          }}
        </Async>
      </Card>
    </div>
  );
}
