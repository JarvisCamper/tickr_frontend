'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="px-3 pb-5 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-white/60 bg-slate-950 px-6 py-6 text-white shadow-[0_24px_48px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-base font-semibold tracking-tight">Tickr employee workspace</div>
            <div className="mt-1 text-sm text-slate-300">
              © 2026 Tickr. Focused time tracking, cleaner collaboration, and clearer reporting.
            </div>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-slate-300">
            <Link href="/PNP" className="transition hover:text-white">Privacy Policy</Link>
            <Link href="/TNS" className="transition hover:text-white">Terms of Service</Link>
            <Link href="/Contact" className="transition hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
