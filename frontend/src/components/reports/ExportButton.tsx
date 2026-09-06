import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { downloadReportFile } from '../../lib/reportQueries';
import { useToast } from '../../state/toast';
import { Button } from '../ui';

interface Props {
  endpoint: string;
  formats?: ('pdf' | 'xlsx' | 'csv')[];
}

export function ExportButton({ endpoint, formats = ['pdf', 'xlsx', 'csv'] }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const { push } = useToast();

  const handleDownload = async (fmt: 'pdf' | 'xlsx' | 'csv') => {
    try {
      setDownloading(fmt);
      const filename = await downloadReportFile(endpoint, fmt);
      push({ tone: 'success', message: `Report downloaded: ${filename}` });
    } catch {
      push({ tone: 'error', message: 'Failed to download report. Check server logs.' });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {formats.includes('pdf') && (
        <Button
          variant="secondary"
          size="sm"
          disabled={downloading !== null}
          onClick={() => handleDownload('pdf')}
          className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400"
        >
          {downloading === 'pdf' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
          PDF
        </Button>
      )}
      {formats.includes('xlsx') && (
        <Button
          variant="secondary"
          size="sm"
          disabled={downloading !== null}
          onClick={() => handleDownload('xlsx')}
          className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
        >
          {downloading === 'xlsx' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
          Excel
        </Button>
      )}
      {formats.includes('csv') && (
        <Button
          variant="secondary"
          size="sm"
          disabled={downloading !== null}
          onClick={() => handleDownload('csv')}
          className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400"
        >
          {downloading === 'csv' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          CSV
        </Button>
      )}
    </div>
  );
}

// Toast feedback: confirms successful file download or displays error toast.
