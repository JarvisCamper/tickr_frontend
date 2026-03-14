"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Search, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { safeFetch } from "../utils/apiHelper";

interface ActivityLog {
  id: number;
  admin_username?: string | null;
  admin_email?: string | null;
  action: string;
  target_type?: string;
  target_id?: number | null;
  description: string;
  ip_address?: string | null;
  created_at: string;
}

interface AuthEvent {
  id: number;
  username?: string | null;
  user_email?: string | null;
  event_type: string;
  role?: string | null;
  ip_address?: string | null;
  created_at: string;
}

const formatDateTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const actionToneMap: Record<string, string> = {
  user_create: "bg-emerald-100 text-emerald-800",
  user_update: "bg-sky-100 text-sky-800",
  user_delete: "bg-rose-100 text-rose-800",
  user_suspend: "bg-amber-100 text-amber-800",
  user_activate: "bg-emerald-100 text-emerald-800",
  team_delete: "bg-rose-100 text-rose-800",
  project_delete: "bg-rose-100 text-rose-800",
  settings_update: "bg-violet-100 text-violet-800",
  login: "bg-cyan-100 text-cyan-800",
  logout: "bg-slate-200 text-slate-700",
};

const prettyAction = (action: string) =>
  action
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const summaryIconMap = {
  auth: <ShieldCheck size={20} className="text-cyan-700" />,
  changes: <UserCog size={20} className="text-sky-700" />,
  destructive: <Trash2 size={20} className="text-rose-700" />,
  activity: <Activity size={20} className="text-amber-700" />,
};

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
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
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const [auditData, authData] = await Promise.all([
      safeFetch("/admin/api/activity-logs/"),
      safeFetch("/admin/api/auth-events/"),
    ]);

    if (auditData) {
      setLogs(Array.isArray(auditData) ? auditData : auditData.results || []);
    } else {
      setLogs([]);
    }

    if (authData) {
      setAuthEvents(Array.isArray(authData) ? authData : authData.results || []);
    } else {
      setAuthEvents([]);
    }

    if (!auditData && !authData) {
      setError("Failed to load activity logs.");
    }
    setLoading(false);
  };

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        const matchesAction = filterAction === "" || log.action === filterAction;
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          !search ||
          (log.admin_username || "").toLowerCase().includes(search) ||
          (log.admin_email || "").toLowerCase().includes(search) ||
          (log.description || "").toLowerCase().includes(search) ||
          (log.target_type || "").toLowerCase().includes(search) ||
          (log.ip_address || "").toLowerCase().includes(search);

        return matchesAction && matchesSearch;
      }),
    [logs, filterAction, searchTerm]
  );

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

  const stats = useMemo(() => {
    const authEvents = logs.filter((log) => log.action === "login" || log.action === "logout").length;
    const destructiveEvents = logs.filter((log) => log.action.includes("delete") || log.action.includes("suspend")).length;
    const settingsEvents = logs.filter((log) => log.action === "settings_update").length;
    const uniqueAdmins = new Set(logs.map((log) => log.admin_email || log.admin_username || `system-${log.id}`)).size;

    return { authEvents, destructiveEvents, settingsEvents, uniqueAdmins };
  }, [logs]);

  const filteredAuthEvents = useMemo(
    () =>
      authEvents.filter((event) => {
        const search = searchTerm.toLowerCase();
        return (
          !search ||
          (event.username || "").toLowerCase().includes(search) ||
          (event.user_email || "").toLowerCase().includes(search) ||
          (event.role || "").toLowerCase().includes(search) ||
          (event.ip_address || "").toLowerCase().includes(search)
        );
      }),
    [authEvents, searchTerm]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,#f0fdf4_0%,#f8fafc_42%,#ffffff_100%)] px-6 py-7 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Audit Trail</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Activity Logs</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review admin operations, security-sensitive actions, and platform changes in one searchable timeline.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Refresh Logs
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Events" value={logs.length} icon={summaryIconMap.activity} tone="bg-amber-50" />
        <SummaryCard label="Auth Events" value={stats.authEvents} icon={summaryIconMap.auth} tone="bg-cyan-50" />
        <SummaryCard label="Settings Changes" value={stats.settingsEvents} icon={summaryIconMap.changes} tone="bg-sky-50" />
        <SummaryCard label="Destructive Events" value={stats.destructiveEvents} icon={summaryIconMap.destructive} tone="bg-rose-50" />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
            <label className="relative block">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by admin, description, target, or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500"
              />
            </label>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {prettyAction(action)}
                </option>
              ))}
            </select>

            <div className="hidden lg:flex items-center justify-end text-sm text-slate-500">
              {filteredLogs.length} shown • {stats.uniqueAdmins} admins
            </div>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-base font-medium text-slate-700">No activity logs found</p>
            <p className="mt-2 text-sm text-slate-500">
              Try a different search term or action filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-5">
            {filteredLogs.map((log) => (
              <article
                key={log.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-950">
                        {log.admin_username || log.admin_email || "System"}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          actionToneMap[log.action] || "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {prettyAction(log.action)}
                      </span>
                      {log.target_type ? (
                        <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200">
                          {log.target_type}
                          {log.target_id ? ` #${log.target_id}` : ""}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-700">{log.description}</p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                      <span>{formatDateTime(log.created_at)}</span>
                      {log.admin_email ? <span>{log.admin_email}</span> : null}
                      {log.ip_address ? <span>IP: {log.ip_address}</span> : null}
                    </div>
                  </div>

                  <div className="xl:w-40 xl:text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Record ID</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">#{log.id}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500 lg:hidden">
          Showing {filteredLogs.length} of {logs.length} activity records
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">User Access History</h2>
              <p className="mt-1 text-sm text-slate-500">
                Login and logout records for all users across the platform.
              </p>
            </div>
            <div className="text-sm text-slate-500">
              Showing {filteredAuthEvents.length} of {authEvents.length} access events
            </div>
          </div>
        </div>

        {filteredAuthEvents.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-base font-medium text-slate-700">No user access events found</p>
            <p className="mt-2 text-sm text-slate-500">
              New login and logout records will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-5">
            {filteredAuthEvents.map((event) => (
              <article
                key={`auth-${event.id}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-950">
                        {event.username || event.user_email || "Unknown user"}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          event.event_type === "login"
                            ? "bg-cyan-100 text-cyan-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {event.event_type === "login" ? "Login" : "Logout"}
                      </span>
                      {event.role ? (
                        <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200">
                          {event.role}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                      <span>{formatDateTime(event.created_at)}</span>
                      {event.user_email ? <span>{event.user_email}</span> : null}
                      {event.ip_address ? <span>IP: {event.ip_address}</span> : null}
                    </div>
                  </div>

                  <div className="xl:w-40 xl:text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Access ID</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">#{event.id}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
