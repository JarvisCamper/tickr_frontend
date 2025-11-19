'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    window.addEventListener('auth-changed', checkAuth);
    return () => window.removeEventListener('auth-changed', checkAuth);
  }, []);

  const checkAuth = () => {
    const token = Cookies.get('access_token');
    setIsAuthenticated(!!token);
    if (token) {
      fetchUserInfo();
    } else {
      setUserEmail(null);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const token = Cookies.get('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/user/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserEmail(data.email);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const handleLogout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    setIsAuthenticated(false);
    setUserEmail(null);
    window.dispatchEvent(new Event('auth-changed'));
    router.push('/');
  };

  const authenticatedLinks = [
    { name: 'Timer', href: '/timer' },
    { name: 'Projects', href: '/projects' },
    { name: 'Teams', href: '/teams' },
    { name: 'Reports', href: '/reports' },
  ];

  const publicLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Contact', href: '#contact' },
  ];
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white px-4 sm:px-8 py-4 shadow-md z-50">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-black">
          Tickr
        </Link>
        
        <button 
          className="md:hidden flex flex-col space-y-1.5 p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 bg-black"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
        </button>

        <div className="hidden md:flex items-center space-x-8">
          {isAuthenticated ? (
            <>
              {authenticatedLinks.map(link => (
                <Link key={link.name} href={link.href} className="text-black hover:text-blue-600">
                  {link.name}
                </Link>
              ))}
              <span className="text-gray-600 text-sm">{userEmail}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {publicLinks.map(link => (
                <Link key={link.name} href={link.href} className="text-black hover:text-blue-600">
                  {link.name}
                </Link>
              ))}
              <Link href="/login" className="text-black hover:text-blue-600">Login</Link>
              <Link href="/signup" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-3">
          {isAuthenticated ? (
            <>
              {authenticatedLinks.map(link => (
                <Link key={link.name} href={link.href} className="block py-2 text-black hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                  {link.name}
                </Link>
              ))}
              <div className="py-2 text-gray-600 text-sm">{userEmail}</div>
              <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left py-2 text-red-600 hover:text-red-800">
                Logout
              </button>
            </>
          ) : (
            <>
              {publicLinks.map(link => (
                <Link key={link.name} href={link.href} className="block py-2 text-black hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                  {link.name}
                </Link>
              ))}
              <Link href="/login" className="block py-2 text-black hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link href="/signup" className="block py-2 bg-blue-500 text-white px-4 rounded-md hover:bg-blue-600 text-center" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}