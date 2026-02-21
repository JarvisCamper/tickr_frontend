"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  FolderKanban,
  ChartColumn,
  ScrollText,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Teams", href: "/admin/teams", icon: UsersRound },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Analytics", href: "/admin/analytics", icon: ChartColumn },
  { label: "Activity Logs", href: "/admin/activity-logs", icon: ScrollText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    router.push("/login");
  };

  return (
    <aside className="w-72 border-r border-gray-200 bg-white h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Tickr</h1>
        <p className="text-sm mt-1 text-gray-500">Admin Portal</p>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                    : "text-gray-600 hover:bg-gray-50 border border-transparent"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
