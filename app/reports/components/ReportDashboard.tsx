"use client";

import React from "react";
import { useAuth } from '@/context-and-provider/AuthContext';
import useReports from '../hooks/useReports';

const COLORS = ["#5B8FF9", "#5AD8A6", "#5D5FEF", "#FF6B6B", "#FFA94D", "#7C4DFF", "#2FB6B4", "#CAA0FF"];

function makeDonutGradient(projects: any[], total: number) {
  let acc = 0;
  const parts = projects.map(p => {
    const start = acc;
    const percent = (p.seconds / total) * 100;
    acc += percent;
    return `${p.color} ${start}% ${acc}%`;
  });
  return `conic-gradient(${parts.join(", ")})`;
}

export default function ReportDashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { activities, loading, error, activeEntry, activeSeconds, secondsToHMS } = useReports();
  const [groupBy, setGroupBy] = React.useState('monthly');

  const byProject = React.useMemo(() => {
    const map = new Map();
    activities.forEach(a => {
      map.set(a.project, (map.get(a.project) || 0) + a.seconds);
    });
    
    if (activeEntry) {
      const projName = activeEntry.project?.name || 'No project';
      map.set(projName, (map.get(projName) || 0) + activeSeconds);
    }
    
    return Array.from(map.entries())
      .map(([project, seconds], i) => ({ project, seconds, color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.seconds - a.seconds);
  }, [activities, activeEntry, activeSeconds]);

  const totalSeconds = byProject.reduce((sum, p) => sum + p.seconds, 0);

  const byMonth = React.useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    activities.forEach(a => {
      const date = new Date(a.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, new Map<string, number>());
      const monthData = map.get(key)!;
      monthData.set(a.project, (monthData.get(a.project) || 0) + a.seconds);
    });
    return map;
  }, [activities]);

  const last12Months = React.useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months;
  }, []);

  const weeklyData = React.useMemo(() => {
    const map = new Map();
    activities.forEach(a => {
      const date = new Date(a.date);
      const day = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
      const key = monday.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + a.seconds);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [activities]);

  if (authLoading) return <div className="p-6 text-slate-600">Loading...</div>;
  if (!isAuthenticated) return <div className="p-6 text-slate-600">Please log in.</div>;
  if (loading) return <div className="p-6 text-slate-600">Loading data...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {activeEntry && (
          <div className="mb-6 bg-linear-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="text-sm font-medium opacity-90">Currently Running</div>
              <div className="text-lg font-semibold">{activeEntry.description || 'Untitled Task'}</div>
            </div>
            <div className="text-2xl font-bold">{secondsToHMS(activeSeconds)}</div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Track your productivity and time insights</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm px-4 py-2.5 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">View</span>
            <select 
              value={groupBy} 
              onChange={(e) => setGroupBy(e.target.value as any)} 
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Time Overview</h3>
              <div className="flex items-end gap-8 h-64">
                <div className="flex-1 flex items-end gap-4 overflow-x-auto pb-2">
                  {last12Months.map(monthKey => {
                    const monthData = byMonth.get(monthKey) || new Map<string, number>();
                    const monthTotal = Array.from(monthData.values()).reduce((s: number, v: number) => s + v, 0);
                    const [year, mon] = monthKey.split('-');
                    const monthLabel = new Date(Number(year), Number(mon) - 1).toLocaleString('en', { month: 'short' });
                    
                    return (
                      <div key={monthKey} className="min-w-20 flex flex-col items-center">
                        <div className="flex flex-col-reverse h-48 w-20 rounded-xl overflow-hidden bg-gray-50 shadow-sm">
                          {Array.from(monthData.entries()).map(([project, seconds]: [string, number]) => {
                            const proj = byProject.find(p => p.project === project);
                            const height = monthTotal ? (seconds / monthTotal) * 100 : 0;
                            return (
                              <div 
                                key={project}
                                title={`${project} — ${secondsToHMS(seconds)}`}
                                style={{ height: `${height}%`, background: proj?.color || '#ddd' }}
                              />
                            );
                          })}
                        </div>
                        <div className="text-xs font-medium text-gray-600 mt-3">{monthLabel}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-5 min-w-40">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Top Project</div>
                  <div className="mt-2 text-sm font-bold text-gray-900 truncate">{byProject[0]?.project || 'None'}</div>
                  <div className="mt-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Time</div>
                  <div className="text-2xl font-bold text-blue-600 mt-2">{secondsToHMS(totalSeconds)}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Breakdown</h3>
              <div className="flex gap-8">
                <div className="w-64 h-64 relative shrink-0">
                  <div 
                    className="w-64 h-64 rounded-full shadow-inner" 
                    style={{ background: totalSeconds > 0 ? makeDonutGradient(byProject, totalSeconds) : '#f3f4f6' }} 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-36 h-36 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{secondsToHMS(totalSeconds)}</div>
                        <div className="text-xs text-gray-500 mt-1">Total</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  {byProject.map(p => (
                    <div key={p.project} className="hover:bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-1 h-10 rounded-full" style={{ background: p.color }} />
                        <div className="flex-1">
                          <div className="flex justify-between mb-2">
                            <div className="text-sm font-semibold">{p.project}</div>
                            <div className="text-sm font-bold">{secondsToHMS(p.seconds)}</div>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full" 
                              style={{ width: `${(p.seconds / totalSeconds) * 100}%`, background: p.color }} 
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {((p.seconds / totalSeconds) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div className="space-y-4">
                {activities
                  .slice()
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 8)
                  .map(a => (
                    <div key={a.id} className="flex justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-semibold">{a.project}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(a.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm font-bold text-blue-600">{secondsToHMS(a.seconds)}</div>
                    </div>
                  ))}
              </div>
            </div>

            {groupBy === 'weekly' && (
              <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-5">Weekly Summary</h3>
                <div className="space-y-3">
                  {weeklyData.slice(0, 8).map(([week, secs]) => (
                    <div key={week} className="flex justify-between p-2.5 bg-white/60 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">{week}</div>
                      <div className="text-sm font-bold text-purple-600">{secondsToHMS(secs)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
