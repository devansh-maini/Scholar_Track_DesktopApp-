import { Trophy } from 'lucide-react';
import { Async, PageHeader, Skeleton, Stat } from '../../components/ui';
import { num } from '../../lib/format';
import { useResults } from '../../lib/queries';

export default function Marks() {
  const res = useResults();
  return (
    <div className="space-y-6">
      <PageHeader title="Marks & Results" subtitle="Official academic performance records." />
      <Async query={res} skeleton={<Skeleton className="h-28" />}>
        {(r) => (
          <div className="grid gap-4 md:grid-cols-2">
            <Stat label={`SGPA · Semester ${r.semesterNo}`} value={num(r.sgpa)} icon={Trophy} tone="teal" hint="Current semester" />
            <Stat label="CGPA" value={num(r.cgpa)} icon={Trophy} tone="violet" hint="Cumulative grade point average" />
          </div>
        )}
      </Async>
    </div>
  );
}
