"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function MiniBars({
  data,
  colorClass,
}: {
  data: number[];
  colorClass: string;
}) {
  const maxValue = Math.max(...data, 1);

  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((value, index) => (
        <div key={index} className="flex-1 min-w-0">
          <div
            className={`w-full rounded-t-xl ${colorClass}`}
            style={{ height: `${Math.max((value / maxValue) * 100, value > 0 ? 8 : 4)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

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

  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchAnalytics(14);
  }, []);

  const fetchAnalytics = async (selectedDays: number) => {
    setLoading(true);
    setError("");
    setDays(selectedDays);

    const payload = await safeFetch(`/admin/api/analytics/bundle/?days=${selectedDays}&limit=6`);

    if (!payload) {
      setError("Failed to load analytics.");
      setLoading(false);
      return;
    }

    setOverview((((payload as any) || {}).overview as OverviewData) || null);
    setUserGrowth(Array.isArray((payload as any)?.user_growth) ? ((payload as any).user_growth as UserGrowthPoint[]) : []);
    setActivity(Array.isArray((payload as any)?.activity) ? ((payload as any).activity as ActivityPoint[]) : []);
    setTopUsers(Array.isArray((payload as any)?.top_users) ? ((payload as any).top_users as TopUser[]) : []);
    setTopProjects(Array.isArray((payload as any)?.top_projects) ? ((payload as any).top_projects as TopProject[]) : []);
    setTopTeams(Array.isArray((payload as any)?.top_teams) ? ((payload as any).top_teams as TopTeam[]) : []);
    setLoading(false);
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,#ecfeff_0%,#f8fafc_45%,#ffffff_100%)] px-6 py-7 shadow-sm">
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
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Growth Snapshot</h2>
              <p className="mt-1 text-sm text-slate-500">
                User signups and cumulative platform growth over the selected period.
              </p>
            </div>
            <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Current Users</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{growthSummary.latestCumulative}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <MiniBars
                data={userGrowth.map((point) => point.cumulative)}
                colorClass="bg-gradient-to-t from-cyan-600 to-sky-300"
              />
              <div className="mt-4 flex justify-between gap-2 overflow-hidden text-xs text-slate-500">
                {userGrowth.map((point) => (
                  <span key={point.date} className="min-w-0 truncate">
                    {formatShortDate(point.date)}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">New users in window</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{growthSummary.recentGrowth}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tracked work time</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {overview?.total_time_tracked || "0:00:00"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weekly momentum</p>
                <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-700">
                  <TrendingUp size={18} />
                  {overview?.new_users_this_week || 0} new accounts
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Operational Pulse</h2>
              <p className="mt-1 text-sm text-slate-500">
                Activity mix across time tracking, active users, and new project creation.
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3">
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

          <div className="mt-6 space-y-3">
            {activity.map((point) => {
              const total = point.time_entries + point.new_projects + point.active_users;
              const safeTotal = Math.max(total, 1);

              return (
                <div key={point.date} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{formatShortDate(point.date)}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {point.time_entries} entries, {point.active_users} active users, {point.new_projects} new projects
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{total} total events</span>
                  </div>

                  <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
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
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Performance Highlights</h2>
            <p className="mt-1 text-sm text-slate-500">
              Quick readouts to help you spot momentum without scanning raw dates.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
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

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Platform Base</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{growthSummary.latestCumulative}</p>
            <p className="mt-2 text-sm text-slate-600">
              Cumulative users based on the selected growth window.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today’s Active Users</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{overview?.active_users_today || 0}</p>
            <p className="mt-2 text-sm text-slate-600">
              People who logged tracked work today across the platform.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Top Users</h2>
              <p className="mt-1 text-sm text-slate-500">
                People contributing the most tracked work time.
              </p>
            </div>
            <div className="rounded-2xl bg-cyan-50 p-3">
              <Users size={20} className="text-cyan-700" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.user_id} className="rounded-2xl border border-slate-200 p-4">
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

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Top Projects</h2>
              <p className="mt-1 text-sm text-slate-500">
                Projects with the most recorded work time.
              </p>
            </div>
            <div className="rounded-2xl bg-purple-50 p-3">
              <FolderKanban size={20} className="text-purple-700" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {topProjects.map((project, index) => (
              <div key={`${project.project_id}-${index}`} className="rounded-2xl border border-slate-200 p-4">
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

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Top Teams</h2>
              <p className="mt-1 text-sm text-slate-500">
                Teams with the largest footprint across members and projects.
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3">
              <UsersRound size={20} className="text-amber-700" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {topTeams.map((team, index) => (
              <div key={team.team_id} className="rounded-2xl border border-slate-200 p-4">
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
