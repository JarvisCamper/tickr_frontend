"use client";

import React from "react";
import useReports from '../hooks/useReports';
import { useEmployeeRouteGuard } from "@/app/hooks/useEmployeeRouteGuard";

const COLORS = ["#5B8FF9", "#5AD8A6", "#5D5FEF", "#FF6B6B", "#FFA94D", "#7C4DFF", "#2FB6B4", "#CAA0FF"];
type GroupBy = "daily" | "weekly" | "monthly";

function toLocalDateKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDayLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatWeekLabel(weekStart: string) {
  return new Date(`${weekStart}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatMonthLabel(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1).toLocaleDateString(undefined, { month: "short" });
}

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
  const { isLoading: authLoading, isEmployeeAllowed } = useEmployeeRouteGuard();
  const { activities, loading, error, activeEntry, activeSeconds, secondsToHMS } = useReports();
  const [groupBy, setGroupBy] = React.useState<GroupBy>('monthly');
  const currentYear = React.useMemo(() => new Date().getFullYear(), []);
  const [hoveredSegment, setHoveredSegment] = React.useState<{
    label: string;
    lines: string[];
  } | null>(null);

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

  const todayKey = React.useMemo(() => toLocalDateKey(new Date().toISOString()), []);

  const byMonth = React.useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    activities.forEach(a => {
      const date = new Date(a.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, new Map<string, number>());
      const monthData = map.get(key)!;
      monthData.set(a.project, (monthData.get(a.project) || 0) + a.seconds);
    });

    if (activeEntry && activeSeconds > 0) {
      const now = new Date();
      const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, new Map<string, number>());
      const monthData = map.get(key)!;
      const activeProject = activeEntry.project?.name || 'No project';
      monthData.set(activeProject, (monthData.get(activeProject) || 0) + activeSeconds);
    }

    return map;
  }, [activities, activeEntry, activeSeconds]);

  const availableYears = React.useMemo(() => {
    const years = new Set<number>([currentYear]);
    Array.from(byMonth.keys()).forEach((monthKey) => {
      years.add(Number(monthKey.slice(0, 4)));
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [byMonth, currentYear]);

  const [selectedYear, setSelectedYear] = React.useState(currentYear);

  React.useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0] ?? currentYear);
    }
  }, [availableYears, currentYear, selectedYear]);

  const monthlyChartData = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const monthKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
      const monthData = byMonth.get(monthKey) || new Map<string, number>();
      const totalSeconds = Array.from(monthData.values()).reduce((sum, value) => sum + value, 0);

      return {
        monthIndex,
        monthKey,
        label: formatMonthLabel(selectedYear, monthIndex),
        monthData,
        totalSeconds,
      };
    });
  }, [byMonth, selectedYear]);

  const byDay = React.useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    activities.forEach(a => {
      const key = toLocalDateKey(a.date);
      if (!map.has(key)) map.set(key, new Map<string, number>());
      const dayData = map.get(key)!;
      dayData.set(a.project, (dayData.get(a.project) || 0) + a.seconds);
    });

    if (activeEntry && activeSeconds > 0) {
      const key = todayKey;
      if (!map.has(key)) map.set(key, new Map<string, number>());
      const dayData = map.get(key)!;
      const activeProject = activeEntry.project?.name || 'No project';
      dayData.set(activeProject, (dayData.get(activeProject) || 0) + activeSeconds);
    }

    return map;
  }, [activities, activeEntry, activeSeconds, todayKey]);

  const dailyData = React.useMemo(() => {
    return Array.from(byDay.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [byDay]);

  const dailyChartData = React.useMemo(() => {
    return dailyData
      .slice(0, 7)
      .reverse()
      .map(([dateKey, projectMap]) => ({
        dateKey,
        seconds: Array.from(projectMap.values()).reduce((sum, value) => sum + value, 0),
        label: formatDayLabel(dateKey),
      }));
  }, [dailyData]);

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
    if (activeEntry && activeSeconds > 0) {
      const now = new Date();
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      const key = monday.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + activeSeconds);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [activities, activeEntry, activeSeconds]);

  const byWeek = React.useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    activities.forEach(a => {
      const date = new Date(a.date);
      const day = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
      const key = monday.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, new Map<string, number>());
      const weekData = map.get(key)!;
      weekData.set(a.project, (weekData.get(a.project) || 0) + a.seconds);
    });
    if (activeEntry && activeSeconds > 0) {
      const now = new Date();
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      const key = monday.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, new Map<string, number>());
      const weekData = map.get(key)!;
      const activeProject = activeEntry.project?.name || "No project";
      weekData.set(activeProject, (weekData.get(activeProject) || 0) + activeSeconds);
    }
    return map;
  }, [activities, activeEntry, activeSeconds]);

  const weeklyChartData = React.useMemo(() => {
    return weeklyData
      .slice(0, 8)
      .reverse()
      .map(([weekStart, secs]) => ({
        weekStart,
        seconds: secs,
        label: formatWeekLabel(weekStart),
      }));
  }, [weeklyData]);

  const currentViewSummary = React.useMemo(() => {
    if (groupBy === "daily") {
      const latestDay = dailyChartData[dailyChartData.length - 1];
      return {
        title: "Top Day",
        label: latestDay ? latestDay.label : "None",
        total: secondsToHMS(dailyChartData.reduce((sum, item) => sum + item.seconds, 0)),
      };
    }

    if (groupBy === "weekly") {
      const latestWeek = weeklyChartData[weeklyChartData.length - 1];
      return {
        title: "Top Week",
        label: latestWeek ? `Week of ${latestWeek.label}` : "None",
        total: secondsToHMS(weeklyChartData.reduce((sum, item) => sum + item.seconds, 0)),
      };
    }

    const topMonth = monthlyChartData.reduce<null | { label: string; totalSeconds: number }>((best, month) => {
      if (!best || month.totalSeconds > best.totalSeconds) {
        return { label: month.label, totalSeconds: month.totalSeconds };
      }
      return best;
    }, null);

    return {
      title: "Top Month",
      label: topMonth?.totalSeconds ? `${topMonth.label} ${selectedYear}` : "None",
      total: secondsToHMS(monthlyChartData.reduce((sum, item) => sum + item.totalSeconds, 0)),
    };
  }, [dailyChartData, groupBy, monthlyChartData, selectedYear, weeklyChartData, secondsToHMS]);

  if (authLoading) return <div className="employee-page"><div className="app-shell flex min-h-[60vh] items-center justify-center"><div className="text-lg text-slate-600">Loading...</div></div></div>;
  if (!isEmployeeAllowed) return null;
  if (loading) return (
    <div className="employee-page">
      <div className="app-shell flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-lg text-slate-600">Loading your data...</div>
      </div>
      </div>
    </div>
  );
  if (error) return <div className="employee-page"><div className="app-shell flex min-h-[60vh] items-center justify-center"><div className="text-lg text-red-600">{error}</div></div></div>;

  return (
    <div className="employee-page">
      <div className="app-shell">
        <section className="employee-hero rounded-4xl px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-500">Analytics and reporting</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Reports</h1>
              <p className="mt-3 text-base text-slate-600">Track focus, compare project effort, and understand where your time is going.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="surface-card rounded-[1.4rem] px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Total logged</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{secondsToHMS(totalSeconds)}</div>
              </div>
              <div className="surface-card rounded-[1.4rem] px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Projects tracked</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{byProject.length}</div>
              </div>
              <div className="surface-card rounded-[1.4rem] px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">View</div>
                <select 
                  value={groupBy} 
                  onChange={(e) => setGroupBy(e.target.value as GroupBy)} 
                  className="pro-select mt-2 min-w-[150px] py-2"
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8">
        {activeEntry && (
          <div className="mb-6 flex items-center gap-3 rounded-3xl bg-linear-to-r from-teal-600 to-emerald-500 px-6 py-4 text-white shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="text-sm font-medium opacity-90">Currently Running</div>
              <div className="text-lg font-semibold">{activeEntry.description || 'Untitled Task'}</div>
            </div>
            <div className="text-2xl font-bold">{secondsToHMS(activeSeconds)}</div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="surface-card rounded-[1.75rem] p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Time Overview</h3>
                {groupBy === 'monthly' && (
                  <div className="flex items-center gap-3">
                    <label htmlFor="monthly-year-filter" className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Year
                    </label>
                    <select
                      id="monthly-year-filter"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="pro-select min-w-[120px] py-2"
                    >
                      {availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="mb-4 min-h-11 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
                {hoveredSegment ? (
                  <div>
                    <div className="font-semibold text-slate-900">{hoveredSegment.label}</div>
                    <div className="mt-1 space-y-1">
                      {hoveredSegment.lines.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold text-slate-900">Hover a chart segment</div>
                    <div className="mt-1">See the project name and tracked time for each daily, weekly, or monthly section.</div>
                  </div>
                )}
              </div>
              <div className="flex items-end gap-8 h-64">
                <div className="flex-1 flex items-end gap-4 overflow-x-auto pb-2">
                  {groupBy === 'daily' ? (
                    dailyChartData.map(({ dateKey, seconds, label }) => {
                      const maxDailySeconds = Math.max(...dailyChartData.map((item) => item.seconds), 1);
                      const height = maxDailySeconds ? (seconds / maxDailySeconds) * 100 : 0;
                      const dayProjects = byDay.get(dateKey) || new Map<string, number>();

                      return (
                        <div key={dateKey} className="min-w-20 flex flex-col items-center">
                          <div
                            className="flex h-48 w-20 items-end rounded-xl bg-gray-50 p-2 shadow-sm"
                            onMouseEnter={() =>
                              setHoveredSegment({
                                label,
                                lines: Array.from(dayProjects.entries())
                                  .sort((a, b) => b[1] - a[1])
                                  .map(([project, projectSeconds]) => `${project}: ${secondsToHMS(projectSeconds)}`),
                              })
                            }
                            onMouseLeave={() => setHoveredSegment(null)}
                          >
                            <div
                              className="flex h-full w-full flex-col-reverse overflow-hidden rounded-lg"
                              style={{ height: `${Math.max(height, seconds > 0 ? 8 : 0)}%` }}
                            >
                              {Array.from(dayProjects.entries()).map(([project, projectSeconds]) => {
                                const proj = byProject.find((item) => item.project === project);
                                const segHeight = seconds ? (projectSeconds / seconds) * 100 : 0;

                                return (
                                  <div
                                    key={project}
                                    title={`${project} — ${secondsToHMS(projectSeconds)}`}
                                    onMouseEnter={() =>
                                      setHoveredSegment({
                                        label: `${project} on ${label}`,
                                        lines: [secondsToHMS(projectSeconds)],
                                      })
                                    }
                                    onMouseLeave={() => setHoveredSegment(null)}
                                    style={{ height: `${segHeight}%`, background: proj?.color || "#60a5fa" }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                          <div className="text-xs font-medium text-gray-600 mt-3">{label}</div>
                        </div>
                      );
                    })
                  ) : groupBy === 'monthly' ? (
                    monthlyChartData.map(({ monthKey, monthData, totalSeconds: monthTotal, label: monthLabel }) => {
                      
                      return (
                        <div key={monthKey} className="min-w-20 flex flex-col items-center">
                          <div
                            className="flex h-48 w-20 flex-col-reverse overflow-hidden rounded-xl bg-gray-50 shadow-sm"
                            onMouseEnter={() =>
                              setHoveredSegment({
                                label: `${monthLabel} ${selectedYear}`,
                                lines: monthTotal > 0
                                  ? Array.from(monthData.entries())
                                      .sort((a, b) => b[1] - a[1])
                                      .map(([project, projectSeconds]) => `${project}: ${secondsToHMS(projectSeconds)}`)
                                  : ['No tracked time'],
                              })
                            }
                            onMouseLeave={() => setHoveredSegment(null)}
                          >
                            {Array.from(monthData.entries()).map(([project, seconds]: [string, number]) => {
                              const proj = byProject.find(p => p.project === project);
                              const height = monthTotal ? (seconds / monthTotal) * 100 : 0;
                              return (
                                <div 
                                  key={project}
                                  title={`${project} — ${secondsToHMS(seconds)}`}
                                  onMouseEnter={() =>
                                    setHoveredSegment({
                                      label: `${project} in ${monthLabel} ${selectedYear}`,
                                      lines: [secondsToHMS(seconds)],
                                    })
                                  }
                                  onMouseLeave={() => setHoveredSegment(null)}
                                  style={{ height: `${height}%`, background: proj?.color || '#ddd' }}
                                />
                              );
                            })}
                          </div>
                          <div className="text-xs font-medium text-gray-600 mt-3">{monthLabel}</div>
                        </div>
                      );
                    })
                  ) : (
                    weeklyChartData.map(({ weekStart, seconds, label }) => {
                      const maxWeeklySeconds = Math.max(...weeklyChartData.map((item) => item.seconds), 1);
                      const height = maxWeeklySeconds ? (seconds / maxWeeklySeconds) * 100 : 0;
                      const weekProjects = byWeek.get(weekStart) || new Map<string, number>();

                      return (
                        <div key={weekStart} className="min-w-20 flex flex-col items-center">
                          <div
                            className="flex h-48 w-20 items-end rounded-xl bg-gray-50 p-2 shadow-sm"
                            onMouseEnter={() =>
                              setHoveredSegment({
                                label: `Week of ${label}`,
                                lines: Array.from(weekProjects.entries())
                                  .sort((a, b) => b[1] - a[1])
                                  .map(([project, projectSeconds]) => `${project}: ${secondsToHMS(projectSeconds)}`),
                              })
                            }
                            onMouseLeave={() => setHoveredSegment(null)}
                          >
                            <div
                              className="flex h-full w-full flex-col-reverse overflow-hidden rounded-lg"
                              style={{ height: `${Math.max(height, seconds > 0 ? 8 : 0)}%` }}
                            >
                              {Array.from(weekProjects.entries()).map(([project, projectSeconds]) => {
                                const proj = byProject.find((item) => item.project === project);
                                const segHeight = seconds ? (projectSeconds / seconds) * 100 : 0;

                                return (
                                  <div
                                    key={project}
                                    title={`${project} — ${secondsToHMS(projectSeconds)}`}
                                    onMouseEnter={() =>
                                      setHoveredSegment({
                                        label: `${project} in week of ${label}`,
                                        lines: [secondsToHMS(projectSeconds)],
                                      })
                                    }
                                    onMouseLeave={() => setHoveredSegment(null)}
                                    style={{ height: `${segHeight}%`, background: proj?.color || '#60a5fa' }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                          <div className="text-xs font-medium text-gray-600 mt-3">{label}</div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="rounded-[1.25rem] bg-linear-to-br from-blue-50 to-indigo-50 p-5 min-w-40">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{currentViewSummary.title}</div>
                  <div className="mt-2 text-sm font-bold text-gray-900 truncate">{currentViewSummary.label}</div>
                  <div className="mt-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Time</div>
                  <div className="text-2xl font-bold text-blue-600 mt-2">{currentViewSummary.total}</div>
                </div>
              </div>
            </div>

            <div className="surface-card rounded-[1.75rem] p-6">
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
                    <div key={p.project} className="rounded-xl p-3 transition hover:bg-slate-50">
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
            <div className="surface-card rounded-[1.75rem] p-6">
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
                    <div key={a.id} className="flex justify-between rounded-xl p-3 transition hover:bg-slate-50">
                      <div>
                        <div className="text-sm font-semibold">{a.project}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(a.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm font-bold text-blue-600">{secondsToHMS(a.seconds)}</div>
                    </div>
                  ))}
              </div>
            </div>

            {groupBy === 'daily' && (
              <div className="surface-card rounded-[1.75rem] bg-linear-to-br from-cyan-50/80 to-blue-50/80 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-5">Daily Summary</h3>
                <div className="space-y-3">
                  {dailyData.slice(0, 7).map(([day, projectMap]) => (
                    <div key={day} className="flex justify-between rounded-xl bg-white/70 p-2.5">
                      <div className="text-sm font-medium text-gray-700">{formatDayLabel(day)}</div>
                      <div className="text-sm font-bold text-cyan-700">
                        {secondsToHMS(Array.from(projectMap.values()).reduce((sum, value) => sum + value, 0))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groupBy === 'weekly' && (
              <div className="surface-card rounded-[1.75rem] bg-linear-to-br from-purple-50/80 to-pink-50/80 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-5">Weekly Summary</h3>
                <div className="space-y-3">
                  {weeklyData.slice(0, 8).map(([week, secs]) => (
                    <div key={week} className="flex justify-between rounded-xl bg-white/70 p-2.5">
                      <div className="text-sm font-medium text-gray-700">{week}</div>
                      <div className="text-sm font-bold text-purple-600">{secondsToHMS(secs)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groupBy === 'monthly' && (
              <div className="surface-card rounded-[1.75rem] bg-linear-to-br from-amber-50/80 to-orange-50/80 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-5">Monthly Summary</h3>
                <div className="space-y-3">
                  {monthlyChartData.map(({ monthKey, label, totalSeconds: monthTotal }) => (
                    <div key={monthKey} className="flex justify-between rounded-xl bg-white/70 p-2.5">
                      <div className="text-sm font-medium text-gray-700">{label} {selectedYear}</div>
                      <div className="text-sm font-bold text-amber-700">{secondsToHMS(monthTotal)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
