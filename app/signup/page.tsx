// src/app/signup/page.tsx
"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { getApiUrl } from "@/constant/apiendpoints";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const togglePass = () => setShowPass(!showPass);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password !== password2) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // 1. SIGNUP — works perfectly
      const signupRes = await fetch(getApiUrl("signup/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, password2 }),
      });

      if (!signupRes.ok) {
        const err = await signupRes.json();
        throw new Error(err.email?.[0] || err.username?.[0] || "Signup failed");
      }

      // 2. AUTO-LOGIN USING CORRECT JWT ENDPOINT + CORRECT FIELD NAMES
      const loginRes = await fetch(getApiUrl("token/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // SimpleJWT uses email/password
      });

      if (!loginRes.ok) {
        // Try to read server error to show a more helpful message
        let errBody: any = null;
        try {
          errBody = await loginRes.json();
        } catch (e) {
          // ignore parse errors
        }

        console.error("Auto-login failed (email payload)", { status: loginRes.status, body: errBody });

        // If token endpoint rejected email, try falling back to username (some backends expect username)
        try {
          const fallbackRes = await fetch(getApiUrl("token/"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });

          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            Cookies.set("access_token", fallbackData.access, { expires: 7 });
            Cookies.set("refresh_token", fallbackData.refresh, { expires: 7 });
            window.dispatchEvent(new Event("auth-changed"));
            const redirectTo = searchParams.get("redirect") || "/teams";
            window.location.href = redirectTo;
            return; // success via fallback
          }

          let fbBody = null;
          try {
            fbBody = await fallbackRes.json();
          } catch (e) {}
          console.error("Auto-login fallback failed (username payload)", { status: fallbackRes.status, body: fbBody });
        } catch (e) {
          console.error("Auto-login fallback request error", e);
        }

        // Surface a helpful server message if present. Try JSON fields, then raw text.
        let serverMsg = null;
        if (errBody) {
          serverMsg = errBody.detail || errBody.non_field_errors?.[0] || errBody.access || errBody.message || JSON.stringify(errBody);
        } else {
          try {
            const txt = await loginRes.text();
            if (txt) serverMsg = txt;
          } catch (e) {}
        }

        const finalMsg = serverMsg || "Signup succeeded but auto-login failed. Please login manually.";
        console.error("Auto-login error shown to user:", finalMsg);
        throw new Error(finalMsg);
      }

      const loginData = await loginRes.json();

      // SimpleJWT returns "access" and "refresh" — NOT access_token/refresh_token
      Cookies.set("access_token", loginData.access, { expires: 7 });
      Cookies.set("refresh_token", loginData.refresh, { expires: 7 });

      window.dispatchEvent(new Event("auth-changed"));

      const redirectTo = searchParams.get("redirect") || "/teams";
      window.location.href = redirectTo;
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Your existing beautiful JSX — unchanged */}
      <header className="bg-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Sign up</h1>
          <p className="mt-2 text-gray-600">Create your account and start tracking time</p>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="bg-white">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* All your input fields — keep exactly as they are */}
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-900 mb-2">Username</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                required disabled={isLoading} className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black disabled:bg-gray-50"
                placeholder="johndoe" />
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">E-mail</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required disabled={isLoading} className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black disabled:bg-gray-50"
                placeholder="you@example.com" />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">Password</label>
              <div className="relative">
                <input id="password" type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} required disabled={isLoading}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black disabled:bg-gray-50"
                  placeholder="Enter your password" />
                <button type="button" onClick={togglePass} disabled={isLoading}
                  className="absolute right-3 top-2.5 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400">
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="password2" className="block text-sm font-medium text-gray-900 mb-2">Confirm Password</label>
              <input id="password2" type={showPass ? "text" : "password"} value={password2}
                onChange={(e) => setPassword2(e.target.value)} required disabled={isLoading}
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black disabled:bg-gray-50"
                placeholder="Confirm your password" />
            </div>

            <div className="mb-6">
              <button type="submit" disabled={isLoading}
                className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md transition-colors disabled:bg-gray-400">
                {isLoading ? "Creating account..." : "Sign up"}
              </button>
            </div>

            <hr className="border-t border-gray-200 my-6" />
            <div className="text-base text-gray-700">
              <p className="mb-2">Already have an account?</p>
              <Link href="/login" className="text-blue-600 hover:underline">Log in here</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}