"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Clock3, Search, Wallet } from "lucide-react";
import { safeFetch } from "../utils/apiHelper";

interface TimeEntry {
  id: number;
  username?: string;
  user_email?: string;
  project_name?: string | null;
  description: string;
  start_time: string;
  end_time?: string | null;
  duration?: string | null;
  is_running: boolean;
  overtime_hours?: string;
  overtime_pay?: string;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "In progress";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleString();
};

const formatMoney = (value?: string) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
};

const StatCard = ({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: string;
}) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      </div>
      <div className={`rounded-2xl p-3 ${tone}`}>{icon}</div>
    </div>
  </div>
);

export default function AdminTimeEntriesPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (statusFilter) params.set("status", statusFilter);

    const query = params.toString();
    const endpoint = query ? `/admin/api/time-entries/?${query}` : "/admin/api/time-entries/";
    const data = await safeFetch(endpoint);

    if (data) {
      setEntries(Array.isArray(data) ? data : data.results || []);
    } else {
      setEntries([]);
      setError("Failed to load time entries.");
    }

    setLoading(false);
  };

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          !search ||
          (entry.username || "").toLowerCase().includes(search) ||
          (entry.user_email || "").toLowerCase().includes(search) ||
          (entry.project_name || "").toLowerCase().includes(search) ||
          (entry.description || "").toLowerCase().includes(search);

        const matchesStatus =
          !statusFilter ||
          (statusFilter === "running" && entry.is_running) ||
          (statusFilter === "completed" && !entry.is_running);

        return matchesSearch && matchesStatus;
      }),
    [entries, searchTerm, statusFilter]
  );

  const stats = useMemo(() => {
    const runningCount = entries.filter((entry) => entry.is_running).length;
    const completedCount = entries.length - runningCount;
    const totalOvertimeHours = entries.reduce(
      (sum, entry) => sum + Number(entry.overtime_hours || 0),
      0
    );
    const totalOvertimePay = entries.reduce(
      (sum, entry) => sum + Number(entry.overtime_pay || 0),
      0
    );

    return {
      runningCount,
      completedCount,
      totalOvertimeHours: totalOvertimeHours.toFixed(2),
      totalOvertimePay: totalOvertimePay.toFixed(2),
    };
  }, [entries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,#ecfeff_0%,#f8fafc_48%,#ffffff_100%)] px-6 py-7 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Workforce Monitoring</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Time Entries</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review employee work logs, running timers, and overtime totals from one clean dashboard.
            </p>
          </div>
          <button
            onClick={fetchEntries}
            className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Running Timers"
          value={stats.runningCount}
          icon={<Activity size={20} className="text-amber-700" />}
          tone="bg-amber-50"
        />
        <StatCard
          label="Completed Entries"
          value={stats.completedCount}
          icon={<Clock3 size={20} className="text-emerald-700" />}
          tone="bg-emerald-50"
        />
        <StatCard
          label="Overtime Hours"
          value={stats.totalOvertimeHours}
          icon={<Clock3 size={20} className="text-sky-700" />}
          tone="bg-sky-50"
        />
        <StatCard
          label="Overtime Pay"
          value={`$${stats.totalOvertimePay}`}
          icon={<Wallet size={20} className="text-cyan-700" />}
          tone="bg-cyan-50"
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,1fr)_220px_180px]">
            <label className="relative block">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by user, email, project, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-cyan-500"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-cyan-500"
            >
              <option value="">All Statuses</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
            </select>
            <div className="hidden xl:flex items-center justify-end text-sm text-slate-500">
              Showing {filteredEntries.length} of {entries.length} entries
            </div>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-base font-medium text-slate-700">No time entries found</p>
            <p className="mt-2 text-sm text-slate-500">
              Try changing the search or status filter to find different records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Project</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Started</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ended</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">OT Hours</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">OT Pay</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 align-top">
                      <p className="font-semibold text-slate-900">
                        {entry.username || entry.user_email || "Unknown user"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{entry.user_email || "No email"}</p>
                    </td>
                    <td className="px-5 py-4 align-top text-sm text-slate-600">
                      {entry.project_name || "No project"}
                    </td>
                    <td className="px-5 py-4 align-top text-sm text-slate-600 max-w-[260px]">
                      <p className="line-clamp-2">{entry.description || "-"}</p>
                    </td>
                    <td className="px-5 py-4 align-top text-sm text-slate-600">
                      {formatDateTime(entry.start_time)}
                    </td>
                    <td className="px-5 py-4 align-top text-sm text-slate-600">
                      {formatDateTime(entry.end_time)}
                    </td>
                    <td className="px-5 py-4 align-top text-sm font-medium text-slate-800">
                      {entry.duration || (entry.is_running ? "Running" : "N/A")}
                    </td>
                    <td className="px-5 py-4 align-top text-sm text-slate-600">
                      {entry.overtime_hours || "0.00"}
                    </td>
                    <td className="px-5 py-4 align-top text-sm font-medium text-slate-800">
                      ${formatMoney(entry.overtime_pay)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          entry.is_running
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {entry.is_running ? "Running" : "Completed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500 xl:hidden">
          Showing {filteredEntries.length} of {entries.length} entries
        </div>
      </section>
    </div>
  );
}
