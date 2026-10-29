'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Tv, 
  Shield, 
  Clock, 
  HardDrive, 
  CheckCircle2, 
  Plus, 
  Mail, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Loader2, 
  Check, 
  X,
  AlertTriangle,
  Smartphone,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

export default function DashboardPage() {
  const { 
    currentUser, 
    isAdmin,
    netflixAccounts,
    personalDevices, 
    tvActivations, 
    householdVerifications,
    gmailStatus,
    refreshData
  } = useApp();

  // First Login Password Change Modal State
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  useEffect(() => {
    if (currentUser?.must_change_password) {
      setShowPasswordChangeModal(true);
    }
  }, [currentUser]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    setPassError('');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPassError(data.error || 'Failed to update password.');
      } else {
        setPassSuccess(true);
        setTimeout(() => {
          setShowPasswordChangeModal(false);
          refreshData();
        }, 1500);
      }
    } catch {
      setPassError('Network error while updating password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const activeTv = tvActivations.filter((r) => r.status === 'PENDING_OFFICIAL_SIGNIN');
  const activeHousehold = householdVerifications.filter((r) => r.status === 'PENDING');
  const totalActive = activeTv.length + activeHousehold.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-visionDark-900 via-visionDark-850 to-visionDark-900 border border-visionDark-700/80 rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-netflixRed/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-netflixRed">Customer Concierge Hub</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-visionDark-800 text-green-400 border border-green-800">
                ACTIVE MEMBER
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Welcome{currentUser?.full_name ? `, ${currentUser.full_name}` : ''}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Personal dashboard for Smart TV activations, Household troubleshooting, and device allocations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/tv-activation"
              className="px-4 py-2.5 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red flex items-center gap-1.5"
            >
              <Tv className="w-4 h-4" />
              Activate TV
            </Link>
            <Link
              href="/household"
              className="px-4 py-2.5 rounded-xl bg-visionDark-800 hover:bg-visionDark-700 text-gray-200 text-xs font-semibold border border-visionDark-700 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-netflixRed" />
              Household Help
            </Link>
          </div>
        </div>
      </div>

      <DisclaimerBanner />

      {/* METRIC / STATUS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        
        {/* Card 1: Registered Accounts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-gray-400">Streaming Profile</span>
            <Tv className="w-4 h-4 text-netflixRed" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mb-1">
            {netflixAccounts.length > 0 ? `${netflixAccounts.length} Connected` : '1 Assigned'}
          </p>
          <p className="text-[11px] text-gray-400">
            Concierge Netflix Service
          </p>
        </div>

        {/* Card 2: Personal Devices */}
        <div className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-gray-400">Allocated Devices</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mb-1">
            {personalDevices.length}
          </p>
          <p className="text-[11px] text-gray-400">
            Registered Smart TVs
          </p>
        </div>

        {/* Card 3: Active Requests */}
        <div className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-gray-400">In Progress</span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mb-1">
            {totalActive}
          </p>
          <p className="text-[11px] text-yellow-400/80">
            Pending concierges
          </p>
        </div>

        {/* Card 4: Support Status */}
        <div className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-gray-400">Concierge Desk</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-sm font-bold text-white mb-1">
            Online Priority
          </p>
          <p className="text-[11px] text-gray-400">
            Dedicated Customer Support
          </p>
        </div>

      </div>

      {/* TWO COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 spans): TV & Household Requests */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Recent TV Activations & Verifications */}
          <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-netflixRed" />
                Your TV Activations & Support Requests
              </h3>
              <Link href="/tickets" className="text-xs text-netflixRed hover:text-netflixRed-hover font-semibold">
                View All &rarr;
              </Link>
            </div>

            {tvActivations.length === 0 && householdVerifications.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-visionDark-850/60 border border-visionDark-800">
                <Tv className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-medium">No support requests logged yet.</p>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <Link
                    href="/tv-activation"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-netflixRed hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Activate a TV
                  </Link>
                  <span className="text-gray-600">•</span>
                  <Link
                    href="/household"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:underline"
                  >
                    Household Help
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {tvActivations.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl bg-visionDark-850 border border-visionDark-700/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-white">{t.tracking_number}</span>
                        <span className="text-gray-300">TV Code: <strong className="text-white font-mono">{t.tv_code}</strong></span>
                      </div>
                      <p className="text-gray-400 text-xs">Device: {t.device_name}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase self-start sm:self-auto ${
                      t.status === 'ACTIVATED' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1 span): Allocated Hardware */}
        <div className="space-y-6">
          
          <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-netflixRed" />
                Your Devices
              </h3>
              <Link href="/settings" className="text-xs text-netflixRed hover:text-netflixRed-hover font-semibold">
                Manage &rarr;
              </Link>
            </div>

            <p className="text-[11px] text-gray-400 mb-3">
              Hardware registered for your streaming service ({personalDevices.length} allocated).
            </p>

            {personalDevices.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-visionDark-850/60 border border-visionDark-800">
                <p className="text-xs text-gray-400 mb-2">No hardware registered yet.</p>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-1 text-xs text-netflixRed hover:underline font-semibold"
                >
                  <Plus className="w-3 h-3" /> Register Smart TV
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {personalDevices.map((dev) => (
                  <div key={dev.id} className="p-3 rounded-xl bg-visionDark-850 border border-visionDark-700/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{dev.device_name}</span>
                      <span className={`text-[10px] font-bold ${
                        dev.status === 'ACTIVE' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {dev.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">{dev.device_type}</p>
                    {dev.household_network && (
                      <p className="text-[10px] text-gray-500">{dev.household_network}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Concierge Security Guarantee */}
          <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>Zero-Credential Security</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              VisionFlix operates strictly under zero-credential security. We never ask for or store your streaming account password or SMS OTPs.
            </p>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MANDATORY FIRST-LOGIN PASSWORD CHANGE MODAL */}
      {/* ========================================================================= */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-visionDark-900 border border-netflixRed/50 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            
            <div className="w-12 h-12 rounded-2xl bg-netflixRed/15 border border-netflixRed/30 text-netflixRed flex items-center justify-center mx-auto mb-3 shadow-glow-red">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white text-center">Change Temporary Password</h3>
            <p className="text-xs text-gray-300 text-center mt-1 mb-5">
              Your account was created with a temporary password. For security, please choose a private password before continuing.
            </p>

            {!passSuccess ? (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    New Password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new private password"
                    className="w-full px-3 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs sm:text-sm focus:outline-none focus:border-netflixRed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs sm:text-sm focus:outline-none focus:border-netflixRed"
                    required
                  />
                </div>

                {passError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                    {passError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full py-3 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white font-bold text-xs sm:text-sm transition-all shadow-glow-red flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isChangingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Set New Password & Proceed</span>
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-green-950/40 border border-green-800 text-green-300 text-center text-xs flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Password updated successfully! Welcome to VisionFlix.</span>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
