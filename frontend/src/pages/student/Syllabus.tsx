import { CheckCircle2, Circle, ListChecks } from 'lucide-react';
import { Async, Card, EmptyState, PageHeader, Progress, Skeleton } from '../../components/ui';
import { pct } from '../../lib/format';
import { useSyllabus } from '../../lib/queries';

export default function Syllabus() {
  const q = useSyllabus();
  return (
    <div>
      <PageHeader title="Syllabus progress" subtitle="Topics your teachers have completed so far in each subject." />
      <Async query={q} skeleton={<div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-60" /><Skeleton className="h-60" /></div>}>
        {(list) => list.length === 0 ? <EmptyState icon={ListChecks} title="No syllabus yet" /> : (
          <div className="grid gap-4 lg:grid-cols-2">
            {list.map((s) => {
              const units = [...new Set(s.topics.map((t) => t.unitNo))].sort((a, b) => a - b);
              return (
                <Card key={s.subjectId}>
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{s.subjectCode}</p><h3 className="font-semibold text-slate-900 dark:text-white">{s.subjectName}</h3></div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{pct(s.percentComplete, 0)}</span>
                  </div>
                  <Progress value={s.percentComplete} className="mt-3" tone={s.percentComplete >= 60 ? 'green' : s.percentComplete >= 30 ? 'amber' : 'red'} />
                  <p className="mt-1.5 text-xs text-slate-500">{s.topicsDone} of {s.topicsTotal} topics covered</p>
                  <div className="mt-4 space-y-3">
                    {units.map((u) => (
                      <div key={u}>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Unit {u}</p>
                        <ul className="space-y-1">
                          {s.topics.filter((t) => t.unitNo === u).map((t) => (
                            <li key={t.id} className="flex items-start gap-2 text-sm">
                              {t.completed ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />}
                              <span className={t.completed ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}>{t.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Async>
    </div>
  );
}
