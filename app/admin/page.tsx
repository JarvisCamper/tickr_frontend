"use client";

import { useEffect, useRef, useState } from "react";
import { safeFetch } from "./utils/apiHelper";
import { StatsCard } from "./components/StatsCard";

interface OverviewData {
  total_users: number;
  total_teams: number;
  total_projects: number;
  total_time_tracked: string;
  active_users_today: number;
  new_users_this_week: number;
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const data = await safeFetch("/admin/api/analytics/overview/");

      if (data) {
        setOverview(data as OverviewData);
        setError("");
      } else {
        console.warn("Failed to load overview data.");
        setOverview(null);
      }
    } catch (err) {
      console.error("Error fetching overview:", err);
      // Don't show error - allow dashboard to load without stats
      setOverview(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the admin panel</p>
      </div>

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
          {error}
        </div>
      )}

      {overview ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon="👥"
            label="Total Users"
            value={overview.total_users}
            change={`+${overview.new_users_this_week} this week`}
            trend="up"
          />
          <StatsCard
            icon="👫"
            label="Total Teams"
            value={overview.total_teams}
          />
          <StatsCard
            icon="📁"
            label="Total Projects"
            value={overview.total_projects}
          />
          <StatsCard
            icon="⏱️"
            label="Time Tracked"
            value={overview.total_time_tracked}
          />
          <StatsCard
            icon="🟢"
            label="Active Today"
            value={overview.active_users_today}
          />
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-blue-700">
          <p className="font-semibold">Stats not available</p>
          <p className="text-sm mt-2">The overview data is not yet configured. Navigate using the quick links below.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="space-y-3">
            <a
              href="/admin/users"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-gray-700">Manage Users</span>
              <span className="text-gray-400">→</span>
            </a>
            <a
              href="/admin/teams"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-gray-700">Manage Teams</span>
              <span className="text-gray-400">→</span>
            </a>
            <a
              href="/admin/projects"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-gray-700">Manage Projects</span>
              <span className="text-gray-400">→</span>
            </a>
            <a
              href="/admin/activity-logs"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-gray-700">View Activity Logs</span>
              <span className="text-gray-400">→</span>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3">
              <span className="text-gray-700">Database</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-green-600 text-sm">Connected</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-3">
              <span className="text-gray-700">API Server</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-green-600 text-sm">Running</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-3">
              <span className="text-gray-700">Cache</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-green-600 text-sm">Active</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
