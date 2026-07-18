import { CheckCircle2, Loader2, Moon, Server, Sun } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, CardHeader, Field, PageHeader } from '../components/ui';
import { pingHealth } from '../lib/api';
import { DEFAULT_SERVER, getServerUrl, normalizeUrl, setServerUrl } from '../lib/config';
import { useAuth } from '../state/auth';
import { useTheme } from '../state/theme';
import { useToast } from '../state/toast';

export default function Settings() {
  const { dark, toggle } = useTheme();
  const { logout } = useAuth();
  const toast = useToast();
  const [server, setServer] = useState(getServerUrl());
  const [testing, setTesting] = useState(false);

  async function test() {
    setTesting(true);
    const ok = await pingHealth(normalizeUrl(server));
    setTesting(false);
    toast.push({ tone: ok ? 'success' : 'error', title: ok ? 'Server reachable' : 'Server unreachable', message: normalizeUrl(server) });
  }
  function save() {
    setServerUrl(server);
    toast.push({ tone: 'success', title: 'Server address saved', message: 'Signing out so you can log in to the new server.' });
    setTimeout(logout, 900);
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Appearance and connection." />
      <div className="grid max-w-3xl gap-6">
        <Card>
          <CardHeader title="Appearance" />
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-slate-900 dark:text-white">Dark mode</p><p className="text-sm text-slate-500">Easier on the eyes in low light.</p></div>
            <Button variant="secondary" icon={dark ? Sun : Moon} onClick={toggle}>{dark ? 'Switch to light' : 'Switch to dark'}</Button>
          </div>
        </Card>
        <Card>
          <CardHeader title="Server" subtitle="The ScholarTrack backend this app connects to." />
          <Field label="Server address" hint={`Default: ${DEFAULT_SERVER}`}>
            <input className="input" value={server} onChange={(e) => setServer(e.target.value)} />
          </Field>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" icon={testing ? Loader2 : CheckCircle2} loading={testing} onClick={() => void test()}>Test connection</Button>
            <Button icon={Server} onClick={save} disabled={normalizeUrl(server) === getServerUrl()}>Save and sign out</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
