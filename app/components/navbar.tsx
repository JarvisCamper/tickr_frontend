'use client'
import React, { useState } from 'react'
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const links = [
    { name: 'Product', href: '#product' },
    { name: 'Features', href: '#features' },
    { name: 'Download', href: '#download' },
    { name: 'Login', href: '/login' },
    { name: 'Sign Up', href: '/signup' },
  ];
  
  return (
    <nav className="bg-white px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold text-black">Tickr</div>
        
        {/* Hamburger Menu Button - Mobile Only */}
        <button 
          className="md:hidden flex flex-col space-y-1.5 p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 bg-black"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {links.slice(0, 3).map(link => (
            <Link key={link.name} href={link.href} className="text-black hover:text-blue-600">
              {link.name}
            </Link>
          ))}
          <Link href="/login" className="text-black hover:text-blue-600">
            Login
          </Link>
          <Link 
            href="/signup" 
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-3">
          {links.map(link => (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`block py-2 ${
                link.name === 'Sign Up' 
                  ? 'bg-blue-500 text-white px-4 rounded-md hover:bg-blue-600 text-center' 
                  : 'text-black hover:text-blue-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}