import { Construction, LogOut } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { useAuth } from '../state/auth';

/** Shown for roles whose portal is built in a later milestone. The backend for these roles is already live. */
export default function ComingSoon() {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 dark:bg-ink-900">
      <Card className="max-w-lg text-center">
        <div className="mx-auto mb-4 w-fit rounded-2xl bg-brand-100 p-4 text-brand-600 dark:bg-brand-500/15"><Construction className="h-8 w-8" /></div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Hello, {user?.fullName}</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          The {user?.role === 'HOD' ? 'HOD' : 'teacher'} portal is arriving in the next milestone. Your account and its backend APIs already work;
          only the screens are still being built. Sign in as a student to explore the finished portal.
        </p>
        <Button className="mt-6" variant="secondary" icon={LogOut} onClick={logout}>Sign out</Button>
      </Card>
    </div>
  );
}
