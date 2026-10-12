import { getServerUrl } from './config';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

const TOKEN_KEY = 'st.token';
let token: string | null = localStorage.getItem(TOKEN_KEY);
let onUnauthorized: () => void = () => {};

export const getToken = (): string | null => token;
export function setToken(t: string | null): void {
  token = t;
  if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY);
}
export function setUnauthorizedHandler(fn: () => void): void { onUnauthorized = fn; }

const NETWORK_MSG = 'Cannot reach the server. Check your internet connection or the server address in Settings.';

async function raw(method: string, path: string, body?: unknown): Promise<Response> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  try {
    return await fetch(`${getServerUrl()}/api/v1${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, NETWORK_MSG);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await raw(method, path, body);
  let json: { message?: string; data?: T } | null = null;
  try { json = await res.json(); } catch { /* empty or non-JSON body */ }
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(res.status, json?.message ?? `Request failed (${res.status})`);
  }
  return (json?.data ?? null) as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body ?? {}),
  del: <T>(path: string) => request<T>('DELETE', path),
};

/** Downloads a report (PDF/CSV/Excel) with the user's token and hands it to the browser's save flow. */
export async function download(path: string): Promise<string> {
  const res = await raw('GET', path);
  if (!res.ok) {
    let msg = `Download failed (${res.status})`;
    try { msg = (await res.json()).message ?? msg; } catch { /* ignore */ }
    if (res.status === 401) onUnauthorized();
    throw new ApiError(res.status, msg);
  }
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  const filename = match ? decodeURIComponent(match[1]) : 'scholartrack-report';
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return filename;
}

export async function pingHealth(baseUrl: string = getServerUrl()): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`${baseUrl}/api/v1/health`, { signal: ctrl.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}
