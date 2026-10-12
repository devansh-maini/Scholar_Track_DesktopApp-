import { ArrowRight, BarChart3, CheckCircle2, Eye, EyeOff, GraduationCap, Loader2, LockKeyhole, Server, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Field, cn } from '../components/ui';
import { pingHealth } from '../lib/api';
import { DEFAULT_SERVER, SHOW_DEMO_ACCOUNTS, getServerUrl, normalizeUrl, setServerUrl } from '../lib/config';
import { useAuth } from '../state/auth';

type Health = 'checking' | 'online' | 'waking' | 'offline';

const demo = [
  { label: 'Student', username: 'student', password: 'student123' },
  { label: 'Teacher', username: 'teacher', password: 'teacher123' },
  { label: 'HOD', username: 'hod', password: 'hod123' },
];

const features = [
  { icon: BarChart3, title: 'Live performance insight', text: 'Marks, attendance and risk update the moment a teacher saves them.' },
  { icon: Sparkles, title: 'AI study assistant', text: 'Answers built only from your own authorised academic data.' },
  { icon: ShieldCheck, title: 'Role-based security', text: 'Students, teachers and the HOD each see exactly what they should.' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<Health>('checking');
  const [serverOpen, setServerOpen] = useState(false);
  const [server, setServer] = useState(getServerUrl());

  // Free cloud hosts sleep when idle, so keep polling and tell the user the server is waking up.
  const checkServer = useCallback(async (signal: { cancelled: boolean }) => {
    setHealth('checking');
    for (let i = 0; i < 30 && !signal.cancelled; i++) {
      if (await pingHealth()) { if (!signal.cancelled) setHealth('online'); return; }
      if (!signal.cancelled) setHealth(i >= 1 ? 'waking' : 'checking');
      await new Promise((r) => setTimeout(r, 3000));
    }
    if (!signal.cancelled) setHealth('offline');
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    void checkServer(signal);
    return () => { signal.cancelled = true; };
  }, [checkServer]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function saveServer() {
    setServerUrl(server);
    setServer(normalizeUrl(server));
    void checkServer({ cancelled: false });
  }

  const status = {
    checking: { text: 'Checking server…', cls: 'text-slate-500', icon: <Loader2 className="h-4 w-4 animate-spin" /> },
    online: { text: 'Server online', cls: 'text-emerald-600', icon: <CheckCircle2 className="h-4 w-4" /> },
    waking: { text: 'Waking up the server… this can take up to a minute', cls: 'text-amber-600', icon: <Loader2 className="h-4 w-4 animate-spin" /> },
    offline: { text: 'Server unreachable. Check the address below.', cls: 'text-red-600', icon: <Server className="h-4 w-4" /> },
  }[health];

  return (
    <div className="flex min-h-screen bg-white dark:bg-ink-900">
      <div className="relative hidden w-[46%] overflow-hidden bg-gradient-to-br from-ink-900 via-ink-850 to-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 p-3 shadow-lg shadow-brand-500/30"><GraduationCap className="h-7 w-7" /></div>
          <span className="text-2xl font-bold tracking-tight">ScholarTrack</span>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">Every academic number,<br />one trusted place.</h1>
          <p className="mt-4 max-w-md text-slate-300">Attendance, marks, assignments, fees and AI insight for students, teachers and department heads, always in sync.</p>
          <div className="mt-10 space-y-5">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <div className="h-fit rounded-xl bg-white/10 p-2.5"><Icon className="h-5 w-5 text-brand-300" /></div>
                <div><p className="font-semibold">{title}</p><p className="text-sm text-slate-400">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-slate-500">Java · Spring Boot · PostgreSQL · Groq AI</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 flex items-center gap-2 lg:hidden"><GraduationCap className="h-7 w-7 text-brand-600" /><span className="text-xl font-bold text-slate-900 dark:text-white">ScholarTrack</span></div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Sign in with your college account to continue.</p>

          <div className={cn('mt-5 flex items-center gap-2 text-sm', status.cls)}>{status.icon}{status.text}</div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Username or email">
              <input className="input" autoFocus autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. student" required />
            </Field>
            <Field label="Password">
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input className="input !pl-10 !pr-11" type={showPw ? 'text' : 'password'} autoComplete="current-password" value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />
                <button type="button" onClick={() => setShowPw((s) => !s)} aria-label="Show or hide password" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</div>}
            <Button type="submit" loading={loading} className="w-full !py-3">Sign in {!loading && <ArrowRight className="h-4 w-4" />}</Button>
          </form>

          {SHOW_DEMO_ACCOUNTS && (
            <div className="mt-6">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400"><Zap className="h-3.5 w-3.5" /> Demo accounts</p>
              <div className="flex gap-2">
                {demo.map((d) => (
                  <button key={d.label} type="button" onClick={() => { setUsername(d.username); setPassword(d.password); setError(null); }}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-slate-100 pt-5 dark:border-white/10">
            <button type="button" onClick={() => setServerOpen((o) => !o)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white">
              <Server className="h-4 w-4" /> Server settings
            </button>
            {serverOpen && (
              <div className="mt-3 flex gap-2">
                <input className="input" value={server} onChange={(e) => setServer(e.target.value)} placeholder={DEFAULT_SERVER} />
                <Button type="button" variant="secondary" onClick={saveServer}>Save</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
