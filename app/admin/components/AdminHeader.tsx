"use client";

import { useAuth } from "@/context-and-provider/AuthContext";

export function AdminHeader() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex-1">
        <h2 className="text-gray-900 font-semibold">Admin Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.username}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
          {user?.username?.[0]?.toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
}
