"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { login } from "../api/auth/login";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const togglePass = () => setShowPass(!showPass);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const credentials = { email, password };

    login({ email, password })
      .then((response) => {
        console.log("Login successful:", response);
        router.push("/");
      })
      .catch((error) => {
        console.error("Login failed:", error);
        console.log("Login failed. Please check your credentials and try again.");
      });
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Log in</h1>
          <p className="mt-2 text-gray-600">
            Log in to your account and start tracking time
          </p>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="bg-white">
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
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field with Show/Hide */}
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
                  // type={mounted && showPass ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className="w-full border border-gray-200 rounded-md px-3 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
                  placeholder="Enter your password"
                />
  
                  <button
                    type="button"
                    onClick={togglePass}
                    className="absolute right-3 top-2.5 text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>

              </div>
            </div>

            {/* Submit Button */}
            <div className="mb-6">
              <button
                type="submit"
                className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md transition-colors"
              >
                Log in
              </button>
            </div>

            <hr className="border-t border-gray-200 my-6" />

            <div className="text-base text-gray-700">
              <p className="mb-2">Don't have an account?</p>
              <Link href="/signup" className="text-blue-600 hover:underline">
                Create one for free
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}