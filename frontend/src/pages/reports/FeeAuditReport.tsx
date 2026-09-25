import { useState } from 'react';
import { ExportButton } from '../../components/reports/ExportButton';
import { Badge, Card, Skeleton } from '../../components/ui';
import { money } from '../../lib/format';
import { useFeeAuditReport } from '../../lib/reportQueries';

export default function FeeAuditReport() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { data, isLoading } = useFeeAuditReport();

  const filteredFees = data?.fees.filter((f) => statusFilter === 'ALL' || f.status === statusFilter) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Fee Payment Audit & Ledger Summary
          </h1>
          <p className="text-sm text-slate-500">
            Departmental fee collection audit, ledger reconciliations, and outstanding balances.
          </p>
        </div>
        <ExportButton endpoint="/reports/fees" formats={['csv']} />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : data ? (
        <>
          {/* Summary KPIs */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="p-4">
              <span className="text-xs text-slate-400">Total Billed</span>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{money(data.totalBilled)}</p>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-slate-400">Total Collected</span>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{money(data.totalCollected)}</p>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-slate-400">Total Outstanding</span>
              <p className="mt-1 text-2xl font-bold text-rose-500">{money(data.totalOutstanding)}</p>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-slate-400">Overdue Fees</span>
              <p className="mt-1 text-2xl font-bold text-amber-500">{data.overdueCount}</p>
            </Card>
          </div>

          {/* Ledger Table */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-white/10">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Fee Audit Ledger</h2>
              <div className="flex gap-2 text-xs">
                {['ALL', 'OVERDUE', 'PENDING', 'PAID'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-lg px-2.5 py-1 font-medium transition ${
                      statusFilter === st
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Fee Component</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Outstanding</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredFees.map((fee, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-900 dark:text-white">{fee.rollNo}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white">{fee.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{fee.feeTitle}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{money(fee.totalAmount)}</td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">{money(fee.paidAmount)}</td>
                      <td className="py-3 px-4 font-semibold text-rose-500">{money(fee.outstandingAmount)}</td>
                      <td className="py-3 px-4">
                        <Badge
                          tone={
                            fee.status === 'PAID'
                              ? 'green'
                              : fee.status === 'OVERDUE'
                              ? 'red'
                              : fee.status === 'PARTIALLY_PAID'
                              ? 'amber'
                              : 'slate'
                          }
                        >
                          {fee.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">{fee.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}

// Financial Summary: billed, collected, late fees, and overdue balance.
