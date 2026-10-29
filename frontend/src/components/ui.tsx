import clsx from 'clsx';
import { AlertTriangle, Inbox, Loader2, RefreshCw, X } from 'lucide-react';
import { useEffect, type ButtonHTMLAttributes, type ElementType, type ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';

export const cn = clsx;

export type Tone = 'green' | 'red' | 'amber' | 'blue' | 'slate' | 'violet' | 'teal';

const badgeTone: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  red: 'bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
  teal: 'bg-brand-50 text-brand-700 ring-brand-600/15 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-400/20',
};
const solidTone: Record<Tone, string> = {
  green: 'bg-emerald-500', red: 'bg-red-500', amber: 'bg-amber-500', blue: 'bg-sky-500', slate: 'bg-slate-400', violet: 'bg-violet-500', teal: 'bg-brand-500',
};
const iconTone: Record<Tone, string> = {
  green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  red: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  blue: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
  teal: 'bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
};

/** Colour for a percentage against the 75% attendance rule. */
export const attendanceTone = (p: number): Tone => (p >= 75 ? 'green' : p >= 60 ? 'amber' : 'red');

export function Card({ className, children, hover }: { className?: string; children: ReactNode; hover?: boolean }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card dark:border-white/[0.07] dark:bg-ink-800/80 dark:shadow-none',
      hover && 'transition hover:-translate-y-0.5 hover:shadow-lg', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Badge({ tone = 'slate', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', badgeTone[tone], className)}>{children}</span>;
}

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: BtnVariant; loading?: boolean; icon?: ElementType; size?: 'sm' | 'md' }
const btnVariant: Record<BtnVariant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:shadow-glow',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};
export function Button({ variant = 'primary', loading, icon: Icon, size = 'md', className, children, disabled, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn('inline-flex items-center justify-center gap-2 rounded-xl font-medium outline-none transition disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm', btnVariant[variant], className)}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

export function Progress({ value, tone = 'teal', className }: { value: number; tone?: Tone; className?: string }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10', className)}>
      <div className={cn('h-full rounded-full transition-[width] duration-700', solidTone[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Stat({ label, value, hint, icon: Icon, tone = 'teal' }: { label: string; value: ReactNode; hint?: ReactNode; icon: ElementType; tone?: Tone }) {
  return (
    <Card hover className="!p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
        </div>
        <div className={cn('rounded-xl p-2.5', iconTone[tone])}><Icon className="h-5 w-5" /></div>
      </div>
    </Card>
  );
}

export function Skeleton({ className }: { className?: string }) { return <div className={cn('skeleton', className)} />; }

export function SkeletonBlock({ rows = 3 }: { rows?: number }) {
  return (
    <Card>
      <Skeleton className="mb-4 h-5 w-1/3" />
      <div className="space-y-3">{Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-4 w-full" />)}</div>
    </Card>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, text, action }: { icon?: ElementType; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-white/10">
      <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400 dark:bg-white/5"><Icon className="h-6 w-6" /></div>
      <p className="font-semibold text-slate-800 dark:text-slate-100">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">Something went wrong</p>
        <p className="mt-0.5 text-sm text-red-700/90 dark:text-red-300/90">{message}</p>
      </div>
      {onRetry && <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>Retry</Button>}
    </div>
  );
}

/** Renders loading skeleton, error with retry, or the data. Keeps every screen's states consistent. */
export function Async<T>({ query, skeleton, children }: { query: UseQueryResult<T, Error>; skeleton?: ReactNode; children: (data: T) => ReactNode }) {
  if (query.isPending) return <>{skeleton ?? <SkeletonBlock />}</>;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />;
  return <>{children(query.data)}</>;
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: 'md' | 'xl' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" className={cn('relative z-10 flex max-h-[85vh] w-full animate-fade-in flex-col', size === 'xl' ? 'max-w-4xl' : 'max-w-lg', ' rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-ink-800')}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-white/10">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
    </label>
  );
}

export function Tabs<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[] }) {
  return (
    <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={cn('rounded-lg px-3.5 py-1.5 text-sm font-medium transition',
            value === o.value ? 'bg-white text-slate-900 shadow-sm dark:bg-ink-700 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white')}>
          {o.label}{o.count !== undefined && <span className="ml-1.5 text-xs opacity-60">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
