'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tv, HardDrive, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminCustomersPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to Streaming Account Management
    const timer = setTimeout(() => {
      router.replace('/admin/accounts');
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-netflixRed/10 border border-netflixRed/30 text-netflixRed flex items-center justify-center mx-auto mb-4">
        <ShieldCheck className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Personal Management Mode</h2>
      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        VisionFlix is operating in <strong className="text-white">Personal Netflix Management</strong> mode. Customer profiles are disabled in favor of direct personal Netflix account management, Gmail inbox synchronization, and hardware device registration.
      </p>
      <Link
        href="/admin/accounts"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red"
      >
        <span>Go to Account Management</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}