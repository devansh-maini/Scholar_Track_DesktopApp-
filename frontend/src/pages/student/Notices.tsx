import { Megaphone } from 'lucide-react';
import { useState } from 'react';
import { Async, Badge, Card, EmptyState, PageHeader, Tabs, cn } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { fmtDate, timeAgo } from '../../lib/format';
import { useNotices } from '../../lib/queries';
import type { Priority } from '../../lib/types';

type Filter = 'ALL' | Priority;
const tone: Record<Priority, Tone> = { NORMAL: 'slate', IMPORTANT: 'amber', URGENT: 'red' };
const edge: Record<Priority, string> = { NORMAL: 'border-l-slate-300', IMPORTANT: 'border-l-amber-400', URGENT: 'border-l-red-500' };

export default function Notices() {
  const q = useNotices();
  const [filter, setFilter] = useState<Filter>('ALL');
  return (
    <div>
      <PageHeader title="Notices" subtitle="Announcements from your teachers and the department, shown only if they are meant for you." />
      <Async query={q}>
        {(all) => {
          const list = all.filter((n) => filter === 'ALL' || n.priority === filter);
          return (
            <div className="space-y-5">
              <Tabs<Filter> value={filter} onChange={setFilter} options={[
                { value: 'ALL', label: 'All', count: all.length },
                { value: 'URGENT', label: 'Urgent', count: all.filter((n) => n.priority === 'URGENT').length },
                { value: 'IMPORTANT', label: 'Important', count: all.filter((n) => n.priority === 'IMPORTANT').length },
                { value: 'NORMAL', label: 'Normal', count: all.filter((n) => n.priority === 'NORMAL').length }]} />
              {list.length === 0 ? <EmptyState icon={Megaphone} title="No notices" text="You are all caught up." /> : (
                <div className="space-y-3">
                  {list.map((n) => (
                    <Card key={n.id} className={cn('border-l-4', edge[n.priority])}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{n.title}</h3>
                        <div className="flex items-center gap-2"><Badge tone="teal">{n.targetLabel}</Badge><Badge tone={tone[n.priority]}>{n.priority}</Badge></div>
                      </div>
                      <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{n.description}</p>
                      <p className="mt-3 text-xs text-slate-500">{n.authorName} ({n.authorRole.toLowerCase()}) · {timeAgo(n.createdAt)}{n.expiryDate ? ` · expires ${fmtDate(n.expiryDate)}` : ''}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        }}
      </Async>
    </div>
  );
}
