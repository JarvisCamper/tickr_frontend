"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context-and-provider/AuthContext";

const titleMap: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Dashboard", subtitle: "System overview and recent activity" },
  "/admin/users": { title: "Users", subtitle: "Manage and review registered users" },
  "/admin/teams": { title: "Teams", subtitle: "Track team ownership and membership" },
  "/admin/projects": { title: "Projects", subtitle: "Review projects across all teams" },
  "/admin/analytics": { title: "Analytics", subtitle: "Growth and activity insights" },
  "/admin/activity-logs": { title: "Activity Logs", subtitle: "Audit events and actions" },
  "/admin/settings": { title: "Settings", subtitle: "Admin configuration and controls" },
};

export function AdminHeader() {
  const { user } = useAuth();
  const pathname = usePathname();

  const current =
    titleMap[pathname] ||
    Object.entries(titleMap).find(([key]) => pathname.startsWith(key))?.[1] ||
    titleMap["/admin"];

  return (
    <header className="bg-white/90 backdrop-blur border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex-1">
        <h2 className="text-gray-900 text-2xl font-bold">{current.title}</h2>
        <p className="text-sm text-gray-500 mt-1">{current.subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{user?.username}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-semibold">
          {user?.username?.[0]?.toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
}
