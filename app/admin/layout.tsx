"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const { isAdmin, isLoading } = useAdminAuth();
  const hasCheckedRef = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isLoading && !hasCheckedRef.current) {
      hasCheckedRef.current = true;
      
      // Check if user has token and admin status
      const token = Cookies.get('access_token');
      
      // If no token, redirect to login
      if (!token) {
        router.push("/login");
        return;
      }
      
      // If token exists but user is not admin, redirect to regular dashboard
      if (!isAdmin) {
        router.push("/timer");
        return;
      }
    }
  }, [isAdmin, isLoading, router]);

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">Admin access denied</p>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell flex">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col">
        <AdminHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((current) => !current)}
        />
        <main className="flex-1 overflow-auto px-4 pb-6 pt-3 md:px-6 md:pb-8 md:pt-4">
          <div className="mx-auto flex min-h-full max-w-7xl flex-col">
            <div className="flex-1">{children}</div>
            <AdminFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
