"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const togglePass = () => setShowPass(!showPass);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Login failed");
      }

      const data = await response.json();
      Cookies.set("access_token", data.access_token, { expires: 7 });
      Cookies.set("refresh_token", data.refresh_token, { expires: 7 });
      window.dispatchEvent(new Event("auth-changed"));
      router.push("/timer");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Log in</h1>
          <p className="mt-2 text-gray-600">Log in to your account and start tracking time</p>
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

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                suppressHydrationWarning
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black disabled:bg-gray-50"
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  suppressHydrationWarning
                  className="w-full border border-gray-200 rounded-md px-3 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black disabled:bg-gray-50"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePass}
                  disabled={isLoading}
                  className="absolute right-3 top-2.5 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md transition-colors disabled:bg-gray-400"
              >
                {isLoading ? "Logging in..." : "Log in"}
              </button>
            </div>

            <hr className="border-t border-gray-200 my-6" />

            <div className="text-base text-gray-700">
              <p className="mb-2">Don't have an account?</p>
              <Link href="/signup" className="text-blue-600 hover:underline">Create one for free</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}