import { Client } from '@stomp/stompjs';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getToken } from '../lib/api';
import { wsUrl } from '../lib/config';
import { keys } from '../lib/queries';
import type { LiveEvent } from '../lib/types';
import { useAuth } from './auth';
import { useToast } from './toast';

export type LiveStatus = 'off' | 'connecting' | 'online' | 'retrying';
export interface LiveItem extends LiveEvent { id: number; read: boolean }
interface LiveCtx { status: LiveStatus; events: LiveItem[]; unread: number; markAllRead: () => void }

const Ctx = createContext<LiveCtx>({ status: 'off', events: [], unread: 0, markAllRead: () => {} });

/** Which cached screens are stale after each server event. The affected screen simply re-fetches. */
const invalidations: Record<string, readonly (readonly string[])[]> = {
  MARKS_UPDATED: [keys.marks, keys.results, keys.risk],
  ATTENDANCE_UPDATED: [keys.attendance, keys.risk],
  ASSIGNMENT_CREATED: [keys.coursework, keys.risk],
  SUBMISSION_EVALUATED: [keys.coursework, keys.risk],
  FEE_UPDATED: [keys.fees],
  NOTICE_PUBLISHED: [keys.notices],
  COMPLAINT_UPDATED: [keys.complaints],
  SYLLABUS_UPDATED: [keys.syllabus],
};
const titles: Record<string, string> = {
  MARKS_UPDATED: 'Marks updated', ATTENDANCE_UPDATED: 'Attendance updated', ASSIGNMENT_CREATED: 'New assignment',
  SUBMISSION_EVALUATED: 'Assignment evaluated', FEE_UPDATED: 'Fees updated', NOTICE_PUBLISHED: 'New notice',
  COMPLAINT_UPDATED: 'Complaint update', SYLLABUS_UPDATED: 'Syllabus updated',
};

export function LiveProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const [status, setStatus] = useState<LiveStatus>('off');
  const [events, setEvents] = useState<LiveItem[]>([]);

  const handle = useCallback((ev: LiveEvent) => {
    (invalidations[ev.type] ?? []).forEach((k) => qc.invalidateQueries({ queryKey: [...k] }));
    setEvents((l) => [{ ...ev, id: Date.now() + Math.random(), read: false }, ...l].slice(0, 25));
    toast.push({ tone: 'info', title: titles[ev.type] ?? 'Update', message: ev.message });
  }, [qc, toast]);

  useEffect(() => {
    if (!user) { setStatus('off'); setEvents([]); return; }
    setStatus('connecting');
    const client = new Client({
      brokerURL: wsUrl(),
      connectHeaders: { Authorization: `Bearer ${getToken() ?? ''}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
      onConnect: () => {
        setStatus('online');
        client.subscribe('/user/queue/events', (msg) => {
          try { handle(JSON.parse(msg.body) as LiveEvent); } catch { /* ignore malformed event */ }
        });
      },
      onWebSocketClose: () => setStatus('retrying'),
      onStompError: () => setStatus('retrying'),
    });
    client.activate();
    return () => { void client.deactivate(); };
    // reconnect only when a different user logs in
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const markAllRead = useCallback(() => setEvents((l) => l.map((e) => ({ ...e, read: true }))), []);
  const value = useMemo(() => ({ status, events, unread: events.filter((e) => !e.read).length, markAllRead }), [status, events, markAllRead]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useLive = () => useContext(Ctx);
