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
  ChevronRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, login, tvActivations, householdVerifications } = useApp();
  
  // Tracking search state
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Quick Customer Login State (for unauthenticated homepage view)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const activeTv = tvActivations.filter(
    (r) => r.status === 'PENDING_OFFICIAL_SIGNIN'
  );
  const activeHousehold = householdVerifications.filter(
    (r) => r.status === 'PENDING'
  );
  const totalActive = activeTv.length + activeHousehold.length;

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setLoginError('Please enter your Customer ID or Email and password.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await login(cleanId, password);
      if (res.success) {
        if (cleanId.toLowerCase() === 'hhshukla241099@gmail.com') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        setLoginError(res.error || 'Invalid Customer ID or password.');
      }
    } catch {
      setLoginError('An unexpected error occurred during sign in.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleTrackingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = trackingQuery.trim().toUpperCase();
    if (!cleanQuery) return;

    setSearchAttempted(true);
    const foundTv = tvActivations.find((r) => r.tracking_number?.toUpperCase() === cleanQuery);
    if (foundTv) {
      setTrackingResult({ type: 'TV', ...foundTv });
      return;
    }
    const foundHouse = householdVerifications.find((r) => r.tracking_number?.toUpperCase() === cleanQuery);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        
        {/* Security & Independence Banner */}
        <div className="max-w-3xl mx-auto mb-6">
          <DisclaimerBanner />
        </div>

        {/* HERO / LOGIN DUAL SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto my-6">
          
          {/* Left Column: VisionFlix Concierge Intro */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-netflixRed/10 border border-netflixRed/25 text-netflixRed text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Private Netflix Concierge Network</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase leading-tight sm:leading-none">
              YOUR TV. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                YOUR ENTERTAINMENT.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              Personal streaming management dashboard for TV code activation, Household network troubleshooting, and authorized device allocations.
            </p>

            {/* Quick Tracking Search Bar */}
            <form onSubmit={handleTrackingSearch} className="max-w-md mx-auto lg:mx-0 pt-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Track request code (e.g. VF-ACT-84920)..."
                  value={trackingQuery}
                  onChange={(e) => {
                    setTrackingQuery(e.target.value);
                    setSearchAttempted(false);
                    setTrackingResult(null);
                  }}
                  className="w-full pl-10 pr-24 py-3 rounded-xl bg-visionDark-900 border border-visionDark-700 text-white text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:border-netflixRed shadow-subtle-card transition-colors"
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
                  No request record found for &quot;{trackingQuery.trim()}&quot;. Please verify your tracking ID.
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
                    {trackingResult.notes || 'Request logged in VisionFlix database.'}
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Clean Customer Login Card or Customer Welcome Card */}
          <div className="lg:col-span-5">
            {currentUser ? (
              // Authenticated Customer Card
              <div className="bg-visionDark-900 border border-visionDark-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-netflixRed/20 text-netflixRed font-bold flex items-center justify-center text-lg">
                    {currentUser.full_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Logged In
                    </span>
                    <h3 className="text-lg font-black text-white">{currentUser.full_name || currentUser.email}</h3>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{currentUser.email}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-visionDark-850 border border-visionDark-750 text-xs space-y-1">
                  <div className="flex justify-between text-gray-400">
                    <span>Status:</span>
                    <span className="font-semibold text-green-400">Active Concierge Member</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Open Requests:</span>
                    <span className="font-semibold text-white">{totalActive}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    className="w-full py-3 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white font-bold text-xs sm:text-sm transition-all shadow-glow-red flex items-center justify-center gap-2"
                  >
                    <span>Open Customer Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/tv-activation"
                    className="w-full py-2.5 rounded-xl bg-visionDark-800 hover:bg-visionDark-750 text-gray-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-visionDark-700"
                  >
                    <Tv className="w-4 h-4 text-netflixRed" />
                    <span>Activate TV Code</span>
                  </Link>
                </div>
              </div>
            ) : (
              // Unauthenticated: Clean Customer Login Card
              <div className="bg-visionDark-900 border border-visionDark-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
                
                {/* Header */}
                <div className="mb-5 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-netflixRed flex items-center justify-center shadow-glow-red">
                      <Tv className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base font-black tracking-wider text-white">
                      VISION<span className="text-netflixRed">FLIX</span>
                    </span>
                  </div>
                  <p className="text-[10px] tracking-widest font-bold text-gray-400 uppercase">
                    NETFLIX SUPPORT
                  </p>
                  <h3 className="text-base font-bold text-white mt-2">Welcome Back</h3>
                </div>

                <form onSubmit={handleQuickLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Customer ID / Email
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="customer@example.com or ID"
                        autoComplete="username email"
                        autoCapitalize="none"
                        spellCheck="false"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-netflixRed transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-gray-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-[10px] text-gray-400 hover:text-netflixRed transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-netflixRed transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 text-gray-400 hover:text-gray-200 transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-[11px] animate-in fade-in">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-2.5 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white font-bold text-xs transition-all shadow-glow-red flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <>
                        <span>LOGIN</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 pt-3 border-t border-visionDark-800/80 text-center">
                  <p className="text-[10px] text-gray-400">
                    Accounts are issued privately by the administrator.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* TWO PRIMARY SERVICE ACTION CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto my-14">
          
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

        {/* SECONDARY FOUR NAVIGATION TILES */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Quick Support Services
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-visionDark-900 border border-visionDark-700 rounded-2xl max-w-sm w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-netflixRed/15 text-netflixRed flex items-center justify-center mb-3">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Password Assistance</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              VisionFlix accounts are provisioned securely by your administrator. To reset your password, contact your support administrator directly to receive a new temporary access code.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-visionDark-800 hover:bg-visionDark-750 text-white text-xs font-semibold border border-visionDark-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
