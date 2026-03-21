"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ChartColumn,
  FolderKanban,
  TrendingUp,
  Users,
  UsersRound,
} from "lucide-react";
import { safeFetch } from "../utils/apiHelper";
import { StatsCard } from "../components/StatsCard";

interface OverviewData {
  total_users: number;
  total_teams: number;
  total_projects: number;
  total_time_tracked: string;
  active_users_today: number;
  new_users_this_week: number;
}

interface UserGrowthPoint {
  date: string;
  count: number;
  cumulative: number;
}

interface ActivityPoint {
  date: string;
  time_entries: number;
  new_projects: number;
  active_users: number;
}

interface TopUser {
  user_id: number;
  username: string;
  email: string;
  total_entries: number;
  total_seconds: number;
  total_hours: string;
}

interface TopProject {
  project_id: number | null;
  name: string;
  type?: string;
  team_name?: string;
  total_entries: number;
  total_seconds: number;
  total_hours: string;
}

interface TopTeam {
  team_id: number;
  name: string;
  owner_username?: string;
  member_count: number;
  project_count: number;
}

const formatShortDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const isAdminIdentity = (username?: string | null, email?: string | null) => {
  const normalizedUsername = (username || "").trim().toLowerCase();
  const normalizedEmail = (email || "").trim().toLowerCase();

  return normalizedUsername === "admin" || normalizedEmail === "admin@tickr.com";
};

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowthPoint[]>([]);
  const [activity, setActivity] = useState<ActivityPoint[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [topProjects, setTopProjects] = useState<TopProject[]>([]);
  const [topTeams, setTopTeams] = useState<TopTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(14);

  const applyAnalyticsPayload = (payload: any) => {
    const rawOverview = ((payload || {}).overview as OverviewData) || null;
    const rawGrowth = Array.isArray(payload?.user_growth) ? (payload.user_growth as UserGrowthPoint[]) : [];
    const rawTopUsers = Array.isArray(payload?.top_users) ? (payload.top_users as TopUser[]) : [];
    const hasAdminAccount = (rawOverview?.total_users || 0) > 0;

    setOverview(
      rawOverview
        ? {
            ...rawOverview,
            total_users: Math.max(0, rawOverview.total_users - (hasAdminAccount ? 1 : 0)),
          }
        : null
    );
    setUserGrowth(
      rawGrowth.map((point) => ({
        ...point,
        count: Math.max(0, point.count),
        cumulative: Math.max(0, point.cumulative - (hasAdminAccount ? 1 : 0)),
      }))
    );
    setActivity(Array.isArray(payload?.activity) ? (payload.activity as ActivityPoint[]) : []);
    setTopUsers(rawTopUsers.filter((user) => !isAdminIdentity(user.username, user.email)));
    setTopProjects(Array.isArray(payload?.top_projects) ? (payload.top_projects as TopProject[]) : []);
    setTopTeams(Array.isArray(payload?.top_teams) ? (payload.top_teams as TopTeam[]) : []);
  };

  async function fetchAnalytics(selectedDays: number) {
    setLoading(true);
    setError("");
    setDays(selectedDays);

    const payload = await safeFetch(`/admin/api/analytics/bundle/?days=${selectedDays}&limit=6`, {
      timeoutMs: 20000,
    });

    if (!payload) {
      setError(overview ? "Analytics refresh timed out. Showing the last loaded data." : "Failed to load analytics.");
      setLoading(false);
      return;
    }

    applyAnalyticsPayload(payload);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    const loadInitialAnalytics = async () => {
      setLoading(true);
      setError("");
      setDays(14);

      const payload = await safeFetch("/admin/api/analytics/bundle/?days=14&limit=6", {
        timeoutMs: 20000,
      });

      if (cancelled) return;

      if (!payload) {
        setError("Failed to load analytics.");
        setLoading(false);
        return;
      }

      applyAnalyticsPayload(payload);
      setLoading(false);
    };

    void loadInitialAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  const growthSummary = useMemo(() => {
    if (!userGrowth.length) {
      return { latestCumulative: 0, recentGrowth: 0 };
    }

    const latest = userGrowth[userGrowth.length - 1];
    const recentGrowth = userGrowth.reduce((sum, point) => sum + point.count, 0);
    return { latestCumulative: latest.cumulative, recentGrowth };
  }, [userGrowth]);

  const activitySummary = useMemo(() => {
    const totals = activity.reduce(
      (acc, point) => {
        acc.timeEntries += point.time_entries;
        acc.newProjects += point.new_projects;
        acc.activeUsers += point.active_users;
        return acc;
      },
      { timeEntries: 0, newProjects: 0, activeUsers: 0 }
    );

    const peakDay =
      activity.reduce<ActivityPoint | null>((best, point) => {
        const score = point.time_entries + point.active_users + point.new_projects;
        const bestScore =
          (best?.time_entries || 0) + (best?.active_users || 0) + (best?.new_projects || 0);
        return score > bestScore ? point : best;
      }, null) || null;

    return { ...totals, peakDay };
  }, [activity]);

  const activityHighlights = useMemo(() => {
    const activeDays = activity
      .map((point) => ({
        ...point,
        total: point.time_entries + point.new_projects + point.active_users,
      }))
      .filter((point) => point.total > 0);

    const busiestDays = [...activeDays]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const activeDayCount = activeDays.length;
    const averageEvents = activeDayCount
      ? Math.round(activeDays.reduce((sum, point) => sum + point.total, 0) / activeDayCount)
      : 0;

    return {
      busiestDays,
      activeDayCount,
      averageEvents,
    };
  }, [activity]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="admin-hero rounded-[1.85rem] px-6 py-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Insights Console</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Analytics</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Monitor growth, platform activity, and operational momentum with a clearer admin view.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[7, 14, 30].map((value) => (
              <button
                key={value}
                onClick={() => fetchAnalytics(value)}
                className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  days === value
                    ? "bg-cyan-600 text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Last {value} days
              </button>
            ))}
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {overview ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            icon={<Users size={22} />}
            label="Total Users"
            value={overview.total_users}
            change={overview.new_users_this_week ? `+${overview.new_users_this_week} this week` : undefined}
            trend="up"
            tone="blue"
          />
          <StatsCard
            icon={<UsersRound size={22} />}
            label="Total Teams"
            value={overview.total_teams}
            tone="amber"
          />
          <StatsCard
            icon={<FolderKanban size={22} />}
            label="Total Projects"
            value={overview.total_projects}
            tone="purple"
          />
          <StatsCard
            icon={<Activity size={22} />}
            label="Active Users Today"
            value={overview.active_users_today}
            tone="green"
          />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <section className="admin-panel rounded-3xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Growth Snapshot</h2>
              <p className="mt-1 text-sm text-slate-500">
                User signups and cumulative platform growth over the selected period.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Current Users</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{growthSummary.latestCumulative}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">New users in window</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{growthSummary.recentGrowth}</p>
              <p className="mt-2 text-sm text-slate-500">Excludes the admin account from platform totals.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tracked work time</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {overview?.total_time_tracked || "0:00:00"}
              </p>
              <p className="mt-2 text-sm text-slate-500">All recorded work tracked during the selected period.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weekly momentum</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-700">
                <TrendingUp size={18} />
                {overview?.new_users_this_week || 0} new accounts
              </p>
              <p className="mt-2 text-sm text-slate-500">Fresh signups recorded in the current weekly window.</p>
            </div>
          </div>
        </section>

        <section className="admin-panel rounded-3xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Operational Pulse</h2>
              <p className="mt-1 text-sm text-slate-500">
                Activity mix across time tracking, active users, and new project creation.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
              <ChartColumn size={22} className="text-emerald-700" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Time Entries</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{activitySummary.timeEntries}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">New Projects</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{activitySummary.newProjects}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active User Hits</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{activitySummary.activeUsers}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Busiest Day</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {activitySummary.peakDay ? formatShortDate(activitySummary.peakDay.date) : "No data"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {activitySummary.peakDay
                  ? `${activitySummary.peakDay.time_entries + activitySummary.peakDay.active_users + activitySummary.peakDay.new_projects} total events`
                  : "No recorded activity in this window."}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Days</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{activityHighlights.activeDayCount}</p>
              <p className="mt-2 text-sm text-slate-500">Days with at least one tracked event in the selected range.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Avg Events / Active Day</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{activityHighlights.averageEvents}</p>
              <p className="mt-2 text-sm text-slate-500">A steadier signal than scanning every individual date.</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Top activity days</p>
                <p className="mt-1 text-xs text-slate-500">Showing the strongest days only, so this stays compact in production.</p>
              </div>
              <span className="text-xs font-medium text-slate-500">Top 5</span>
            </div>

            <div className="mt-4 space-y-3">
              {activityHighlights.busiestDays.length ? (
                activityHighlights.busiestDays.map((point, index) => {
                  const maxTotal = Math.max(activityHighlights.busiestDays[0]?.total || 1, 1);
                  const safeTotal = Math.max(point.total, 1);

                  return (
                    <div key={point.date} className="rounded-2xl bg-slate-50/90 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-slate-900">{formatShortDate(point.date)}</p>
                            <p className="text-xs text-slate-500">
                              {point.time_entries} entries, {point.active_users} active users, {point.new_projects} new projects
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{point.total} events</span>
                      </div>

                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                        <div className="flex h-full" style={{ width: `${(point.total / maxTotal) * 100}%` }}>
                          <div
                            className="bg-cyan-500"
                            style={{ width: `${(point.time_entries / safeTotal) * 100}%` }}
                          />
                          <div
                            className="bg-emerald-500"
                            style={{ width: `${(point.active_users / safeTotal) * 100}%` }}
                          />
                          <div
                            className="bg-amber-400"
                            style={{ width: `${(point.new_projects / safeTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-500">
                  No activity has been recorded in the selected window yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="admin-panel rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Performance Highlights</h2>
            <p className="mt-1 text-sm text-slate-500">
              Quick readouts to help you spot momentum without scanning raw dates.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Peak Activity Day</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">
              {activitySummary.peakDay ? formatShortDate(activitySummary.peakDay.date) : "No data"}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {activitySummary.peakDay
                ? `${activitySummary.peakDay.time_entries} entries and ${activitySummary.peakDay.active_users} active users`
                : "Activity data will appear here once entries are available."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Platform Base</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{growthSummary.latestCumulative}</p>
            <p className="mt-2 text-sm text-slate-600">
              Cumulative users based on the selected growth window.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today’s Active Users</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{overview?.active_users_today || 0}</p>
            <p className="mt-2 text-sm text-slate-600">
              People who logged tracked work today across the platform.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="admin-panel rounded-3xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Top Users</h2>
              <p className="mt-1 text-sm text-slate-500">
                People contributing the most tracked work time.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-3">
              <Users size={20} className="text-cyan-700" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.user_id} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      #{index + 1} {user.username}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                    {user.total_hours}h
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{user.total_entries} time entries logged</p>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel rounded-3xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Top Projects</h2>
              <p className="mt-1 text-sm text-slate-500">
                Projects with the most recorded work time.
              </p>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-violet-50 p-3">
              <FolderKanban size={20} className="text-purple-700" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {topProjects.map((project, index) => (
              <div key={`${project.project_id}-${index}`} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      #{index + 1} {project.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {project.team_name ? `${project.team_name} team` : "No team"} • {project.type || "general"}
                    </p>
                  </div>
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    {project.total_hours}h
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{project.total_entries} tracked entries</p>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel rounded-3xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Top Teams</h2>
              <p className="mt-1 text-sm text-slate-500">
                Teams with the largest footprint across members and projects.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
              <UsersRound size={20} className="text-amber-700" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {topTeams.map((team, index) => (
              <div key={team.team_id} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      #{index + 1} {team.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Owner: {team.owner_username || "Unknown"}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {team.project_count} projects
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{team.member_count} team members</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
