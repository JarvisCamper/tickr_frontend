"use client";

import Link from "next/link";

export function AdminFooter() {
  return (
    <footer className="mt-auto px-1 pb-2 pt-8">
      <div className="rounded-[1.5rem] border border-slate-900/80 bg-slate-950 px-5 py-4 text-white shadow-[0_24px_48px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold tracking-tight text-white">Tickr admin workspace</div>
            <div className="mt-1 text-sm text-slate-300">
              © 2026 Tickr. Secure administration, oversight, and reporting.
            </div>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-slate-300">
            <Link href="/admin/privacy-policy" className="transition hover:text-white">Privacy Policy</Link>
            <Link href="/admin/terms" className="transition hover:text-white">Terms of Service</Link>
            <Link href="/admin/contact" className="transition hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
