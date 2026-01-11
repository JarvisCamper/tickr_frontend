"use client";

import { useEffect, useRef, useState } from "react";
import { safeFetch } from "../utils/apiHelper";

interface AnalyticsData {
  overview?: {
    total_users: number;
    total_teams: number;
    total_projects: number;
  };
  user_growth?: Array<{ date: string; count: number }>;
  activity?: Array<{ date: string; count: number }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const [overview, growth, activity] = await Promise.all([
      safeFetch("/admin/api/analytics/overview/"),
      safeFetch("/admin/api/analytics/users/growth/"),
      safeFetch("/admin/api/analytics/activity/"),
    ]);

    const result: AnalyticsData = {};

    if (overview) {
      result.overview = overview;
    }
    if (growth) {
      result.user_growth = growth;
    }
    if (activity) {
      result.activity = activity;
    }

    setData(result);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">System-wide analytics and insights</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {data.overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.overview.total_users}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-gray-600 text-sm font-medium">Total Teams</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.overview.total_teams}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-gray-600 text-sm font-medium">Total Projects</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{data.overview.total_projects}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.user_growth && data.user_growth.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="space-y-2">
              {data.user_growth.slice(-7).map((item) => (
                <div key={item.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.date}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-blue-200 rounded-full" style={{ width: `${Math.min(item.count * 5, 200)}px` }}></div>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.activity && data.activity.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {data.activity.slice(-7).map((item) => (
                <div key={item.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.date}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-green-200 rounded-full" style={{ width: `${Math.min(item.count * 3, 200)}px` }}></div>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
