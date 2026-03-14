"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Users, UsersRound, FolderKanban, Activity } from "lucide-react";
import { safeFetch } from "./utils/apiHelper";
import { StatsCard } from "./components/StatsCard";

interface OverviewData {
  total_users?: number;
  total_teams?: number;
  total_projects?: number;
  total_time_tracked?: string;
  active_users_today?: number;
  new_users_this_week?: number;
}

interface AdminUser {
  id: number;
  username?: string;
  email: string;
  is_active?: boolean;
  created_at?: string;
}

interface AdminTeam {
  id: number;
  name: string;
  owner_username?: string;
  owner_email?: string;
  members_count?: number;
  created_at?: string;
}

interface AdminProject {
  id: number;
  name: string;
  type?: string;
  creator_username?: string;
  creator_email?: string;
  created_at?: string;
}

interface AdminLog {
  id: number;
  action: string;
  description?: string;
  created_at?: string;
  admin_username?: string;
  admin_email?: string;
}

type RowTab = "users" | "teams" | "projects" | "activity";

const tabs: Array<{ key: RowTab; label: string }> = [
  { key: "users", label: "Recent Users" },
  { key: "teams", label: "Recent Teams" },
  { key: "projects", label: "Recent Projects" },
  { key: "activity", label: "Recent Activity" },
];

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString();
};

const firstList = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as any).results)) {
    return (data as any).results as T[];
  }
  return [];
};

export default function AdminDashboard() {
  const [overview, setOverview] = useState<OverviewData>({});
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [activeTab, setActiveTab] = useState<RowTab>("users");
  const [loading, setLoading] = useState(true);

  const initRef = useRef(false);

  const fetchDashboardData = async () => {
    try {
      const payload = await safeFetch("/admin/api/analytics/dashboard/");

      setOverview((((payload as any) || {}).overview as OverviewData) || {});
      setUsers(firstList<AdminUser>((payload as any)?.users));
      setTeams(firstList<AdminTeam>((payload as any)?.teams));
      setProjects(firstList<AdminProject>((payload as any)?.projects));
      setLogs(firstList<AdminLog>((payload as any)?.activity_logs));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchDashboardData();
  }, []);

  const tableRows = useMemo(() => {
    if (activeTab === "users") {
      return users.slice(0, 8).map((user) => ({
        id: `user-${user.id}`,
        name: user.username || user.email,
        meta: user.email,
        type: user.is_active ? "Active" : "Inactive",
        status: user.is_active ? "Online" : "Offline",
        date: formatDate(user.created_at),
        href: "/admin/users",
      }));
    }

    if (activeTab === "teams") {
      return teams.slice(0, 8).map((team) => ({
        id: `team-${team.id}`,
        name: team.name,
        meta: team.owner_username || team.owner_email || "No owner",
        type: `${team.members_count || 0} members`,
        status: "Team",
        date: formatDate(team.created_at),
        href: "/admin/teams",
      }));
    }

    if (activeTab === "projects") {
      return projects.slice(0, 8).map((project) => ({
        id: `project-${project.id}`,
        name: project.name,
        meta: project.creator_username || project.creator_email || "Unknown",
        type: project.type || "general",
        status: "Project",
        date: formatDate(project.created_at),
        href: "/admin/projects",
      }));
    }

    return logs.slice(0, 8).map((log) => ({
      id: `log-${log.id}`,
      name: log.admin_username || log.admin_email || "System",
      meta: log.description || "-",
      type: log.action || "event",
      status: "Logged",
      date: formatDate(log.created_at),
      href: "/admin/activity-logs",
    }));
  }, [activeTab, users, teams, projects, logs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          icon={<Users size={22} />}
          label="Total Users"
          value={overview.total_users ?? users.length}
          change={overview.new_users_this_week ? `+${overview.new_users_this_week} this week` : undefined}
          trend="up"
          tone="blue"
        />
        <StatsCard
          icon={<UsersRound size={22} />}
          label="Total Teams"
          value={overview.total_teams ?? teams.length}
          tone="amber"
        />
        <StatsCard
          icon={<FolderKanban size={22} />}
          label="Total Projects"
          value={overview.total_projects ?? projects.length}
          tone="purple"
        />
        <StatsCard
          icon={<Activity size={22} />}
          label="Active Users Today"
          value={overview.active_users_today ?? "-"}
          tone="green"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                  : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900">{row.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{row.meta}</td>
                  <td className="px-4 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{row.status}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{row.date}</td>
                  <td className="px-4 py-4">
                    <Link
                      href={row.href}
                      className="text-cyan-700 text-sm font-semibold hover:text-cyan-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tableRows.length === 0 && (
          <div className="text-center py-12 text-gray-500">No data available yet.</div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-cyan-200 transition-colors"
        >
          <p className="text-sm text-gray-500">Manage</p>
          <h3 className="text-lg font-semibold text-gray-900 mt-1">Users</h3>
          <p className="text-sm text-gray-600 mt-2">View accounts, status, and roles.</p>
        </Link>
        <Link
          href="/admin/analytics"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-cyan-200 transition-colors"
        >
          <p className="text-sm text-gray-500">Analyze</p>
          <h3 className="text-lg font-semibold text-gray-900 mt-1">Analytics</h3>
          <p className="text-sm text-gray-600 mt-2">Review growth and platform activity.</p>
        </Link>
        <Link
          href="/admin/activity-logs"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-cyan-200 transition-colors"
        >
          <p className="text-sm text-gray-500">Audit</p>
          <h3 className="text-lg font-semibold text-gray-900 mt-1">Activity Logs</h3>
          <p className="text-sm text-gray-600 mt-2">Track changes and admin events.</p>
        </Link>
      </div>
    </div>
  );
}
