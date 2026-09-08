import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  GraduationCap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Card } from '../../components/ui';

export default function ReportsHub() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Academic Reports & Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Official academic records, transcripts, departmental performance metrics, and audit summaries.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Transcript / Official Grade Card */}
        <Link to="/reports/academic" className="group">
          <Card className="h-full transition hover:border-brand-500/50 hover:shadow-lg dark:hover:border-brand-400/50">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <GraduationCap className="h-6 w-6" />
              </div>
              <Badge tone="teal">Official</Badge>
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white">
              Student Academic Transcript
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Complete semester grade card, cumulative credits, SGPA progression, and official signature layout.
            </p>
          </Card>
        </Link>

        {/* Attendance Statistics Report */}
        <Link to="/reports/attendance" className="group">
          <Card className="h-full transition hover:border-brand-500/50 hover:shadow-lg dark:hover:border-brand-400/50">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <Badge tone="amber">Audit</Badge>
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-900 group-hover:text-amber-600 dark:text-white">
              Attendance & Absenteeism Report
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Class roster analysis, chronic absenteeism flags, shortfall calculations, and 75% threshold tracking.
            </p>
          </Card>
        </Link>

        {/* Departmental Exam Analytics */}
        <Link to="/reports/performance" className="group">
          <Card className="h-full transition hover:border-brand-500/50 hover:shadow-lg dark:hover:border-brand-400/50">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                <BarChart3 className="h-6 w-6" />
              </div>
              <Badge tone="violet">Analytics</Badge>
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-900 group-hover:text-violet-600 dark:text-white">
              Department Exam Analytics
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pass/fail score distributions, subject strength comparisons, grade curves, and risk distribution.
            </p>
          </Card>
        </Link>

        {/* Fee Payment Audit */}
        <Link to="/reports/fees" className="group">
          <Card className="h-full transition hover:border-brand-500/50 hover:shadow-lg dark:hover:border-brand-400/50">
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CreditCard className="h-6 w-6" />
              </div>
              <Badge tone="green">Finance</Badge>
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-900 group-hover:text-emerald-600 dark:text-white">
              Fee Payment Audit & Ledger
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Collection efficiency, outstanding balance ledgers, overdue fee accounts, and payment history.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}

// Module Cards: Transcripts, Attendance Audit, Department Analytics, Fee Ledgers.
