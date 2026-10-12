import { FileSpreadsheet, FileText, Table2 } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, PageHeader } from '../../components/ui';
import { download } from '../../lib/api';
import { useToast } from '../../state/toast';

const formats = [
  { key: 'pdf', label: 'PDF', icon: FileText, hint: 'Best for printing and sharing' },
  { key: 'xlsx', label: 'Excel', icon: FileSpreadsheet, hint: 'One sheet per section' },
  { key: 'csv', label: 'CSV', icon: Table2, hint: 'Plain data for any tool' },
] as const;

export default function Reports() {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function get(format: string) {
    setBusy(format);
    try {
      const name = await download(`/reports/student/me?format=${format}`);
      toast.push({ tone: 'success', title: 'Report downloaded', message: name });
    } catch (e) {
      toast.push({ tone: 'error', title: 'Download failed', message: e instanceof Error ? e.message : 'Unknown error' });
    } finally { setBusy(null); }
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle="Download your official academic report. It uses the same records and formulas as every other screen." />
      <Card className="max-w-3xl">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My academic report</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Profile, SGPA and CGPA, attendance by subject, marks, subject results, previous semesters and fees.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {formats.map(({ key, label, icon: Icon, hint }) => (
            <div key={key} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
              <Icon className="h-6 w-6 text-brand-600" />
              <p className="mt-2 font-semibold text-slate-900 dark:text-white">{label}</p>
              <p className="mb-3 text-xs text-slate-500">{hint}</p>
              <Button size="sm" variant="secondary" className="w-full" loading={busy === key} disabled={busy !== null} onClick={() => void get(key)}>Download</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
