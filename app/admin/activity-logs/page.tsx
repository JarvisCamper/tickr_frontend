"use client";

import { useEffect, useRef, useState } from "react";
import { safeFetch } from "../utils/apiHelper";

interface ActivityLog {
  id: number;
  user: { username: string };
  action: string;
  description: string;
  timestamp: string;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterAction, setFilterAction] = useState("");

  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const data = await safeFetch("/admin/api/activity-logs/");
    
    if (data) {
      setLogs(Array.isArray(data) ? data : data.results || []);
    } else {
      setLogs([]);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter(
    (log) => filterAction === "" || log.action === filterAction
  );

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

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
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600 mt-2">Audit trail of all system activities</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All Actions</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{log.user.username}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {log.action}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{log.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No activity logs found</p>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600">
        Showing {filteredLogs.length} of {logs.length} activities
      </div>
    </div>
  );
}
