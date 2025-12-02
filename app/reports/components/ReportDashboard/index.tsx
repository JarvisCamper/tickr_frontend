"use client";

import React from "react";
import { useAuth } from '@/context-and-provider/AuthContext';
import useReports from '../../hooks/useReports';
import type { Activity } from '../../types/report.types';

const COLORS = [
  "#5B8FF9",
  "#5AD8A6",
  "#5D5FEF",
  "#FF6B6B",
  "#FFA94D",
  "#7C4DFF",
  "#2FB6B4",
  "#CAA0FF",
  "#6C6CFF",
  "#3AA76D",
];

function makeConicGradient(parts: { percent: number; color: string }[]) {
  let acc = 0;
  const stops = parts
    .map((p) => {
      const start = acc;
      acc += p.percent;
      return `${p.color} ${start}% ${acc}%`;
    })
    .join(", ");
  return `conic-gradient(${stops})`;
}

export default function ReportDashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    activities,
    loading,
    error,
    activeEntry,
    activeSeconds,
    live,
    setLive,
    pollIntervalMs,
    setPollIntervalMs,
    secondsToHMS,
  } = useReports();

  const [groupBy, setGroupBy] = React.useState<'monthly' | 'weekly'>('monthly');

  // Aggregate by project (seconds)
  const byProject = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const a of activities) map.set(a.project, (map.get(a.project) || 0) + a.seconds);
    // merge active entry seconds into aggregates so totals/donut reflect running timer
    if (activeEntry) {
      const projName = activeEntry.project?.name || activeEntry.project_name || 'No project';
      map.set(projName, (map.get(projName) || 0) + activeSeconds);
    }
    const arr = Array.from(map.entries()).map(([project, seconds], idx) => ({ project, seconds, color: COLORS[idx % COLORS.length] }));
    arr.sort((a, b) => b.seconds - a.seconds);
    return arr;
  }, [activities, activeEntry, activeSeconds]);

  const totalSeconds = byProject.reduce((s, p) => s + p.seconds, 0);

  // Aggregate by year-month key (YYYY-MM)
  const { byMonth, last12Months } = React.useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const a of activities) {
      const d = new Date(a.date);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const monthMap = map.get(key) || new Map<string, number>();
      monthMap.set(a.project, (monthMap.get(a.project) || 0) + a.seconds);
      map.set(key, monthMap);
    }

    // last 12 months keys (oldest -> newest)
    const now = new Date();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
    }

    return { byMonth: map, last12Months: months };
  }, [activities]);

  const monthsToShow = last12Months;

  const donutParts = totalSeconds > 0 ? byProject.map((p) => ({ percent: (p.seconds / totalSeconds) * 100, color: p.color })) : [];
  const donutStyle = totalSeconds > 0 ? { background: makeConicGradient(donutParts) } as React.CSSProperties : { background: '#f3f4f6' } as React.CSSProperties;

  // Weekly aggregation (week starting date -> seconds)
  const aggregateByWeek = (items: Activity[]) => {
    const map = new Map<string, number>();
    for (const a of items) {
      const d = new Date(a.date);
      if (isNaN(d.getTime())) continue;
      const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const day = (tmp.getUTCDay() + 6) % 7; // Monday=0
      tmp.setUTCDate(tmp.getUTCDate() - day);
      const key = tmp.toISOString().slice(0, 10); // YYYY-MM-DD week start
      map.set(key, (map.get(key) || 0) + a.seconds);
    }
    return Array.from(map.entries()).sort((a: [string, number], b: [string, number]) => +new Date(b[0]) - +new Date(a[0]));
  };

  if (authLoading) return <div className="p-6"><div className="text-sm text-slate-600">Loading auth...</div></div>;
  if (!isAuthenticated) return <div className="p-6"><div className="text-sm text-slate-600">Please log in to view reports.</div></div>;
  if (loading) return <div className="p-6"><div className="text-sm text-slate-600">Loading report data...</div></div>;
  if (error) return <div className="p-6"><div className="text-sm text-red-600">{error}</div></div>;

  const weekly = aggregateByWeek(activities);

  return (
    <div className="p-6">
      {activeEntry && (
        <div className="mb-3 text-sm text-slate-600">Live: <strong>{activeEntry.description || 'Running'}</strong> — {secondsToHMS(activeSeconds)}</div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Reports</h2>
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            <span>Group</span>
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as any)} className="px-2 py-1 border rounded">
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
          <label className="flex items-center gap-2" title="When checked the dashboard will auto-refresh from the server">
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} /> Auto-refresh
          </label>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-end gap-6 h-52">
              <div className="flex-1 flex items-end gap-3">
                <div className="flex gap-4 overflow-x-auto" ref={null as any}>
                  {monthsToShow.map((monthKey) => {
                    const monthMap = byMonth.get(monthKey) || new Map<string, number>();
                    const monthTotal = Array.from(monthMap.values()).reduce((s, v) => s + v, 0);
                    const maxMonthTotal = Math.max(...monthsToShow.map((mi) => {
                      const m = byMonth.get(mi) || new Map<string, number>();
                      return Array.from(m.values()).reduce((s, v) => s + v, 0);
                    }));
                    const [year, mon] = monthKey.split('-');
                    const monthLabel = new Date(Number(year), Number(mon) - 1, 1).toLocaleString(undefined, { month: 'short' });
                    return (
                      <div key={monthKey} className="min-w-[72px] flex flex-col-reverse items-stretch">
                        <div className="flex flex-col-reverse h-40 w-16 rounded overflow-hidden" style={{ height: 220 }}>
                                  {Array.from(monthMap.entries())
                                    .sort((a: [string, number], b: [string, number]) => {
                                      const ai = byProject.findIndex((p) => p.project === a[0]);
                                      const bi = byProject.findIndex((p) => p.project === b[0]);
                                      return ai - bi;
                                    })
                                    .map(([project, seconds]: [string, number]) => {
                                      const proj = byProject.find((p) => p.project === project)!;
                                      const segHeight = monthTotal ? (seconds / monthTotal) * 100 : 0;
                                      return (
                                        <div key={project} title={`${project} — ${secondsToHMS(seconds)}`} style={{ height: `${segHeight}%`, background: proj?.color || '#ddd' }} />
                                      );
                                    })}
                        </div>
                        <div className="text-center text-xs mt-2">{monthLabel}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="w-40 text-sm">
                <div className="font-medium">Top Project</div>
                <div className="mt-2 text-xs text-slate-600">{byProject[0]?.project}</div>
                <div className="mt-4 font-medium">Total</div>
                <div className="text-lg mt-1">{secondsToHMS(totalSeconds)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow p-4 mt-6 flex gap-6">
            <div className="w-56 h-56 relative shrink-0">
              <div className="w-56 h-56 rounded-full" style={donutStyle} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-center">
                  <div>
                    <div className="text-lg font-semibold">{secondsToHMS(totalSeconds)}</div>
                    <div className="text-xs text-slate-500">total</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              {byProject.map((p) => (
                <div key={p.project} className="flex items-center gap-4 mb-3">
                  <div className="w-3 h-6 rounded" style={{ background: p.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">{p.project}</div>
                      <div className="text-sm text-slate-600">{secondsToHMS(p.seconds)}</div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded mt-2 relative">
                      <div className="h-2 rounded" style={{ width: `${(p.seconds / Math.max(1, totalSeconds)) * 100}%`, background: p.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded shadow p-4">
            <div className="font-medium mb-3">Recent Entries</div>
            <div className="space-y-3">
              {activities
                .slice()
                .sort((a, b) => +new Date(b.date) - +new Date(a.date))
                .map((a) => (
                  <div key={a.id} className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium">{a.project}</div>
                      <div className="text-xs text-slate-500">{new Date(a.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm text-slate-600">{secondsToHMS(a.seconds)}</div>
                  </div>
                ))}
            </div>
          </div>

          {groupBy === 'weekly' && (
            <div className="bg-white rounded shadow p-4 mt-4 text-sm">
              <div className="font-medium mb-2">Weekly Totals (week start)</div>
              <div className="space-y-2">
                {weekly.slice(0, 12).map(([weekStart, secs]) => (
                  <div key={weekStart} className="flex justify-between">
                    <div>{weekStart}</div>
                    <div>{secondsToHMS(secs)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
