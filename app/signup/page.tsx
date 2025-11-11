"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

export default function SignupPage() {
  const router = useRouter();
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

    // Validate passwords match
    if (password !== password2) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Sign up
      const signupResponse = await fetch("http://127.0.0.1:8000/api/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, password2 }),
      });

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        throw new Error(errorData.email?.[0] || errorData.username?.[0] || "Signup failed");
      }

      console.log("Signup successful! Now logging in...");

      // Step 2: Auto-login after successful signup
      const loginResponse = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        throw new Error("Signup succeeded but auto-login failed. Please login manually.");
      }

      const loginData = await loginResponse.json();

      // Store tokens in cookies
      Cookies.set("access_token", loginData.access_token, { expires: 7 });
      Cookies.set("refresh_token", loginData.refresh_token, { expires: 7 });

      console.log("Auto-login successful!");

      // Notify navbar of auth change
      window.dispatchEvent(new Event("auth-changed"));

      // Redirect to timer page
      router.push("/timer");
    } catch (error) {
      console.error("Signup failed:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Signup failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (error) setError(null);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  const handlePassword2Change = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword2(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Sign up</h1>
          <p className="mt-2 text-gray-600">
            Create your account and start tracking time
          </p>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="bg-white">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Username Field */}
            <div className="mb-6">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                required
                disabled={isLoading}
                suppressHydrationWarning
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="johndoe"
              />
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={isLoading}
                suppressHydrationWarning
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  disabled={isLoading}
                  suppressHydrationWarning
                  className="w-full border border-gray-200 rounded-md px-3 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black disabled:bg-gray-50 disabled:cursor-not-allowed"
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

            {/* Confirm Password Field */}
            <div className="mb-6">
              <label
                htmlFor="password2"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="password2"
                type={showPass ? "text" : "password"}
                value={password2}
                onChange={handlePassword2Change}
                required
                disabled={isLoading}
                suppressHydrationWarning
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Confirm your password"
              />
            </div>

            {/* Submit Button */}
            <div className="mb-6">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account..." : "Sign up"}
              </button>
            </div>

            <hr className="border-t border-gray-200 my-6" />

            <div className="text-base text-gray-700">
              <p className="mb-2">Already have an account?</p>
              <Link href="/login" className="text-blue-600 hover:underline">
                Log in here
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}