"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  FolderKanban,
  Timer,
  ChartColumn,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Teams", href: "/admin/teams", icon: UsersRound },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Time Entries", href: "/admin/time-entries", icon: Timer },
  { label: "Analytics", href: "/admin/analytics", icon: ChartColumn },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar({
  isOpen,
}: {
  isOpen: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const token = Cookies.get("access_token");
      const { getApiUrl } = await import("@/constant/apiendpoints");
      await fetch(getApiUrl("/api/logout/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    router.push("/login");
  };

  return (
    <aside
      className={`admin-sidebar sticky top-0 h-screen overflow-y-auto text-white transition-[width,opacity] duration-300 ${
        isOpen ? "w-80 opacity-100" : "w-0 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex min-h-full flex-col">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-400 via-sky-400 to-blue-500 text-lg font-black text-slate-950 shadow-lg shadow-cyan-950/20">
            T
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Tickr</h1>
            <p className="mt-1 text-sm text-slate-300">Admin command center</p>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Workspace</p>
          <p className="mt-2 text-sm text-slate-200">Monitor users, projects, time entries, analytics, and system settings.</p>
        </div>
      </div>

      <nav className="px-4 py-5">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                  isActive
                    ? "border border-cyan-400/30 bg-linear-to-r from-cyan-400/20 to-sky-400/12 text-white shadow-lg shadow-cyan-950/10"
                    : "border border-transparent text-slate-300 hover:bg-white/6 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto border-t border-white/10 bg-slate-950/75 px-4 pb-5 pt-6 backdrop-blur">
        <button
          onClick={() => void handleLogout()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500/12 px-4 py-3 font-medium text-rose-200 transition-colors hover:bg-rose-500/20"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
      </div>
    </aside>
  );
}
