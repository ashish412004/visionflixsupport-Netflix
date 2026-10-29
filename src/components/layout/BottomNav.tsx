'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Tv, Shield, Inbox, User, ShieldCheck } from 'lucide-react';
import { useApp } from '@/lib/store/app-context';

export function BottomNav() {
  const pathname = usePathname();
  const { currentUser, gmailMessages, isAdmin } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-visionDark-950/95 backdrop-blur-lg border-t border-visionDark-700/80 px-2 py-1 safe-area-bottom">
      <div className="grid grid-cols-5 items-center justify-around">
        
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1.5 transition-colors ${
            pathname === '/' ? 'text-netflixRed' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Home</span>
        </Link>

        {/* 2. TV Activation */}
        <Link
          href="/tv-activation"
          className={`flex flex-col items-center justify-center py-1.5 transition-colors ${
            pathname === '/tv-activation' ? 'text-netflixRed' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Tv className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Activate</span>
        </Link>

        {/* 3. Household Help */}
        <Link
          href="/household"
          className={`flex flex-col items-center justify-center py-1.5 transition-colors ${
            pathname === '/household' ? 'text-netflixRed' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Shield className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">Household</span>
        </Link>

        {/* 4. Requests */}
        <Link
          href="/tickets"
          className={`flex flex-col items-center justify-center py-1.5 transition-colors relative ${
            pathname.startsWith('/tickets') ? 'text-netflixRed' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="relative">
            <Inbox className="w-5 h-5 mb-0.5" />
            {gmailMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-netflixRed rounded-full ring-2 ring-visionDark-950" />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">Requests</span>
        </Link>

        {/* 5. Account or Admin */}
        <Link
          href={isAdmin ? "/admin" : (currentUser ? "/dashboard" : "/login")}
          className={`flex flex-col items-center justify-center py-1.5 transition-colors ${
            pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
              ? 'text-netflixRed'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {isAdmin ? (
            <>
              <ShieldCheck className="w-5 h-5 mb-0.5 text-netflixRed" />
              <span className="text-[10px] font-semibold text-netflixRed tracking-tight">Admin</span>
            </>
          ) : (
            <>
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight">Profile</span>
            </>
          )}
        </Link>

      </div>
    </nav>
  );
}
