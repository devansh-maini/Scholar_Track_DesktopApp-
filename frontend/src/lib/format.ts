/** Locale-aware formatting utilities for currency, percentages, and numeric display. */
const dateFmt = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' });

export const fmtDate = (iso: string): string => dateFmt.format(new Date(iso));
export const fmtDateTime = (iso: string): string => `${dateFmt.format(new Date(iso))}, ${timeFmt.format(new Date(iso))}`;
export const money = (n: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
export const pct = (n: number, digits = 1): string => `${n.toFixed(digits)}%`;
export const num = (n: number, digits = 2): string => n.toFixed(digits);

export function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
export const firstName = (full: string): string => full.replace(/^(Dr|Prof)\.?\s+/i, '').split(' ')[0];
export const initials = (name: string): string =>
  name.replace(/^(Dr|Prof)\.?\s+/i, '').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');

/** "due in 3 days" / "due today" / "overdue by 2 days" */
export function dueText(iso: string): { text: string; overdue: boolean; soon: boolean } {
  const ms = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(ms / 86_400_000);
  if (ms < 0) {
    const late = Math.max(1, Math.ceil(-ms / 86_400_000));
    return { text: `overdue by ${late} day${late > 1 ? 's' : ''}`, overdue: true, soon: false };
  }
  if (days <= 1) return { text: 'due today', overdue: false, soon: true };
  return { text: `due in ${days} days`, overdue: false, soon: days <= 3 };
}

export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)} h ago`;
  return fmtDate(iso);
}
