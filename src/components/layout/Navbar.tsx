'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Tv, 
  HelpCircle, 
  User, 
  LogOut, 
  ChevronDown
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';

export function Navbar() {
  const pathname = usePathname();
  const { 
    currentUser, 
    logout 
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-visionDark-700/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-netflixRed flex items-center justify-center shadow-glow-red transition-transform group-hover:scale-105">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-white flex items-center gap-1">
              VISION<span className="text-netflixRed">FLIX</span>
            </span>
            <span className="text-[9px] tracking-widest font-semibold text-gray-400 uppercase -mt-1">
              Netflix Support
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Public - Admin links removed) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === '/' ? 'text-white bg-visionDark-800' : 'text-gray-400 hover:text-white hover:bg-visionDark-850'
            }`}
          >
            Home
          </Link>
          <Link
            href="/tv-activation"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === '/tv-activation' ? 'text-white bg-visionDark-800' : 'text-gray-400 hover:text-white hover:bg-visionDark-850'
            }`}
          >
            TV Activation
          </Link>
          <Link
            href="/household"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === '/household' ? 'text-white bg-visionDark-800' : 'text-gray-400 hover:text-white hover:bg-visionDark-850'
            }`}
          >
            Household Help
          </Link>
          <Link
            href="/tickets"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname.startsWith('/tickets') ? 'text-white bg-visionDark-800' : 'text-gray-400 hover:text-white hover:bg-visionDark-850'
            }`}
          >
            My Requests
          </Link>
          <Link
            href="/faqs"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === '/faqs' ? 'text-white bg-visionDark-800' : 'text-gray-400 hover:text-white hover:bg-visionDark-850'
            }`}
          >
            FAQs
          </Link>
        </nav>

        {/* Action Controls & User Dropdown */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Quick Help Button */}
          <Link
            href="/faqs"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-visionDark-800 transition-colors"
            title="Help & FAQs"
          >
            <HelpCircle className="w-5 h-5" />
          </Link>

          {/* User Account / Profile Button */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-lg bg-visionDark-800 hover:bg-visionDark-700 transition-colors border border-visionDark-700 text-left cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md bg-netflixRed/20 text-netflixRed font-bold flex items-center justify-center text-xs">
                  {currentUser.full_name ? currentUser.full_name.slice(0, 1).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-medium text-white max-w-[120px] truncate">
                  {currentUser.full_name || currentUser.email}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* User Menu Dropdown (Private - Admin links removed) */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-dropdown rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-visionDark-700">
                    <p className="text-xs font-semibold text-white truncate">{currentUser.full_name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{currentUser.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-visionDark-800 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" /> Customer Dashboard
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-visionDark-800 rounded-lg transition-colors"
                    >
                      <Tv className="w-4 h-4 text-gray-400" /> Device Allocations
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-visionDark-700">
                    <button
                      onClick={async () => {
                        await logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-netflixRed hover:bg-netflixRed-hover text-white transition-all shadow-glow-red"
            >
              Sign In
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}
