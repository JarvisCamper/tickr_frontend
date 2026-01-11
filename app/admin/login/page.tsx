"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Deprecated: Admin-specific login removed. Redirect to unified /login.
export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return null;
}
