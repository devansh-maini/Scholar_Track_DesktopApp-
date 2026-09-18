import { CircleDollarSign, Receipt, Wallet } from 'lucide-react';
import { Async, Badge, Card, EmptyState, PageHeader, Progress, Skeleton, Stat } from '../../components/ui';
import type { Tone } from '../../components/ui';
import { fmtDate, fmtDateTime, money } from '../../lib/format';
import { useFees } from '../../lib/queries';
import type { FeeStatus } from '../../lib/types';

const tone: Record<FeeStatus, Tone> = { PAID: 'green', PARTIALLY_PAID: 'blue', PENDING: 'amber', OVERDUE: 'red' };
const label: Record<FeeStatus, string> = { PAID: 'Paid', PARTIALLY_PAID: 'Partially paid', PENDING: 'Pending', OVERDUE: 'Overdue' };

export default function Fees() {
  const q = useFees();
  return (
    <div>
      <PageHeader title="Fees" subtitle="Your fee status and payment history. Payments are recorded by the department office." />
      <Async query={q} skeleton={<div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>}>
        {(f) => (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Stat label="Total billed" value={money(f.totalBilled)} icon={Receipt} tone="slate" hint="Including any late fee" />
              <Stat label="Paid" value={money(f.totalPaid)} icon={CircleDollarSign} tone="green" />
              <Stat label="Outstanding" value={money(f.totalOutstanding)} icon={Wallet} tone={f.totalOutstanding > 0 ? 'red' : 'green'} hint={f.totalOutstanding > 0 ? 'Please clear outstanding fees before the due date to avoid penalties' : 'All fees settled. No outstanding dues.'} />
            </div>
            {f.fees.length === 0 ? <EmptyState icon={Wallet} title="No fees assigned" /> : (
              <div className="grid gap-4 lg:grid-cols-2">
                {f.fees.map((fee) => {
                  const total = fee.totalAmount + fee.lateFeeApplied;
                  return (
                    <Card key={fee.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{fee.title}</h3>
                          <p className="text-xs text-slate-500">Due {fmtDate(fee.dueDate)}</p>
                        </div>
                        <Badge tone={tone[fee.status]}>{label[fee.status]}</Badge>
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <div><p className="text-xs text-slate-500">Outstanding</p><p className="text-2xl font-bold text-slate-900 dark:text-white">{money(fee.outstanding)}</p></div>
                        <p className="text-sm text-slate-500">of {money(total)}</p>
                      </div>
                      <Progress value={total === 0 ? 100 : (fee.paid / total) * 100} tone={tone[fee.status]} className="mt-3" />
                      {fee.lateFeeApplied > 0 && <p className="mt-2 text-xs text-red-600">Includes a late fee of {money(fee.lateFeeApplied)}.</p>}
                      {fee.payments.length > 0 && (
                        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-white/5">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Payment history</p>
                          <ul className="space-y-1.5 text-sm">
                            {fee.payments.map((p) => (
                              <li key={p.id} className="flex justify-between gap-3">
                                <span className="text-slate-600 dark:text-slate-300">{fmtDateTime(p.paidAt)} · {p.method.replace('_', ' ')}{p.reference ? ` · ${p.reference}` : ''}</span>
                                <span className="font-medium text-emerald-600">{money(p.amount)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Async>
    </div>
  );
}
