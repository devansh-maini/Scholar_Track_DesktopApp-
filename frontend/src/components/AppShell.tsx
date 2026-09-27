import {
  Bell, FileSpreadsheet, CalendarCheck, CheckCheck, ClipboardList, GraduationCap, LayoutDashboard, LifeBuoy, ListChecks, LogOut,
  Megaphone, Moon, Settings as SettingsIcon, Sun, Trophy, UserRound, Wallet, Wifi, WifiOff, type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { initials, timeAgo } from '../lib/format';
import { useAuth } from '../state/auth';
import { useLive } from '../state/live';
import { useTheme } from '../state/theme';
import { Badge, cn } from './ui';

interface NavItem { to: string; label: string; icon: LucideIcon }

const studentNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/marks', label: 'Marks & Results', icon: Trophy },
  { to: '/assignments', label: 'Assignments', icon: ClipboardList },
  { to: '/fees', label: 'Fees', icon: Wallet },
  { to: '/reports', label: 'Reports & Analytics', icon: FileSpreadsheet },
  { to: '/notices', label: 'Notices', icon: Megaphone },
  { to: '/syllabus', label: 'Syllabus', icon: ListChecks },
  { to: '/complaints', label: 'Complaints', icon: LifeBuoy },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

const roleTone = { STUDENT: 'teal', TEACHER: 'violet', HOD: 'amber' } as const;

function LiveStatusPill() {
  const { status } = useLive();
  const online = status === 'online';
  return (
    <div className={cn('flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
      online ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300')}>
      {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      {online ? 'Live updates on' : status === 'connecting' ? 'Connecting…' : 'Reconnecting…'}
    </div>
  );
}

function NotificationBell() {
  const { events, unread, markAllRead } = useLive();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setOpen((o) => !o); if (!open) markAllRead(); }} aria-label="Notifications"
        className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10">
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[360px] animate-fade-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-ink-800">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/10">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Live activity</p>
            <CheckCheck className="h-4 w-4 text-brand-500" />
          </div>
          <div className="max-h-96 overflow-y-auto">
            {events.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-500">Nothing yet. Updates from your teachers and department appear here instantly.</p>}
            {events.map((e) => (
              <div key={e.id} className="border-b border-slate-50 px-4 py-3 last:border-0 dark:border-white/5">
                <p className="text-sm text-slate-800 dark:text-slate-100">{e.message}</p>
                <p className="mt-0.5 text-xs text-slate-400">{timeAgo(e.at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AppShell({ nav = studentNav }: { nav?: NavItem[] }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  if (!user) return null;
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-[264px] shrink-0 flex-col bg-gradient-to-b from-ink-900 via-ink-850 to-ink-900 text-slate-300">
        <div className="flex items-center gap-3 px-6 pb-4 pt-6">
          <div className="rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 p-2.5 shadow-lg shadow-brand-500/30"><GraduationCap className="h-6 w-6 text-white" /></div>
          <div>
            <p className="text-lg font-bold leading-tight tracking-tight text-white">ScholarTrack</p>
            <p className="text-[11px] uppercase tracking-widest text-slate-500">Academic intelligence</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => cn('group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                isActive ? 'bg-brand-500/15 text-white ring-1 ring-brand-400/25' : 'text-slate-400 hover:bg-white/5 hover:text-white')}>
              {({ isActive }) => (<><Icon className={cn('h-[18px] w-[18px]', isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300')} />{label}</>)}
            </NavLink>
          ))}
        </nav>
        <div className="m-3 rounded-2xl bg-white/5 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-sky-500 text-sm font-bold text-white">{initials(user.fullName)}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user.fullName}</p>
              <Badge tone={roleTone[user.role]} className="mt-0.5 !px-2 !py-0 text-[10px]">{user.role}</Badge>
            </div>
            <button onClick={logout} title="Log out" aria-label="Log out" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200/70 bg-white/70 px-8 py-3 backdrop-blur dark:border-white/5 dark:bg-ink-900/70">
          <LiveStatusPill />
          <div className="flex items-center gap-1">
            <button onClick={toggle} aria-label="Toggle dark mode" className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl animate-fade-in p-8"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}

