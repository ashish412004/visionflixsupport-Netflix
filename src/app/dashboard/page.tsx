'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Tv, 
  Shield, 
  Clock, 
  HardDrive,
  CheckCircle2,
  ExternalLink,
  Plus,
  Mail,
  ShieldCheck,
  Smartphone,
  Laptop,
  Check
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
    gmailStatus
  } = useApp();

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
              <span className="text-xs font-bold uppercase tracking-wider text-netflixRed">Personal Netflix Hub</span>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-visionDark-800 text-netflixRed border border-netflixRed/30">
                  ADMINISTRATOR
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Welcome{currentUser?.full_name ? `, ${currentUser.full_name}` : ''}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Personal dashboard for managing registered Netflix accounts, authorized hardware, and TV activations.
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
              Household
            </Link>
            {isAdmin && (
              <Link
                href="/admin/accounts"
                className="px-4 py-2.5 rounded-xl bg-visionDark-800 hover:bg-visionDark-700 text-gray-200 text-xs font-semibold border border-visionDark-700 transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-green-400" />
                Account Manager
              </Link>
            )}
          </div>
        </div>
      </div>

      <DisclaimerBanner />

      {/* METRIC / STATUS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        
        {/* Card 1: Netflix Accounts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-gray-400">Accounts</span>
            <Tv className="w-4 h-4 text-netflixRed" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mb-1">
            {netflixAccounts.length}
          </p>
          <p className="text-[11px] text-gray-400">
            Managed subscriptions
          </p>
        </div>

        {/* Card 2: Personal Devices */}
        <div className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-gray-400">Devices</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mb-1">
            {personalDevices.length}
          </p>
          <p className="text-[11px] text-gray-400">
            Registered hardware
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
            Activations & Verifications
          </p>
        </div>

        {/* Card 4: Gmail OAuth */}
        <div className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-gray-400">Email Sync</span>
            <Mail className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-sm font-bold text-white mb-1 truncate">
            {gmailStatus?.isConnected ? 'Connected' : 'Not Linked'}
          </p>
          <p className="text-[11px] text-gray-400 truncate">
            {gmailStatus?.emailAddress || 'Gmail OAuth read-only'}
          </p>
        </div>

      </div>

      {/* TWO COLUMN CONTENT: LEFT (Personal Accounts & History), RIGHT (Hardware) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 spans): Accounts & TV History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Personal Netflix Accounts */}
          <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tv className="w-4 h-4 text-netflixRed" />
                Personal Netflix Accounts
              </h3>
              <Link href="/admin/accounts" className="text-xs text-netflixRed hover:text-netflixRed-hover font-semibold">
                Manage Accounts &rarr;
              </Link>
            </div>

            {netflixAccounts.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-visionDark-850/60 border border-visionDark-800">
                <Tv className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-medium">No accounts added yet.</p>
                <Link
                  href="/admin/accounts"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-netflixRed hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Your First Netflix Account
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {netflixAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-4 rounded-xl bg-visionDark-850 border border-visionDark-700/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">{acc.account_nickname || acc.account_email}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-visionDark-800 text-netflixRed border border-netflixRed/20">
                          {acc.subscription_plan}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          acc.account_status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {acc.account_status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs">{acc.account_email}</p>
                      {acc.registered_email_inbox && acc.registered_email_inbox !== acc.account_email && (
                        <p className="text-[11px] text-gray-500 mt-0.5">Inbox: {acc.registered_email_inbox}</p>
                      )}
                    </div>

                    <div className="text-right sm:text-right shrink-0">
                      <Link
                        href="/tv-activation"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-visionDark-800 hover:bg-visionDark-700 text-white text-xs font-medium border border-visionDark-700"
                      >
                        <Tv className="w-3 h-3 text-netflixRed" />
                        Activate TV
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Recent TV & Household Verifications */}
          <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-netflixRed" />
                Recent TV Activations & Verifications
              </h3>
              <Link href="/tickets" className="text-xs text-netflixRed hover:text-netflixRed-hover font-semibold">
                View All &rarr;
              </Link>
            </div>

            {tvActivations.length === 0 && householdVerifications.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-visionDark-850/60 border border-visionDark-800">
                <CheckCircle2 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No TV activations or household verification logs yet.</p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <Link
                    href="/tv-activation"
                    className="text-xs font-semibold text-netflixRed hover:underline"
                  >
                    Activate TV Screen &rarr;
                  </Link>
                  <span className="text-gray-600">•</span>
                  <Link
                    href="/household"
                    className="text-xs font-semibold text-gray-300 hover:underline"
                  >
                    Household Help &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {tvActivations.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl bg-visionDark-850 border border-visionDark-700/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white bg-visionDark-800 px-2 py-0.5 rounded border border-visionDark-700">
                          {r.tracking_number}
                        </span>
                        <span className="font-bold text-netflixRed">TV Code</span>
                        <span className="font-mono text-gray-200">{r.tv_code}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.status === 'ACTIVATED' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-visionDark-800 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <p className="text-gray-300 pt-1">
                      Device: {r.device_name}
                    </p>
                    {r.notes && (
                      <p className="text-gray-400 text-[11px]">
                        {r.notes}
                      </p>
                    )}
                  </div>
                ))}

                {householdVerifications.slice(0, 3).map((h) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-xl bg-visionDark-850 border border-visionDark-700/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white bg-visionDark-800 px-2 py-0.5 rounded border border-visionDark-700">
                          {h.tracking_number}
                        </span>
                        <span className="font-bold text-blue-400">Household</span>
                        <span className="text-gray-300">{h.issue_type.replace(/_/g, ' ')}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        h.status === 'RESOLVED' || h.status === 'VERIFIED_ON_TV'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-visionDark-800 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {h.status}
                      </span>
                    </div>
                    <p className="text-gray-300 pt-1">
                      Device: {h.device_name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1 span): Personal Hardware Registry */}
        <div className="space-y-6">
          
          <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-netflixRed" />
                Personal Devices
              </h3>
              <Link href="/settings" className="text-xs text-netflixRed hover:text-netflixRed-hover font-semibold">
                Manage &rarr;
              </Link>
            </div>

            <p className="text-[11px] text-gray-400 mb-3">
              Registered hardware authorized for your personal Netflix accounts ({personalDevices.length} registered).
            </p>

            {personalDevices.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-visionDark-850/60 border border-visionDark-800">
                <p className="text-xs text-gray-400 mb-2">No personal devices registered yet.</p>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-1 text-xs text-netflixRed hover:underline font-semibold"
                >
                  <Plus className="w-3 h-3" /> Register Personal Device
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

          {/* Quick Security Tip Card */}
          <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>Zero-Credential Architecture</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              VisionFlix never asks for, stores, or automates Netflix passwords or OTPs. All activations are completed securely via Netflix official flows.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}