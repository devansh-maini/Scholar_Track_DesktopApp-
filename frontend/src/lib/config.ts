const KEY = 'st.serverUrl';

/** Default backend address. For the cloud build set VITE_API_URL (e.g. https://scholartrack.onrender.com). */
export const DEFAULT_SERVER: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
export const SHOW_DEMO_ACCOUNTS: boolean = import.meta.env.VITE_SHOW_DEMO !== 'false';

export function normalizeUrl(raw: string): string {
  let u = raw.trim();
  if (!u) return DEFAULT_SERVER;
  if (!/^https?:\/\//i.test(u)) u = 'http://' + u;
  return u.replace(/\/+$/, '');
}
export const getServerUrl = (): string => localStorage.getItem(KEY) || DEFAULT_SERVER;
export const setServerUrl = (url: string): void => localStorage.setItem(KEY, normalizeUrl(url));
export const wsUrl = (): string => getServerUrl().replace(/^http/i, 'ws') + '/ws';
