"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context-and-provider/AuthContext";
import { getApiUrl } from "@/constant/apiendpoints";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectParam = searchParams.get("redirect");
      const redirectTo = redirectParam
        ? (redirectParam.includes('/teams/AcceptInvite') ? '/teams' : redirectParam)
        : '/timer';
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, searchParams]);

  const togglePass = () => setShowPass(!showPass);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl("login/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Login failed");
      }

      const data = await response.json();
      const redirectParam = searchParams.get("redirect");
      const redirectTo = redirectParam
        ? (redirectParam.includes('/teams/AcceptInvite') ? '/teams' : redirectParam)
        : '/timer';

      login(data.access_token, data.refresh_token);
      window.dispatchEvent(new Event("auth-changed"));
      window.location.href = redirectTo;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#eef2f7_0%,#ffffff_100%)] flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left illustration / brand */}
          <div className="hidden md:flex flex-col items-start justify-center gap-6 p-10 bg-linear-to-b from-teal-600 to-cyan-500 text-white">
            <div className="flex items-center gap-3">
              {/* show logo from public (try common filenames) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Tickr logo" className="h-12 w-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="text-2xl font-semibold">Tickr</div>
            </div>

            <h2 className="text-3xl font-extrabold max-w-xs">Unlock Your Team <span className="text-cyan-100">Performance</span></h2>
            <p className="text-white/80 max-w-sm">A modern, fast time tracking tool with powerful team insights and simple workflows.</p>

            <div className="w-full">
              {/* simple decorative illustration */}
              <svg viewBox="0 0 600 400" className="w-full h-40 opacity-90" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                <rect x="0" y="0" width="600" height="400" rx="20" fill="rgba(255,255,255,0.03)" />
                <g transform="translate(40,40)">
                  <circle cx="60" cy="90" r="40" fill="#fff" opacity="0.08" />
                  <rect x="120" y="40" width="60" height="100" rx="8" fill="#fff" opacity="0.06" />
                  <rect x="220" y="30" width="80" height="120" rx="12" fill="#fff" opacity="0.06" />
                </g>
              </svg>
            </div>
          </div>

          {/* Right form */}
          <div className="p-8 md:p-12">
            <h3 className="text-2xl font-bold mb-1">Welcome to Ontime</h3>
            <p className="text-sm text-gray-500 mb-6">Unlock your team performance</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
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
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-md px-3 py-2 pr-20 focus:ring-2 focus:ring-cyan-300"
                    placeholder="Enter password"
                  />
                  <button type="button" onClick={togglePass} className="absolute right-3 top-2.5 text-sm text-cyan-600">{showPass ? 'Hide' : 'Show'}</button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link href="/forgot-password" className="text-cyan-600 hover:underline">Forgot password?</Link>
                </div>
              </div>

              <div>
                <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-md">
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>

              <div className="text-center text-sm text-gray-500">
                Don't have an account? <Link href={searchParams.get("redirect") ? `/signup?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : "/signup"} className="text-cyan-600 hover:underline">Register</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}