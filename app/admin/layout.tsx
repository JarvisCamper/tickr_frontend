"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { Sidebar } from "./components/Sidebar";
import { AdminHeader } from "./components/AdminHeader";
import Cookies from "js-cookie";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAdmin, isLoading, user } = useAdminAuth();
  const hasCheckedRef = useRef(false);

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
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
