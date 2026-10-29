'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TicketCheck, 
  HardDrive, 
  ShieldAlert, 
  ShieldCheck,
  ArrowLeft,
  Tv,
  Users,
  LogOut
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, isAdmin, isLoading, logout } = useApp();

  // If on the login gateway /admin itself, render children directly
  if (pathname === '/admin') {
    return <div className="min-h-screen bg-visionDark-950">{children}</div>;
  }

  // Protected Sub-routes: Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-visionDark-950 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-32 text-center text-gray-400 text-xs">
          Verifying administrator credentials...
        </div>
      </div>
    );
  }

  // Protected Sub-routes: Unauthorized state
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-visionDark-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-visionDark-900 border border-red-900/60 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-800 text-netflixRed flex items-center justify-center mx-auto mb-4 shadow-glow-red">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Access Denied</h2>
          <p className="text-xs text-gray-300 leading-relaxed mb-6">
            The VisionFlix Admin Console is strictly restricted to authorized administrator{' '}
            <strong className="text-white font-mono">hhshukla241099@gmail.com</strong>.
            You do not have administrative privileges.
          </p>
          <div className="space-y-3">
            <Link
              href="/admin"
              className="block w-full py-2.5 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red"
            >
              Sign In with Authorized Admin Account
            </Link>
            <Link
              href="/"
              className="block text-xs text-gray-400 hover:text-white"
            >
              Return to Customer Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Overview & Customers', icon: LayoutDashboard },
    { href: '/admin/accounts', label: 'Streaming Accounts & Gmail', icon: Tv },
    { href: '/admin/devices', label: 'Personal Device Registry', icon: HardDrive },
    { href: '/admin/tickets', label: 'TV & Household Requests', icon: TicketCheck },
  ];

  return (
    <div className="min-h-screen bg-visionDark-950">
      
      {/* Top Admin Sub-Header */}
      <div className="bg-visionDark-900 border-b border-visionDark-800 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-netflixRed text-white flex items-center gap-1 shadow-glow-red">
              <ShieldCheck className="w-3.5 h-3.5" /> VISIONFLIX ADMIN CONSOLE
            </span>
            <span className="hidden sm:inline text-xs text-gray-400">
              Admin: <strong className="text-white font-mono">{currentUser?.email}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Customer View
            </Link>
            <button
              onClick={async () => {
                await logout();
                window.location.href = '/admin';
              }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Horizontal Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-visionDark-800 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-netflixRed text-white shadow-glow-red'
                    : 'bg-visionDark-900 text-gray-400 hover:text-white hover:bg-visionDark-850 border border-visionDark-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {children}
      </div>

    </div>
  );
}
