import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, getToken, setToken, setUnauthorizedHandler } from '../lib/api';
import type { LoginResponse, UserDto } from '../lib/types';

interface AuthCtx {
  user: UserDto | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<UserDto>;
  logout: () => void;
}
const Ctx = createContext<AuthCtx>({ user: null, ready: false, login: async () => { throw new Error('no provider'); }, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [ready, setReady] = useState(false);
  const qc = useQueryClient();

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    qc.clear();
  }, [qc]);

  useEffect(() => { setUnauthorizedHandler(logout); }, [logout]);

  // Restore the session on start-up (and discard it if the token has expired).
  useEffect(() => {
    let alive = true;
    (async () => {
      if (getToken()) {
        try { const me = await api.get<UserDto>('/auth/me'); if (alive) setUser(me); }
        catch { if (alive) setToken(null); }
      }
      if (alive) setReady(true);
    })();
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.post<LoginResponse>('/auth/login', { username: username.trim(), password });
    setToken(res.token);
    qc.clear();
    setUser(res.user);
    return res.user;
  }, [qc]);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
