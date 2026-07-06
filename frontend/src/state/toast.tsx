import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

type Tone = 'success' | 'error' | 'info' | 'warning';
interface ToastItem { id: number; tone: Tone; title?: string; message: string }
interface ToastCtx { push: (t: { tone?: Tone; title?: string; message: string }) => void }

const Ctx = createContext<ToastCtx>({ push: () => {} });
const icons = { success: CheckCircle2, error: XCircle, info: Info, warning: TriangleAlert } as const;
const colors: Record<Tone, string> = {
  success: 'text-emerald-500', error: 'text-red-500', info: 'text-brand-500', warning: 'text-amber-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const push = useCallback((t: { tone?: Tone; title?: string; message: string }) => {
    const id = nextId.current++;
    setItems((l) => [...l.slice(-3), { id, tone: t.tone ?? 'info', title: t.title, message: t.message }]);
    setTimeout(() => dismiss(id), 6000);
  }, [dismiss]);
  const value = useMemo(() => ({ push }), [push]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[360px] flex-col gap-3">
        {items.map((t) => {
          const Icon = icons[t.tone];
          return (
            <div key={t.id} className="pointer-events-auto flex animate-slide-in items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-ink-800">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${colors[t.tone]}`} />
              <div className="min-w-0 flex-1">
                {t.title && <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.title}</p>}
                <p className="text-sm text-slate-600 dark:text-slate-300">{t.message}</p>
              </div>
              <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
export const useToast = () => useContext(Ctx);
