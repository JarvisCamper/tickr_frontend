'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const FOOTER_LINKS = [
  { href: '/pnp', label: 'Privacy Policy' },
  { href: '/tns', label: 'Terms of Service' },
  { href: '/contact', label: 'Contact' },
] as const;

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
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className="transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
