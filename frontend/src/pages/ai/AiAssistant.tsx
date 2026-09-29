import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  User,
  Zap,
} from 'lucide-react';
import { Badge, Card, Skeleton } from '../../components/ui';
import { api } from '../../lib/api';
import { useAiChatHistory, useRisk, useStudyPlan } from '../../lib/queries';
import type { HistoryItem } from '../../lib/types';
import { useToast } from '../../state/toast';

export default function AiAssistant() {
  const { data: riskDetail } = useRisk();
  const { data: initialPlan, refetch: refetchPlan } = useStudyPlan();
  const { data: history, refetch: refetchHistory } = useAiChatHistory();
  const { push } = useToast();

  const [activeTab, setActiveTab] = useState<'CHAT' | 'STUDY_PLAN' | 'RISK_RADAR'>('CHAT');
  const [messages, setMessages] = useState<HistoryItem[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).slice(2, 10));

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history) {
      setMessages(history);
    }
  }, [history]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || sending) return;

    const userText = inputMsg.trim();
    setInputMsg('');

    // Optimistic user message
    const tempUserMsg: HistoryItem = {
      id: Date.now(),
      sender: 'USER',
      content: userText,
      at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      setSending(true);
      const res = await api.post<{ reply: string; sessionId: string; at: string }>('/ai/chat', {
        sessionId,
        message: userText,
      });

      const assistantMsg: HistoryItem = {
        id: Date.now() + 1,
        sender: 'ASSISTANT',
        content: res.reply,
        at: res.at,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      push({ tone: 'error', message: 'Failed to reach AI Assistant. Please retry.' });
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.del('/ai/chat/history');
      setMessages([]);
      push({ tone: 'success', message: 'Conversation history cleared' });
      refetchHistory();
    } catch (err) {
      push({ tone: 'error', message: 'Could not clear history' });
    }
  };

  const handleRegeneratePlan = async () => {
    try {
      setGeneratingPlan(true);
      await refetchPlan();
      push({ tone: 'success', message: 'Personalised study plan refreshed with latest academic data' });
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-gradient-to-r from-brand-500/10 to-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
              ScholarTrack Intelligence
            </span>
            <span className="text-xs text-slate-400">Adaptive AI Engine</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-brand-500" />
            AI Academic Assistant & Advisory
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Explainable risk diagnosis, personalised study plans, and prompt-engineered course advisory.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-white/5 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('CHAT')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'CHAT'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-ink-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Course Advisory Chat
          </button>
          <button
            onClick={() => setActiveTab('STUDY_PLAN')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'STUDY_PLAN'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-ink-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Calendar className="h-4 w-4" />
            AI Study Plan
          </button>
          <button
            onClick={() => setActiveTab('RISK_RADAR')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'RISK_RADAR'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-ink-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Zap className="h-4 w-4" />
            Risk Diagnostic
          </button>
        </div>
      </div>

      {/* ─── TAB 1: CHAT ────────────────────────────────────────────── */}
      {activeTab === 'CHAT' && (
        <Card className="flex flex-col h-[640px] overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-3.5 bg-slate-50/50 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md shadow-brand-500/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">ScholarTrack Academic Advisor</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Deterministic & Explainable Engine Ready
                </p>
              </div>
            </div>

            <button
              onClick={handleClearHistory}
              title="Clear chat history"
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/50 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white transition"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
                <div className="rounded-2xl bg-brand-500/10 p-4 text-brand-600 dark:text-brand-400">
                  <Bot className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">How can I assist your academics today?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ask me about exam tips, low attendance recovery steps, semester marks analysis, or course recommendations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
                  {[
                    'How do I improve my attendance?',
                    'Generate my study plan',
                    'Explain my academic risk score',
                    'How can I boost my SGPA?',
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setInputMsg(preset)}
                      className="rounded-xl border border-slate-200 bg-white p-2.5 text-left text-xs font-medium text-slate-700 hover:border-brand-500 hover:bg-brand-50/30 dark:border-white/10 dark:bg-ink-800 dark:text-slate-300 dark:hover:bg-white/5 transition"
                    >
                      &ldquo;{preset}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const isUser = m.sender === 'USER';
              return (
                <div key={m.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-xs">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                      isUser
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white'
                    }`}
                  >
                    {m.content}
                  </div>
                  {isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700 dark:bg-white/20 dark:text-white text-xs font-bold">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
            {sending && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-xs">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-500 dark:bg-white/10 dark:text-slate-400 animate-pulse">
                  Analyzing performance data & crafting advisory response...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="border-t border-slate-200/80 p-4 bg-white dark:border-white/10 dark:bg-ink-900 flex gap-3">
            <input
              type="text"
              placeholder="Ask the AI advisor (e.g. How to prepare for upcoming midterms?)..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={sending || !inputMsg.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50 transition"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </form>
        </Card>
      )}

      {/* ─── TAB 2: STUDY PLAN ───────────────────────────────────────── */}
      {activeTab === 'STUDY_PLAN' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Algorithmic Academic Improvement Roadmap
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generated from real attendance logs and continuous assessment scores.
              </p>
            </div>
            <button
              onClick={handleRegeneratePlan}
              disabled={generatingPlan}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50 transition self-start sm:self-auto"
            >
              <RefreshCw className={`h-4 w-4 ${generatingPlan ? 'animate-spin' : ''}`} />
              Regenerate Plan
            </button>
          </div>

          {initialPlan ? (
            <div className="space-y-6">
              {/* General Strategy Box */}
              <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50/50 to-indigo-50/50 p-6 dark:border-brand-900/30 dark:bg-brand-950/10">
                <h3 className="font-bold text-brand-950 dark:text-brand-200 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-brand-600" />
                  Key Strategic Academic Recommendations
                </h3>
                <ul className="mt-3 space-y-2">
                  {initialPlan.generalAdvice.map((advice, i) => (
                    <li key={i} className="text-xs text-brand-900 dark:text-brand-300 flex items-start gap-2">
                      <span className="text-brand-500 font-bold">&bull;</span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subject Allocations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {initialPlan.subjects.map((sub) => {
                  const isHigh = sub.priority === 'HIGH';
                  return (
                    <Card key={sub.subjectCode} className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                              {sub.subjectCode}
                            </span>
                            <Badge tone={isHigh ? 'red' : sub.priority === 'MEDIUM' ? 'amber' : 'teal'}>
                              {sub.priority} PRIORITY
                            </Badge>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-base mt-1">
                            {sub.subjectName}
                          </h4>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-slate-400">Recommended</p>
                          <p className="text-lg font-bold text-brand-600 dark:text-brand-400">
                            {sub.weeklyHours} hrs/wk
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-white/[0.02]">
                          <span className="text-slate-400">Current Attendance:</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                            {sub.attendancePct}%
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-white/[0.02]">
                          <span className="text-slate-400">Assessment Average:</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                            {sub.marksPct}%
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Targeted Action Checklist:
                        </p>
                        {sub.actions.map((act, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 shrink-0 mt-0.5" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-white/10 dark:text-slate-400">
              <Calendar className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="font-semibold">No study plan generated yet.</p>
              <button
                onClick={handleRegeneratePlan}
                className="mt-3 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-500"
              >
                Generate Initial Study Plan
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: RISK RADAR ───────────────────────────────────────── */}
      {activeTab === 'RISK_RADAR' && (
        <div className="space-y-6">
          {riskDetail ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score Summary */}
              <Card className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                <div
                  className={`flex h-28 w-28 items-center justify-center rounded-full border-8 ${
                    riskDetail.risk.level === 'HIGH'
                      ? 'border-rose-500 text-rose-600'
                      : riskDetail.risk.level === 'MEDIUM'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-emerald-500 text-emerald-600'
                  }`}
                >
                  <div>
                    <span className="text-3xl font-extrabold">{riskDetail.risk.score}</span>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Risk Score</span>
                  </div>
                </div>

                <div>
                  <Badge tone={riskDetail.risk.level === 'HIGH' ? 'red' : riskDetail.risk.level === 'MEDIUM' ? 'amber' : 'teal'}>
                    {riskDetail.risk.level} ACADEMIC RISK
                  </Badge>
                  <p className="text-xs text-slate-400 mt-2">
                    Scored across attendance shortfall, test performance, and SGPA delta.
                  </p>
                </div>
              </Card>

              {/* Explainable Reasons */}
              <Card className="p-6 lg:col-span-2 space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Explainable Risk Factors & Breakdown
                </h3>

                <div className="space-y-3">
                  {riskDetail.risk.components.map((comp) => (
                    <div key={comp.name} className="rounded-xl border border-slate-100 bg-slate-50/75 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{comp.name} Factor</span>
                        <span className="font-mono text-slate-500">Weight: {comp.weight}% | Risk: {comp.riskPoints} pts</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden dark:bg-white/10">
                        <div
                          className={`h-full rounded-full ${
                            comp.riskPoints > 20 ? 'bg-rose-500' : comp.riskPoints > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(comp.riskPoints * 2.5, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-ink-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Diagnostic Explanations:
                  </p>
                  <ul className="space-y-2">
                    {riskDetail.risk.reasons.map((r, i) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-brand-500 font-bold">&bull;</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          ) : (
            <Skeleton className="h-64 w-full rounded-2xl" />
          )}
        </div>
      )}
    </div>
  );
}
