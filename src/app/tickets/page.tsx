'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Inbox, 
  Tv, 
  Shield, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  RefreshCw,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

export default function TicketsPage() {
  const { 
    currentUser, 
    tvActivations, 
    householdVerifications,
    markDeviceActivated,
    markHouseholdSolved
  } = useApp();
  
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const combinedRequests = [
    ...tvActivations.map((r) => ({
      id: r.id,
      trackingNumber: r.tracking_number,
      type: 'TV_ACTIVATION' as const,
      title: `TV Activation - ${r.device_name}`,
      subtitle: `Code: ${r.tv_code}`,
      status: r.status,
      date: r.created_at,
      response: r.notes || 'TV activation requested.',
      account: r.netflix_account?.account_nickname || r.netflix_account?.account_email
    })),
    ...householdVerifications.map((r) => ({
      id: r.id,
      trackingNumber: r.tracking_number,
      type: 'HOUSEHOLD' as const,
      title: `Household Verification - ${r.device_name}`,
      subtitle: r.issue_type.replace(/_/g, ' '),
      status: r.status,
      date: r.created_at,
      response: r.notes || 'Household verification in progress.',
      account: r.netflix_account?.account_nickname || r.netflix_account?.account_email
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = combinedRequests.filter((item) => {
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.trackingNumber.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-netflixRed">Activity History</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            TV & Household Activity
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track personal TV code submissions, household network verifications, and progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      <DisclaimerBanner />

      {/* FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-6">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'ALL'
                ? 'bg-visionDark-700 text-white'
                : 'bg-visionDark-850 text-gray-400 hover:text-white'
            }`}
          >
            All ({combinedRequests.length})
          </button>
          <button
            onClick={() => setFilterType('TV_ACTIVATION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              filterType === 'TV_ACTIVATION'
                ? 'bg-netflixRed text-white'
                : 'bg-visionDark-850 text-gray-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            TV Activations ({tvActivations.length})
          </button>
          <button
            onClick={() => setFilterType('HOUSEHOLD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              filterType === 'HOUSEHOLD'
                ? 'bg-blue-600 text-white'
                : 'bg-visionDark-850 text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Household ({householdVerifications.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by code or tracking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-visionDark-900 border border-visionDark-700 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-netflixRed"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

      </div>

      {/* REQUESTS LIST */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No activity records found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
            {searchQuery 
              ? `No requests match "${searchQuery}". Try a different keyword.` 
              : 'You have not submitted any TV activations or household verification requests yet.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/tv-activation"
              className="px-4 py-2 rounded-xl bg-netflixRed text-white text-xs font-bold"
            >
              Start TV Activation
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800 hover:border-visionDark-700 transition-all text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-white bg-visionDark-800 px-2.5 py-0.5 rounded border border-visionDark-700">
                      {item.trackingNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === 'ACTIVATED' || item.status === 'RESOLVED' || item.status === 'VERIFIED_ON_TV'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : item.status === 'UNABLE_TO_ACTIVATE'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-visionDark-800 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-gray-400 text-[11px]">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    {item.account && (
                      <span className="text-[11px] text-gray-400">
                        • Account: {item.account}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white pt-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-xs font-mono">
                    {item.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.type === 'TV_ACTIVATION' && item.status !== 'ACTIVATED' && (
                    <button
                      onClick={() => markDeviceActivated(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold border border-green-500/30 transition-colors"
                    >
                      Mark Activated
                    </button>
                  )}
                  {item.type === 'HOUSEHOLD' && item.status !== 'RESOLVED' && item.status !== 'VERIFIED_ON_TV' && (
                    <button
                      onClick={() => markHouseholdSolved(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold border border-green-500/30 transition-colors"
                    >
                      Mark Solved
                    </button>
                  )}
                  {item.type === 'TV_ACTIVATION' && (
                    <a
                      href="https://www.netflix.com/activate"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-visionDark-800 hover:bg-visionDark-700 text-gray-200 text-xs font-semibold border border-visionDark-700 flex items-center gap-1 transition-colors"
                    >
                      Netflix.com <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {item.response && (
                <div className="mt-3 pt-3 border-t border-visionDark-800 text-[11px] text-gray-400">
                  <span className="text-gray-500 font-semibold">Notes:</span> {item.response}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}