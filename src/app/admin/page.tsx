'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Tv, 
  Clock, 
  ShieldCheck, 
  HardDrive,
  CheckCircle2,
  TrendingUp,
  History,
  Layers,
  ArrowRight,
  Mail,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';

export default function AdminOverviewPage() {
  const { 
    netflixAccounts, 
    personalDevices, 
    tvActivations, 
    householdVerifications, 
    gmailStatus,
    auditLogs 
  } = useApp();

  const pendingActivations = tvActivations.filter((r) => r.status === 'PENDING_OFFICIAL_SIGNIN');
  const openHousehold = householdVerifications.filter((r) => r.status === 'PENDING');
  const totalOpenRequests = pendingActivations.length + openHousehold.length;

  return (
    <div className="space-y-8">
      
      {/* OVERVIEW STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Streaming Accounts</span>
            <Tv className="w-4 h-4 text-netflixRed" />
          </div>
          <p className="text-3xl font-black text-white mb-1">{netflixAccounts.length}</p>
          <p className="text-[11px] text-gray-400">Personal accounts configured</p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Personal Devices</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white mb-1">{personalDevices.length}</p>
          <p className="text-[11px] text-gray-400">Tracked hardware records</p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Open Requests</span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-3xl font-black text-white mb-1">{totalOpenRequests}</p>
          <p className="text-[11px] text-yellow-400/90 font-medium">TV codes & Household verifications</p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Gmail OAuth Sync</span>
            <Mail className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-xl font-black text-white mb-1 truncate">
            {gmailStatus?.isConnected ? 'Connected' : 'Not Linked'}
          </p>
          <p className="text-[11px] text-gray-400 truncate">
            {gmailStatus?.emailAddress || 'Official read-only OAuth'}
          </p>
        </div>

      </div>

      {/* QUICK SHORTCUT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/accounts"
          className="p-5 rounded-2xl bg-gradient-to-r from-visionDark-900 to-visionDark-850 border border-visionDark-800 hover:border-netflixRed/50 transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-netflixRed transition-colors">
              Streaming Account Management
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Add personal accounts, manage nicknames, and sync Gmail alerts.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-netflixRed transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
        </Link>

        <Link
          href="/admin/devices"
          className="p-5 rounded-2xl bg-gradient-to-r from-visionDark-900 to-visionDark-850 border border-visionDark-800 hover:border-blue-500/50 transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              Personal Device Registry
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Register smart TVs, streaming boxes, and household locations.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
        </Link>

        <Link
          href="/admin/tickets"
          className="p-5 rounded-2xl bg-gradient-to-r from-visionDark-900 to-visionDark-850 border border-visionDark-800 hover:border-yellow-500/50 transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">
              Activity & Verification Queue
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Review TV activation submissions and mark manual activations.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
        </Link>
      </div>

      {/* TWO COLUMN ROW: RECENT ACTIVATIONS & AUDIT LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* RECENT TV ACTIVATION LOGS */}
        <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <Tv className="w-4 h-4 text-netflixRed" />
              Recent TV Code Records
            </h3>
            <Link href="/admin/tickets" className="text-xs text-netflixRed hover:text-netflixRed-hover font-semibold">
              View All
            </Link>
          </div>

          {tvActivations.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-visionDark-850/60 border border-visionDark-800">
              <CheckCircle2 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No TV activation records logged yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tvActivations.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-xl bg-visionDark-850 border border-visionDark-700/80 text-xs flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white bg-visionDark-800 px-2 py-0.5 rounded border border-visionDark-700">
                        {req.tracking_number}
                      </span>
                      <span className="font-mono font-semibold text-netflixRed">{req.tv_code}</span>
                    </div>
                    <p className="text-gray-300">
                      {req.device_name}
                      {req.netflix_account ? ` (${req.netflix_account.account_nickname || req.netflix_account.account_email})` : ''}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    req.status === 'ACTIVATED'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-visionDark-800 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AUDIT LOG TRAIL */}
        <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <History className="w-4 h-4 text-green-400" />
              System Audit Trail
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">Real-time</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-visionDark-850/60 border border-visionDark-800">
              <p className="text-xs text-gray-400">No audit events logged yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {auditLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-visionDark-850 border border-visionDark-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px]">
                    {log.details ? JSON.stringify(log.details) : log.target_type}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}