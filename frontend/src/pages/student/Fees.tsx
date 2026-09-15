import { Wallet } from 'lucide-react';
import { Async, PageHeader, Skeleton, Stat } from '../../components/ui';
import { money } from '../../lib/format';
import { useFees } from '../../lib/queries';

export default function Fees() {
  const q = useFees();
  return (
    <div className="space-y-6">
      <PageHeader title="Fees" subtitle="Review tuition, exam fees, and payment status." />
      <Async query={q} skeleton={<Skeleton className="h-28" />}>
        {(f) => (
          <div className="grid gap-4 md:grid-cols-3">
            <Stat label="Total fee" value={money(f.totalFee)} icon={Wallet} tone="slate" />
            <Stat label="Paid" value={money(f.totalPaid)} icon={Wallet} tone="green" />
            <Stat label="Outstanding" value={money(f.totalOutstanding)} icon={Wallet} tone={f.totalOutstanding > 0 ? 'red' : 'green'} />
          </div>
        )}
      </Async>
    </div>
  );
}
