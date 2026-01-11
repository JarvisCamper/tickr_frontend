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
    <footer className="bg-gray-800 text-white py-4 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="text-sm">
            © 2025 Tickr. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
              <Link href="/PNP" className="hover:text-blue-400">Privacy Policy</Link>
              <Link href="/TNS" className="hover:text-blue-400">Terms of Service</Link>
              <Link href="/Contact" className="hover:text-blue-400">Contact</Link>
            </div>
        </div>
      </div>
    </footer>
  );
}