"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context-and-provider/AuthContext";
import { Menu } from "lucide-react";

const titleMap: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Dashboard", subtitle: "System overview and recent activity" },
  "/admin/users": { title: "Users", subtitle: "Manage and review registered users" },
  "/admin/teams": { title: "Teams", subtitle: "Track team ownership and membership" },
  "/admin/projects": { title: "Projects", subtitle: "Review projects across all teams" },
  "/admin/time-entries": { title: "Time Entries", subtitle: "Review active timers and completed work logs" },
  "/admin/screenshots": { title: "Screenshots", subtitle: "Review user captures collected during tracked sessions" },
  "/admin/analytics": { title: "Analytics", subtitle: "Growth and activity insights" },
  "/admin/activity-logs": { title: "Activity Logs", subtitle: "Audit events and actions" },
  "/admin/settings": { title: "Settings", subtitle: "Admin configuration and controls" },
};

export function AdminHeader({
  sidebarOpen,
  onToggleSidebar,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  const { user } = useAuth();
  const pathname = usePathname();

  const current =
    titleMap[pathname] ||
    Object.entries(titleMap).find(([key]) => pathname.startsWith(key))?.[1] ||
    titleMap["/admin"];

  return (
    <header className="sticky top-0 z-40 bg-white/55 px-4 pb-2 pt-3 backdrop-blur-xl md:px-6 md:pt-4">
      <div className="admin-panel flex items-center justify-between rounded-[1.55rem] px-4 py-4 md:px-5">
      <div className="flex flex-1 items-start gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu size={20} />
        </button>
        <div className="flex-1">
          <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Admin workspace
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{current.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{current.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-900">{user?.username}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-600 font-semibold text-white shadow-lg shadow-cyan-900/20">
          {user?.username?.[0]?.toUpperCase() || "A"}
        </div>
      </div>
      </div>
    </header>
  );
}
