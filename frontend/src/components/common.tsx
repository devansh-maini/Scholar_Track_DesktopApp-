import { ChevronLeft, ChevronRight, FileSpreadsheet, FileText, Search, Table2 } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { download } from '../lib/api';
import { errMsg } from '../lib/errors';
import { useTeaching } from '../lib/staff';
import type { RiskLevel, TeachingDto } from '../lib/types';
import { useToast } from '../state/toast';
import { Badge, Button, Card, Field, Skeleton, cn } from './ui';
import type { Tone } from './ui';

/* ------------------------------------------------------------------ */
/* Small utilities                                                      */
/* ------------------------------------------------------------------ */
export function useDebounced<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export const riskTone: Record<RiskLevel, Tone> = { LOW: 'green', MEDIUM: 'amber', HIGH: 'red' };

export function RiskBadge({ level, score }: { level: RiskLevel; score?: number }) {
  return <Badge tone={riskTone[level]}>{level}{score !== undefined ? ` · ${score}` : ''}</Badge>;
}

/** Local "yyyy-mm-dd" (not UTC) so the default date is the teacher's today. */
export function todayIso(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* ------------------------------------------------------------------ */
/* Tables                                                               */
/* ------------------------------------------------------------------ */
export function TableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10', className)}><table className="w-full min-w-[560px] text-sm">{children}</table></div>;
}
export function Th({ children, right, className }: { children?: ReactNode; right?: boolean; className?: string }) {
  return <th className={cn('whitespace-nowrap bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-white/5 dark:text-slate-400', right ? 'text-right' : 'text-left', className)}>{children}</th>;
}
export function Td({ children, right, className, colSpan }: { children?: ReactNode; right?: boolean; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={cn('border-t border-slate-100 px-4 py-2.5 text-slate-700 dark:border-white/5 dark:text-slate-200', right && 'text-right', className)}>{children}</td>;
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return <Card><div className="space-y-3">{Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-5 w-full" />)}</div></Card>;
}

/* ------------------------------------------------------------------ */
/* Inputs                                                               */
/* ------------------------------------------------------------------ */
export function SearchBox({ value, onChange, placeholder = 'Search…', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input className="input !pl-10" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function Pager({ page, totalPages, total, onChange }: { page: number; totalPages: number; total: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return <p className="mt-3 text-xs text-slate-500">{total} record{total === 1 ? '' : 's'}</p>;
  return (
    <div className="mt-3 flex items-center justify-between">
      <p className="text-xs text-slate-500">{total} records · page {page + 1} of {totalPages}</p>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" icon={ChevronLeft} disabled={page === 0} onClick={() => onChange(page - 1)}>Prev</Button>
        <Button size="sm" variant="secondary" icon={ChevronRight} disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Teacher class / subject picker                                       */
/* ------------------------------------------------------------------ */
export interface ClassSubject { classId: number | null; subjectId: number | null }

/** Distinct classes (and the subjects taught in the chosen class) from the teacher's own teaching assignments. */
export function useTeachingOptions(sel: ClassSubject) {
  const q = useTeaching();
  const list: TeachingDto[] = useMemo(() => q.data ?? [], [q.data]);
  const classes = useMemo(() => {
    const m = new Map<number, string>();
    list.forEach((a) => m.set(a.classId, a.className));
    return [...m.entries()].map(([id, name]) => ({ id, name }));
  }, [list]);
  const subjects = useMemo(() => list.filter((a) => a.classId === sel.classId).map((a) => ({ id: a.subjectId, label: `${a.subjectCode} · ${a.subjectName}` })), [list, sel.classId]);
  return { query: q, classes, subjects };
}

/** Class + subject dropdowns. Selects the first available option automatically so screens are never empty by default. */
export function ClassSubjectPicker({ value, onChange, withSubject = true }: { value: ClassSubject; onChange: (v: ClassSubject) => void; withSubject?: boolean }) {
  const { query, classes, subjects } = useTeachingOptions(value);

  useEffect(() => {
    if (!query.data || classes.length === 0) return;
    const classId = value.classId !== null && classes.some((c) => c.id === value.classId) ? value.classId : classes[0].id;
    const subs = query.data.filter((a) => a.classId === classId);
    const subjectId = withSubject ? (subs.some((s) => s.subjectId === value.subjectId) ? value.subjectId : subs[0]?.subjectId ?? null) : null;
    if (classId !== value.classId || subjectId !== value.subjectId) onChange({ classId, subjectId });
  }, [query.data, classes, value.classId, value.subjectId, withSubject, onChange]);

  if (query.isPending) return <Skeleton className="h-10 w-80" />;
  if (query.isError) return <p className="text-sm text-red-600">{query.error.message}</p>;
  if (classes.length === 0) return <p className="text-sm text-slate-500">You have no classes assigned yet. Ask the HOD to assign you a subject and class.</p>;
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Class">
        <select className="input min-w-44" value={value.classId ?? ''} onChange={(e) => onChange({ classId: Number(e.target.value), subjectId: null })}>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      {withSubject && (
        <Field label="Subject">
          <select className="input min-w-64" value={value.subjectId ?? ''} onChange={(e) => onChange({ ...value, subjectId: Number(e.target.value) })}>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Report download card                                                 */
/* ------------------------------------------------------------------ */
const formats = [
  { key: 'pdf', label: 'PDF', icon: FileText },
  { key: 'xlsx', label: 'Excel', icon: FileSpreadsheet },
  { key: 'csv', label: 'CSV', icon: Table2 },
] as const;

export function ReportCard({ title, text, path, query = '', children }: { title: string; text: string; path: string; query?: string; children?: ReactNode }) {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  async function get(format: string) {
    setBusy(format);
    try {
      const name = await download(`${path}?format=${format}${query ? `&${query}` : ''}`);
      toast.push({ tone: 'success', title: 'Report downloaded', message: name });
    } catch (e) {
      toast.push({ tone: 'error', title: 'Download failed', message: errMsg(e) });
    } finally { setBusy(null); }
  }
  return (
    <Card>
      <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{text}</p>
      {children && <div className="mt-3">{children}</div>}
      <div className="mt-4 flex flex-wrap gap-2">
        {formats.map(({ key, label, icon }) => (
          <Button key={key} size="sm" variant="secondary" icon={icon} loading={busy === key} disabled={busy !== null} onClick={() => void get(key)}>{label}</Button>
        ))}
      </div>
    </Card>
  );
}
