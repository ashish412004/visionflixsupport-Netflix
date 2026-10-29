'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Tv, 
  Shield, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  MessageSquare,
  ChevronRight,
  X,
  Check,
  ExternalLink
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';

export default function AdminTicketsPage() {
  const { 
    tvActivations, 
    householdVerifications, 
    markDeviceActivated, 
    markHouseholdSolved 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'TV' | 'HOUSEHOLD'>('TV');
  const [search, setSearch] = useState('');

  const filteredTv = tvActivations.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.tracking_number.toLowerCase().includes(q) ||
      r.tv_code.toLowerCase().includes(q) ||
      r.device_name.toLowerCase().includes(q) ||
      (r.netflix_account?.account_nickname && r.netflix_account.account_nickname.toLowerCase().includes(q)) ||
      (r.netflix_account?.account_email && r.netflix_account.account_email.toLowerCase().includes(q))
    );
  });

  const filteredHousehold = householdVerifications.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.tracking_number.toLowerCase().includes(q) ||
      r.device_name.toLowerCase().includes(q) ||
      r.issue_type.toLowerCase().includes(q) ||
      (r.notes && r.notes.toLowerCase().includes(q)) ||
      (r.netflix_account?.account_nickname && r.netflix_account.account_nickname.toLowerCase().includes(q)) ||
      (r.netflix_account?.account_email && r.netflix_account.account_email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-netflixRed">Activity Queue</span>
          <h1 className="text-2xl font-black text-white mt-1">TV & Household Activity Log</h1>
          <p className="text-xs text-gray-400 mt-1">
            Review TV code submissions and manage household network verification records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/tv-activation"
            className="px-4 py-2 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red flex items-center gap-1.5"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Test TV Screen</span>
          </Link>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-visionDark-900 border border-visionDark-800">
          <button
            onClick={() => setActiveTab('TV')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'TV'
                ? 'bg-netflixRed text-white shadow-glow-red'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>TV Activations ({tvActivations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('HOUSEHOLD')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'HOUSEHOLD'
                ? 'bg-netflixRed text-white shadow-glow-red'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Household Verifications ({householdVerifications.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search code, device, or tracking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-visionDark-900 border border-visionDark-800 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-netflixRed"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* LIST CONTENT */}
      {activeTab === 'TV' ? (
        filteredTv.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-visionDark-900 border border-visionDark-800">
            <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">No TV activation records</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Submit an 8-character code from a Smart TV via the TV Activation screen to record genuine activation history.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTv.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800 hover:border-visionDark-700 transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-white bg-visionDark-800 px-2 py-0.5 rounded border border-visionDark-700">
                      {item.tracking_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === 'ACTIVATED'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : item.status === 'UNABLE_TO_ACTIVATE'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-visionDark-800 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <span className="font-mono text-base font-black text-white tracking-wider">
                      {item.tv_code}
                    </span>
                    <span className="text-gray-300 font-medium">
                      Device: {item.device_name}
                    </span>
                  </div>

                  {item.netflix_account && (
                    <p className="text-[11px] text-gray-400">
                      Account: {item.netflix_account.account_nickname || item.netflix_account.account_email}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-[11px] text-gray-400">
                      Notes: {item.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status !== 'ACTIVATED' && (
                    <button
                      onClick={() => markDeviceActivated(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold border border-green-500/30 transition-colors"
                    >
                      Mark Activated
                    </button>
                  )}
                  <a
                    href="https://www.netflix.com/activate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-visionDark-800 hover:bg-visionDark-700 text-gray-200 text-xs font-semibold border border-visionDark-700 flex items-center gap-1 transition-colors"
                  >
                    <span>Activate in Netflix</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredHousehold.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-visionDark-900 border border-visionDark-800">
            <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">No household verification records</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Household network troubleshooting records and verification logs will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHousehold.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800 hover:border-visionDark-700 transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-white bg-visionDark-800 px-2 py-0.5 rounded border border-visionDark-700">
                      {item.tracking_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === 'RESOLVED' || item.status === 'VERIFIED_ON_TV'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-visionDark-800 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-1">
                    <span className="font-bold text-white">
                      {item.device_name}
                    </span>
                    <span className="text-gray-400 ml-2">
                      ({item.issue_type.replace(/_/g, ' ')})
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-gray-400">
                      Notes: {item.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status !== 'RESOLVED' && item.status !== 'VERIFIED_ON_TV' && (
                    <button
                      onClick={() => markHouseholdSolved(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold border border-green-500/30 transition-colors"
                    >
                      Mark Solved
                    </button>
                  )}
                  <Link
                    href="/household"
                    className="px-3 py-1.5 rounded-lg bg-visionDark-800 hover:bg-visionDark-700 text-gray-200 text-xs font-semibold border border-visionDark-700 transition-colors"
                  >
                    Assistant &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
}