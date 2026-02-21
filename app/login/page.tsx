"use client";

import React, { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context-and-provider/AuthContext";
import { apiLogin } from "../api/auth/login";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // If already authenticated on page load, redirect
    if (isAuthenticated && user) {
      const userData = user as any;
      const isAdmin = userData.is_admin || userData.is_staff || userData.is_superuser || userData.role === 'admin';
      const target = isAdmin ? '/admin' : '/timer';
      router.replace(target);
    }
  }, [isAuthenticated, user, router]);

  const togglePass = () => setShowPass(!showPass);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // response from POST /api/login/
      const result = await apiLogin({ email, password });
      const data = result.data as any;
      setDebugInfo(data);

      if (!result.ok) {
        setError(data.detail || "Login failed");
        return;
      }

      // Save tokens client-side
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // Keep existing app auth flow in sync (cookies + context)
      login(data.access, data.refresh, data.user as any);
      window.dispatchEvent(new Event("auth-changed"));

      // Even shorter (recommended, uses backend decision):
      router.replace(data.redirect_url || "/employee");

    } catch (err: any) {
      // Parse and show user-friendly error messages
      let errorMessage = "Login failed. Please try again.";
      
      if (typeof err === "string") {
        try {
          const parsed = JSON.parse(err);
          if (parsed.detail) {
            errorMessage = parsed.detail === "No active account found with the given credentials"
              ? "Invalid email or password. Please check your credentials."
              : parsed.detail;
          }
        } catch {
          errorMessage = err;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === "object") {
        // Handle common error formats from API
        if (err.detail) {
          errorMessage = err.detail === "No active account found with the given credentials"
            ? "Invalid email or password. Please check your credentials."
            : err.detail;
        } else if (err.message) {
          errorMessage = err.message;
        } else if (err.error) {
          errorMessage = err.error;
        }
      }
      
      setError(errorMessage);
      setDebugInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#eef2f7_0%,#ffffff_100%)] flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div className="hidden md:flex flex-col items-start justify-center gap-6 p-10 bg-linear-to-b from-teal-600 to-cyan-500 text-white">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold">Tickr</div>
            </div>
            <h2 className="text-3xl font-extrabold max-w-xs">
              Unlock Your Team <span className="text-cyan-100">Performance</span>
            </h2>
            <p className="text-white/80 max-w-sm">
              A modern, fast time tracking tool with powerful team insights and simple workflows.
            </p>
          </div>

          <div className="p-8 md:p-12">
            <h3 className="text-2xl font-bold mb-1">Welcome to Tickr</h3>
            <p className="text-sm text-gray-500 mb-6">Unlock your team performance</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-300"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-md px-3 py-2 pr-20 focus:ring-2 focus:ring-cyan-300"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={togglePass}
                    className="absolute right-3 top-2.5 text-sm text-cyan-600"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-md disabled:opacity-70"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </div>

              <div className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link
                  href={
                    searchParams.get("redirect")
                      ? `/signup?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
                      : "/signup"
                  }
                  className="text-cyan-600 hover:underline"
                >
                  Register
                </Link>
              </div>
            </form>

            {/* Debug panel (visible when debugInfo exists) */}
            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                <div className="font-medium mb-1">Debug (raw auth response)</div>
                <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
