import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-4 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="text-sm">
            © 2025 Tickr. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="#privacy" className="hover:text-blue-400">Privacy Policy</Link>
            <Link href="#terms" className="hover:text-blue-400">Terms of Service</Link>
            <Link href="#contact" className="hover:text-blue-400">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}