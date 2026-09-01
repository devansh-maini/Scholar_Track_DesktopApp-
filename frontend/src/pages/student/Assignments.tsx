import { ClipboardList } from 'lucide-react';
import { Async, Badge, Card, EmptyState, PageHeader } from '../../components/ui';
import { useCoursework } from '../../lib/queries';

export default function Assignments() {
  const q = useCoursework();
  return (
    <div>
      <PageHeader title="Assignments" subtitle="Manage and submit active coursework." />
      <Async query={q}>
        {(list) => list.length === 0 ? <EmptyState icon={ClipboardList} title="No assignments" text="No coursework assigned currently." /> : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((c) => (
              <Card key={c.id}>
                <p className="text-xs font-semibold uppercase text-brand-600">{c.subjectCode}</p>
                <h3 className="font-semibold text-lg">{c.title}</h3>
                <p className="text-xs text-slate-500">Max Marks: {c.maxMarks}</p>
                <Badge className="mt-3">{c.status}</Badge>
              </Card>
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}
