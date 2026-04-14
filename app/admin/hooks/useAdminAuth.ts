"use client";

import { useMemo } from "react";
import { useAuth, isAdminUser } from "@/context-and-provider/AuthContext";
import Cookies from "js-cookie";

export function useAdminAuth() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const hasToken = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return Boolean(Cookies.get("access_token"));
  }, []);

  const finalLoading = isLoading || (hasToken && isAuthenticated && !user);
  const isAdmin = isAdminUser(user);

  return { isAdmin, isLoading: finalLoading, user };
}
