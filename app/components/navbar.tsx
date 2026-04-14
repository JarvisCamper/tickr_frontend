'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/context-and-provider/AuthContext';
import { Bell, BriefcaseBusiness, ChartColumnBig, Clock3, Menu, UserRound, Users, X } from 'lucide-react';

// Type definitions
interface NavLink {
  name: string;
  href: string;
}

// Constants
const AUTHENTICATED_LINKS: NavLink[] = [
  { name: 'Timer', href: '/timer' },
  { name: 'Projects', href: '/projects' },
  { name: 'Teams', href: '/teams' },
  { name: 'Reports', href: '/reports' },
];

const PUBLIC_LINKS: NavLink[] = [
  { name: 'Features', href: '/features' },
  { name: 'Contact', href: '/contact' },
];

const linkIcons: Record<string, React.ReactNode> = {
  Timer: <Clock3 className="h-4 w-4" />,
  Projects: <BriefcaseBusiness className="h-4 w-4" />,
  Teams: <Users className="h-4 w-4" />,
  Reports: <ChartColumnBig className="h-4 w-4" />,
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      const token = Cookies.get('access_token');
      const { getApiUrl } = await import('@/constant/apiendpoints');
      await fetch(getApiUrl('/api/logout/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    logout();
    router.replace('/login');
  };

  // Hide navbar on admin routes - check AFTER hooks
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Render 
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 pt-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.6rem] border border-white/70 bg-white/82 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-700 via-blue-600 to-teal-500 text-base font-black text-white shadow-lg shadow-blue-900/20">
            T
          </span>
          <div>
            <span className="block text-lg font-semibold tracking-tight text-slate-950">Tickr</span>
            <span className="block text-xs font-medium text-slate-500">Employee workspace</span>
          </div>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1">
                {AUTHENTICATED_LINKS.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                        active
                          ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/15'
                          : 'text-slate-600 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      {linkIcons[link.name]}
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="max-w-44">
                  <span className="block truncate font-semibold text-slate-900">{user?.username || 'My profile'}</span>
                  <span className="block truncate text-xs text-slate-500">{user?.email}</span>
                </div>
              </Link>
              <span className="hidden h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 lg:inline-flex">
                <Bell className="h-4 w-4" />
              </span>
              <button
                onClick={() => void handleLogout()}
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {PUBLIC_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mx-auto mt-3 max-w-7xl rounded-[1.6rem] border border-white/70 bg-white/92 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl md:hidden">
          {isAuthenticated ? (
            <>
              {AUTHENTICATED_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`mb-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    pathname === link.href
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {linkIcons[link.name]}
                  {link.name}
                </Link>
              ))}
              <Link
                href="/profile"
                className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900">{user?.username || 'My profile'}</span>
                  <span className="block truncate text-xs text-slate-500">{user?.email}</span>
                </div>
              </Link>
              <button
                onClick={() => {
                  void handleLogout();
                  setIsMenuOpen(false);
                }}
                className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {PUBLIC_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="mb-2 block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/login"
                className="mb-2 block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="mt-2 block rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
