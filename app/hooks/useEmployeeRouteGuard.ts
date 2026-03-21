"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminUser, useAuth } from "@/context-and-provider/AuthContext";

export function useEmployeeRouteGuard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (isAdminUser(user)) {
      router.replace("/admin");
    }
  }, [isAuthenticated, isLoading, router, user]);

  return {
    user,
    isLoading,
    isAuthenticated,
    isEmployeeAllowed: isAuthenticated && !isAdminUser(user),
  };
}
