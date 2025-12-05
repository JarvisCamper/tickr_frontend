"use client";

import React, { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context-and-provider/AuthContext";
import { apiLogin } from "../api/auth/login";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectParam = searchParams.get("redirect");
      const redirectTo = redirectParam
        ? (redirectParam.includes('/teams/AcceptInvite') ? '/teams' : redirectParam)
        : '/teams';
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, searchParams]);

  const togglePass = () => setShowPass(!showPass);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Use central auth helper which will try token/login endpoints and normalize tokens
      const tokens = await apiLogin({ email, password });

      // clear debug on success
      setDebugInfo(null);

      login(tokens.access, tokens.refresh);
      window.dispatchEvent(new Event("auth-changed"));

      const redirectTo = searchParams.get("redirect") || "/teams";
      window.location.href = redirectTo;
    } catch (err: any) {
      // Show detailed message whether err is Error, string, or object
      const msg =
        typeof err === "string"
          ? err
          : err instanceof Error
          ? err.message
          : err && typeof err === "object"
          ? JSON.stringify(err)
          : "Login failed";
      setError(msg);
      // capture raw details if present
      setDebugInfo(err?.details || err);
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
                Don't have an account?{" "}
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