'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  TicketCheck, 
  HardDrive, 
  ShieldAlert, 
  ShieldCheck,
  ArrowLeft,
  Tv
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, isAdmin, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center text-gray-400 text-xs">
        Verifying administrator privileges...
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800 text-netflixRed flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Restricted Admin Access</h2>
        <p className="text-xs text-gray-400 mb-6">
          The Admin Portal is restricted to authorized VisionFlix administrators and support specialists.
        </p>
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full py-2.5 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red"
          >
            Sign in with Admin Credentials
          </Link>
          <Link
            href="/"
            className="block text-xs text-gray-400 hover:text-white"
          >
            Return to Public Home
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Overview & Stats', icon: LayoutDashboard },
    { href: '/admin/accounts', label: 'Streaming Account Management', icon: Tv },
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
              Administrator: <strong className="text-white">{currentUser?.full_name || currentUser?.email}</strong>
            </span>
          </div>

          <Link
            href="/dashboard"
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Customer Portal View
          </Link>
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
