import { useQueryClient } from '@tanstack/react-query';
import { Eye, Send, Sparkles, Trash2, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, Card, Modal, PageHeader, cn } from '../../components/ui';
import { api, ApiError } from '../../lib/api';
import { keys, useAiHistory } from '../../lib/queries';
import type { AiReply, HistoryItem } from '../../lib/types';
import { useToast } from '../../state/toast';

const suggestions = [
  'Which subjects should I focus on?',
  'Why is my performance falling?',
  'Summarize my midterm marks',
  'Create a study plan from my current academic status',
  'How many classes do I need to reach 75% attendance?',
];

interface Msg { id: string; sender: 'USER' | 'ASSISTANT'; content: string; error?: boolean }

function inline(s: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>);
}

/** Tiny markdown-ish renderer (paragraphs, bullets, numbered lists, bold, simple tables) so no extra library is needed. */
function RichText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let list: string[] = [];
  let ordered = false;
  let table: string[] = [];
  const flushList = (k: string) => {
    if (!list.length) return;
    const items = list.map((l, i) => <li key={i}>{inline(l)}</li>);
    out.push(ordered ? <ol key={k} className="ml-5 list-decimal space-y-1">{items}</ol> : <ul key={k} className="ml-5 list-disc space-y-1">{items}</ul>);
    list = [];
  };
  const flushTable = (k: string) => {
    if (!table.length) return;
    out.push(<pre key={k} className="overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-white/5">{table.join('\n')}</pre>);
    table = [];
  };
  text.split('\n').forEach((raw, i) => {
    const line = raw.trimEnd();
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (line.trim().startsWith('|')) { flushList(`l${i}`); if (!/^\s*\|[\s:-|]+\|?\s*$/.test(line)) table.push(line); return; }
    flushTable(`t${i}`);
    if (bullet) { if (ordered) flushList(`l${i}`); ordered = false; list.push(bullet[1]); return; }
    if (numbered) { if (!ordered) flushList(`l${i}`); ordered = true; list.push(numbered[1]); return; }
    flushList(`l${i}`);
    if (!line.trim()) return;
    const h = /^#{1,4}\s+(.*)$/.exec(line);
    out.push(h ? <p key={i} className="font-semibold">{inline(h[1])}</p> : <p key={i}>{inline(line)}</p>);
  });
  flushList('lend'); flushTable('tend');
  return <div className="space-y-2 text-sm leading-relaxed">{out}</div>;
}

export default function AiAssistant() {
  const history = useAiHistory();
  const qc = useQueryClient();
  const toast = useToast();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [ctxOpen, setCtxOpen] = useState(false);
  const [ctx, setCtx] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history.data && !seeded) {
      setMsgs(history.data.map((h: HistoryItem) => ({ id: `h${h.id}`, sender: h.sender, content: h.content })));
      setSeeded(true);
    }
  }, [history.data, seeded]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput('');
    setMsgs((m) => [...m, { id: `u${Date.now()}`, sender: 'USER', content: message }]);
    setBusy(true);
    try {
      const r = await api.post<AiReply>('/ai/chat', { message });
      setMsgs((m) => [...m, { id: `a${Date.now()}`, sender: 'ASSISTANT', content: r.reply }]);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'AI service unavailable. Please try again later.';
      setMsgs((m) => [...m, { id: `e${Date.now()}`, sender: 'ASSISTANT', content: msg, error: true }]);
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    try {
      await api.del('/ai/history');
      setMsgs([]);
      void qc.invalidateQueries({ queryKey: [...keys.aiHistory] });
      toast.push({ tone: 'success', message: 'Conversation cleared.' });
    } catch (e) { toast.push({ tone: 'error', message: e instanceof Error ? e.message : 'Could not clear history' }); }
  }

  async function showContext() {
    setCtxOpen(true);
    setCtx(null);
    try { setCtx((await api.get<{ context: string }>('/ai/context-preview')).context); }
    catch (e) { setCtx(e instanceof Error ? e.message : 'Could not load'); }
  }

  return (
    <div className="flex h-[calc(100vh-9.5rem)] flex-col">
      <PageHeader title="AI Assistant" subtitle="Ask about your own performance. Answers use only your authorised data; official numbers are never changed by the AI."
        actions={<><Button variant="secondary" size="sm" icon={Eye} onClick={() => void showContext()}>What can the AI see?</Button>
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => void clear()} disabled={msgs.length === 0}>Clear</Button></>} />
      <Card className="flex min-h-0 flex-1 flex-col !p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {msgs.length === 0 && !history.isPending && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 p-4 text-white shadow-lg shadow-brand-500/30"><Sparkles className="h-8 w-8" /></div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">How can I help you today?</h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">Try one of these questions, or ask your own.</p>
              <div className="mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => void send(s)} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">{s}</button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m) => (
            <div key={m.id} className={cn('flex animate-fade-in', m.sender === 'USER' ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[80%] rounded-2xl px-4 py-3',
                m.sender === 'USER' ? 'rounded-br-md bg-brand-600 text-white' : m.error ? 'rounded-bl-md border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200'
                  : 'rounded-bl-md bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-100')}>
                {m.error && <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold"><TriangleAlert className="h-3.5 w-3.5" /> AI unavailable</p>}
                {m.sender === 'USER' ? <p className="whitespace-pre-wrap text-sm">{m.content}</p> : <RichText text={m.content} />}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start"><div className="flex gap-1.5 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-4 dark:bg-white/5">
              {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-dots rounded-full bg-slate-400" style={{ animationDelay: `${i * 0.18}s` }} />)}
            </div></div>
          )}
          <div ref={bottom} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); void send(input); }} className="flex gap-3 border-t border-slate-100 p-4 dark:border-white/5">
          <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your marks, attendance or study plan…" maxLength={1000} disabled={busy} />
          <Button type="submit" icon={Send} loading={busy} disabled={input.trim().length === 0}>Send</Button>
        </form>
      </Card>

      <Modal open={ctxOpen} onClose={() => setCtxOpen(false)} title="Exactly what the AI receives about you" footer={<Button variant="secondary" onClick={() => setCtxOpen(false)}>Close</Button>}>
        <p className="mb-3 text-sm text-slate-500">The server prepares this text from your own records and sends only this to the AI. It never includes passwords, other students, or anything outside your role.</p>
        {ctx === null ? <p className="text-sm text-slate-400">Loading…</p> : <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-100 p-4 text-xs dark:bg-white/5">{ctx}</pre>}
      </Modal>
    </div>
  );
}
