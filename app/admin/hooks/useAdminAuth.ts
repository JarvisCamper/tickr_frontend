"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context-and-provider/AuthContext";
import Cookies from "js-cookie";

export function useAdminAuth() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [finalLoading, setFinalLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to be ready
    if (isLoading) {
      return;
    }

    // Check if authenticated
    if (!isAuthenticated) {
      setIsAdmin(false);
      setFinalLoading(false);
      return;
    }

    // Check if user has admin flags
    if (user) {
      const adminCheck = user.is_admin || user.is_staff || user.is_superuser || user.role === 'admin';
      setIsAdmin(adminCheck);
      setFinalLoading(false);
    } else {
      // Still waiting for user data
      setFinalLoading(true);
    }
  }, [user, isAuthenticated, isLoading]);

  return { isAdmin, isLoading: finalLoading, user };
}
