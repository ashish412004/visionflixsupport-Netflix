'use client';

import React from 'react';
import Link from 'next/link';
import { Tv, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

export default function RegisterDisabledPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-20 text-center">
      
      {/* Brand Icon */}
      <div className="w-14 h-14 rounded-2xl bg-netflixRed/15 border border-netflixRed/30 flex items-center justify-center mx-auto mb-4 text-netflixRed shadow-glow-red">
        <Lock className="w-7 h-7" />
      </div>

      <h1 className="text-2xl font-black text-white tracking-wider">
        VISION<span className="text-netflixRed">FLIX</span>
      </h1>
      <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-6">
        Private Concierge Network
      </p>

      <DisclaimerBanner compact />

      <div className="bg-visionDark-900 border border-visionDark-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl mt-4 space-y-4">
        <div className="w-10 h-10 rounded-xl bg-visionDark-800 flex items-center justify-center mx-auto text-yellow-400">
          <ShieldCheck className="w-5 h-5" />
        </div>

        <h2 className="text-base font-bold text-white">
          Public Registration Closed
        </h2>

        <p className="text-xs text-gray-300 leading-relaxed">
          VisionFlix customer accounts are provisioned exclusively through our administrative concierge. Self-registration is strictly disabled to maintain secure support allocations.
        </p>

        <p className="text-[11px] text-gray-400">
          If you have been issued login credentials by your administrator, please sign in below.
        </p>

        <Link
          href="/login"
          className="w-full py-3 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white font-bold text-xs sm:text-sm transition-all shadow-glow-red flex items-center justify-center gap-2"
        >
          <span>Customer Login</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        Need assistance? Return to{' '}
        <Link href="/" className="text-gray-300 hover:text-white underline">
          Home
        </Link>
      </div>

    </div>
  );
}
