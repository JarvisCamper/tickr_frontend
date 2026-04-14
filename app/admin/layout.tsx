"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { Sidebar } from "./components/Sidebar";
import { AdminHeader } from "./components/AdminHeader";
import { AdminFooter } from "./components/AdminFooter";
import Cookies from "js-cookie";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isLoading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const token = Cookies.get("access_token");

    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isAdmin) {
      router.replace("/timer");
    }
  }, [isAdmin, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-shell flex">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] md:hidden"
        />
      ) : null}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => {
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            setSidebarOpen(false);
          }
        }}
      />
      <div className="flex-1 flex flex-col">
        <AdminHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((current) => !current)}
        />
        <main className="flex-1 overflow-auto px-3 pb-6 pt-3 sm:px-4 md:px-6 md:pb-8 md:pt-4">
          <div className="mx-auto flex min-h-full max-w-7xl flex-col">
            <div className="flex-1">{children}</div>
            <AdminFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
