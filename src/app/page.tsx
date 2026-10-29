'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Tv, 
  Shield, 
  ArrowRight, 
  Inbox, 
  HelpCircle, 
  Settings, 
  Search, 
  Clock, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, tvActivations, householdVerifications } = useApp();
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const activeTv = tvActivations.filter(
    (r) => r.status === 'PENDING_OFFICIAL_SIGNIN'
  );
  const activeHousehold = householdVerifications.filter(
    (r) => r.status === 'PENDING'
  );
  const totalActive = activeTv.length + activeHousehold.length;

  const handleTrackingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = trackingQuery.trim().toUpperCase();
    if (!cleanQuery) return;

    setSearchAttempted(true);
    const foundTv = tvActivations.find((r) => r.tracking_number.toUpperCase() === cleanQuery);
    if (foundTv) {
      setTrackingResult({ type: 'TV', ...foundTv });
      return;
    }
    const foundHouse = householdVerifications.find((r) => r.tracking_number.toUpperCase() === cleanQuery);
    if (foundHouse) {
      setTrackingResult({ type: 'HOUSEHOLD', ...foundHouse });
      return;
    }
    setTrackingResult(null);
  };

  return (
    <div className="relative overflow-hidden">
      
      {/* Hero Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 hero-vignette pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {/* Security & Independence Banner */}
        <div className="max-w-3xl mx-auto mb-6">
          <DisclaimerBanner />
        </div>

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mt-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-netflixRed/10 border border-netflixRed/25 text-netflixRed text-xs font-semibold uppercase tracking-wider mb-4 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated Netflix Concierge Support</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-tight sm:leading-none mb-4">
            YOUR TV. <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
              YOUR ENTERTAINMENT.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto mb-8">
            Get assistance activating your TV and managing Netflix Household access with our specialized concierge support.
          </p>

          {/* Quick Tracking Search */}
          <form onSubmit={handleTrackingSearch} className="max-w-md mx-auto mb-6">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Track request (e.g. VF-ACT-84920)..."
                value={trackingQuery}
                onChange={(e) => {
                  setTrackingQuery(e.target.value);
                  setSearchAttempted(false);
                  setTrackingResult(null);
                }}
                className="w-full pl-10 pr-24 py-3 rounded-xl bg-visionDark-900 border border-visionDark-700 text-white text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:border-netflixRed shadow-subtle-card"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-visionDark-850 hover:bg-visionDark-800 text-gray-200 hover:text-white text-xs font-semibold transition-colors border border-visionDark-700"
              >
                Track
              </button>
            </div>

            {searchAttempted && !trackingResult && (
              <p className="text-xs text-red-400 mt-2 text-left">
                No request record found for &quot;{trackingQuery.trim()}&quot;. Please verify the tracking ID.
              </p>
            )}

            {trackingResult && (
              <div className="mt-3 p-3.5 rounded-xl bg-visionDark-900 border border-netflixRed/40 text-left text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white">{trackingResult.tracking_number}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-visionDark-800 text-netflixRed uppercase">
                    {trackingResult.status}
                  </span>
                </div>
                <p className="text-gray-300">
                  {trackingResult.type === 'TV' ? `TV Code: ${trackingResult.tv_code}` : trackingResult.issue_type?.replace(/_/g, ' ')}
                  {trackingResult.device_name ? ` (${trackingResult.device_name})` : ''}
                </p>
                <p className="text-[11px] text-gray-400">
                  {trackingResult.provider_notes || trackingResult.notes || trackingResult.resolution_notes || 'Request logged in VisionFlix database.'}
                </p>
              </div>
            )}
          </form>

          {/* Current User Pill */}
          {currentUser && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-visionDark-900 border border-visionDark-800 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>Signed in as <strong className="text-white">{currentUser.full_name || currentUser.email}</strong></span>
            </div>
          )}
        </section>

        {/* TWO LARGE ACTION CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          
          {/* Card 1: TV ACTIVATION */}
          <div className="group relative bg-gradient-to-b from-visionDark-900 to-visionDark-850 border border-visionDark-700/80 rounded-2xl p-6 sm:p-8 card-hover-effect flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-netflixRed/10 rounded-full blur-2xl group-hover:bg-netflixRed/20 transition-all pointer-events-none" />
            
            <div>
              <div className="w-14 h-14 rounded-2xl bg-netflixRed/15 border border-netflixRed/30 flex items-center justify-center text-netflixRed mb-6 group-hover:scale-105 transition-transform shadow-glow-red/20">
                <Tv className="w-7 h-7" />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-netflixRed">
                Step-by-Step Concierge
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2">
                TV ACTIVATION
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Need help connecting your TV? Enter the 8-character code shown on your television to register an administrative tracking record.
              </p>
            </div>

            <Link
              href="/tv-activation"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white font-bold text-sm sm:text-base transition-all shadow-glow-red group"
            >
              Start Request
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Card 2: HOUSEHOLD SUPPORT */}
          <div className="group relative bg-gradient-to-b from-visionDark-900 to-visionDark-850 border border-visionDark-700/80 rounded-2xl p-6 sm:p-8 card-hover-effect flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-visionDark-700/20 rounded-full blur-2xl group-hover:bg-visionDark-600/30 transition-all pointer-events-none" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-visionDark-800 border border-visionDark-700 flex items-center justify-center text-white mb-6 group-hover:scale-105 transition-transform">
                <Shield className="w-7 h-7 text-netflixRed" />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Household Access & Network
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2">
                HOUSEHOLD SUPPORT
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Having trouble with Household verification? Resolve &quot;Not part of Household&quot; warnings with guided official instructions.
              </p>
            </div>

            <Link
              href="/household"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-visionDark-800 hover:bg-visionDark-700 border border-visionDark-700 hover:border-gray-500 text-white font-bold text-sm sm:text-base transition-all group"
            >
              Get Help
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

        </section>

        {/* ACTIVE REQUESTS ALERT (If any exist for signed in user) */}
        {currentUser && totalActive > 0 && (
          <section className="max-w-4xl mx-auto mb-14">
            <div className="bg-visionDark-900 border border-netflixRed/30 rounded-2xl p-5 shadow-glow-red/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Clock className="w-4 h-4 text-netflixRed" />
                  <span>Your Open Requests ({totalActive})</span>
                </div>
                <Link href="/tickets" className="text-xs text-netflixRed hover:text-netflixRed-hover font-semibold">
                  View All &rarr;
                </Link>
              </div>

              <div className="space-y-2">
                {activeTv.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-visionDark-850 border border-visionDark-700"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">{t.tracking_number}</span>
                        <span className="text-xs text-gray-300 font-medium">TV Code: {t.tv_code}</span>
                      </div>
                      <span className="text-[11px] text-gray-500">Device: {t.device_name}</span>
                    </div>

                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECONDARY FOUR NAVIGATION TILES */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Quick Support Services
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Tile 1: My Requests */}
            <Link
              href="/tickets"
              className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800 hover:border-visionDark-700 hover:bg-visionDark-850 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-visionDark-800 text-netflixRed flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Inbox className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">My Requests</h4>
              <p className="text-[11px] text-gray-400">Track logged requests</p>
            </Link>

            {/* Tile 2: Support Ticket */}
            <Link
              href="/household"
              className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800 hover:border-visionDark-700 hover:bg-visionDark-850 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-visionDark-800 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-netflixRed" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Household Help</h4>
              <p className="text-[11px] text-gray-400">Report household roadblocks</p>
            </Link>

            {/* Tile 3: FAQs */}
            <Link
              href="/faqs"
              className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800 hover:border-visionDark-700 hover:bg-visionDark-850 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-visionDark-800 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-5 h-5 text-gray-300" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">FAQs</h4>
              <p className="text-[11px] text-gray-400">Official guidance & steps</p>
            </Link>

            {/* Tile 4: Account Settings */}
            <Link
              href="/settings"
              className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800 hover:border-visionDark-700 hover:bg-visionDark-850 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-visionDark-800 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Settings className="w-5 h-5 text-gray-300" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Account Settings</h4>
              <p className="text-[11px] text-gray-400">Manage device allocations</p>
            </Link>

          </div>
        </section>

      </div>
    </div>
  );
}
