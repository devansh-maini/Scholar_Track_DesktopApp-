import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { TableSkeleton, Td, TableWrap, Th } from '../../components/common';
import { Async, Card, EmptyState, PageHeader, Progress } from '../../components/ui';
import { api } from '../../lib/api';
import { H } from '../../lib/staff';
import type { SyllabusOverviewRow } from '../../lib/types';

export default function SyllabusProgress() {
  const q = useQuery({ queryKey: [H, 'syllabus'], queryFn: () => api.get<SyllabusOverviewRow[]>('/hod/syllabus-progress') });
  return (
    <div>
      <PageHeader title="Syllabus progress" subtitle="How much of each subject every teacher has covered, updated as teachers tick topics off." />
      <Async query={q} skeleton={<TableSkeleton />}>
        {(rows) => rows.length === 0 ? <EmptyState icon={BookOpen} title="No syllabus data" text="Teachers add topics and mark them complete from their Syllabus page." /> : (
          <Card className="!p-0"><TableWrap className="border-0">
            <thead><tr><Th>Class</Th><Th>Subject</Th><Th>Teacher</Th><Th right>Topics</Th><Th className="w-56">Covered</Th></tr></thead>
            <tbody>{[...rows].sort((a, b) => a.percentComplete - b.percentComplete).map((r) => (
              <tr key={`${r.classId}-${r.subjectId}`}><Td>{r.className}</Td><Td>{r.subjectCode} · {r.subjectName}</Td><Td>{r.teacherName}</Td><Td right>{r.topicsDone}/{r.topicsTotal}</Td>
                <Td><div className="flex items-center gap-2"><Progress value={r.percentComplete} tone={r.percentComplete >= 60 ? 'green' : r.percentComplete >= 30 ? 'amber' : 'red'} /><span className="w-10 text-right text-xs text-slate-500">{r.percentComplete.toFixed(0)}%</span></div></Td></tr>
            ))}</tbody></TableWrap></Card>
        )}
      </Async>
    </div>
  );
}
