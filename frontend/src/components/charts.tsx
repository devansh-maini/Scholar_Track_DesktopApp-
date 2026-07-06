/** Reusable SVG chart primitives for student academic analytics. */
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ReactNode } from 'react';

const AXIS = '#94a3b8';
const GRID = 'rgba(148,163,184,0.22)';
const TOOLTIP = { borderRadius: 12, border: '1px solid rgba(148,163,184,.25)', fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,.12)' } as const;

export function Ring({ value, size = 120, stroke = 10, color, children }: { value: number; size?: number; stroke?: number; color: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-slate-200 dark:stroke-white/10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} stroke={color} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset .9s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export const levelColor = (level: 'LOW' | 'MEDIUM' | 'HIGH'): string => (level === 'LOW' ? '#10b981' : level === 'MEDIUM' ? '#f59e0b' : '#ef4444');
export const pctColor = (p: number): string => (p >= 75 ? '#10b981' : p >= 60 ? '#f59e0b' : '#ef4444');

export function AttendanceBars({ data }: { data: { name: string; percent: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barSize={30}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP} cursor={{ fill: 'rgba(148,163,184,.12)' }} formatter={(v) => [`${v}%`, 'Attendance']} />
        <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '75%', fill: '#f59e0b', fontSize: 11, position: 'right' }} />
        <Bar dataKey="percent" radius={[8, 8, 0, 0]}>
          {data.map((d) => <Cell key={d.name} fill={pctColor(d.percent)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SgpaTrend({ data }: { data: { label: string; sgpa: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 10]} tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP} formatter={(v) => [Number(v).toFixed(2), 'SGPA']} />
        <Line type="monotone" dataKey="sgpa" stroke="#10a595" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
