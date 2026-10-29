'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Tv, 
  Shield, 
  Send, 
  Loader2, 
  AlertCircle, 
  Lock, 
  ArrowLeft
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { HouseholdIssueType } from '@/types';
import Link from 'next/link';

export default function NewTicketPage() {
  const router = useRouter();
  const { 
    currentUser, 
    netflixAccounts,
    personalDevices,
    submitTvCode, 
    submitHouseholdIssue 
  } = useApp();
  
  const [requestType, setRequestType] = useState<'TV' | 'HOUSEHOLD'>('TV');
  const [deviceName, setDeviceName] = useState('Living Room Smart TV');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [tvCode, setTvCode] = useState('');
  const [issueType, setIssueType] = useState<HouseholdIssueType>('not_in_household');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (requestType === 'TV') {
        const cleanCode = tvCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (cleanCode.length !== 8) {
          setError('Please provide an 8-character activation code displayed on your TV.');
          setIsLoading(false);
          return;
        }
        const res = await submitTvCode(
          cleanCode, 
          deviceName.trim() || 'Smart TV',
          selectedAccountId || undefined,
          notes.trim() || undefined
        );
        if (res.success) {
          router.push('/tickets');
        } else {
          setError(res.error || 'Failed to submit TV code.');
        }
      } else {
        const res = await submitHouseholdIssue(
          deviceName.trim() || 'Personal Device',
          issueType,
          selectedAccountId || undefined,
          notes.trim() || undefined
        );
        if (res.success) {
          router.push('/tickets');
        } else {
          setError(res.error || 'Failed to submit household request.');
        }
      }
    } catch {
      setError('An error occurred submitting your request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      <div className="mb-6">
        <Link href="/tickets" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Activity History
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Submit Support Record
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Open a TV activation record or log a Netflix Household verification challenge.
        </p>
      </div>

      <DisclaimerBanner compact />

      {/* SENSITIVE DATA WARNING */}
      <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-4 my-6 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-netflixRed/15 text-netflixRed shrink-0">
          <Lock className="w-4 h-4" />
        </div>
        <div className="text-xs text-gray-300">
          <h4 className="font-bold text-white mb-0.5">Zero-Credential Protection</h4>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            Never submit your Netflix password or email passwords. VisionFlix records TV codes and official verification events safely without credentials.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-netflixRed shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-6 space-y-5">
        
        {/* Request Type Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
            Record Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRequestType('TV')}
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all text-xs font-semibold ${
                requestType === 'TV'
                  ? 'bg-netflixRed/15 border-netflixRed text-white shadow-glow-red'
                  : 'bg-visionDark-850 border-visionDark-700 text-gray-400 hover:text-white'
              }`}
            >
              <Tv className={`w-4 h-4 ${requestType === 'TV' ? 'text-netflixRed' : ''}`} />
              <span>TV Activation Code</span>
            </button>

            <button
              type="button"
              onClick={() => setRequestType('HOUSEHOLD')}
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all text-xs font-semibold ${
                requestType === 'HOUSEHOLD'
                  ? 'bg-blue-600/15 border-blue-500 text-white'
                  : 'bg-visionDark-850 border-visionDark-700 text-gray-400 hover:text-white'
              }`}
            >
              <Shield className={`w-4 h-4 ${requestType === 'HOUSEHOLD' ? 'text-blue-400' : ''}`} />
              <span>Household Help</span>
            </button>
          </div>
        </div>

        {/* Device Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Device Name *
          </label>
          <input
            type="text"
            required
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g. Living Room Samsung TV"
            className="w-full px-4 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-netflixRed"
          />
        </div>

        {/* Netflix Account link if available */}
        {netflixAccounts.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Associated Netflix Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
            >
              <option value="">-- Select Netflix Account --</option>
              {netflixAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_nickname ? `${acc.account_nickname} (${acc.account_email})` : acc.account_email}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* TV Code Input or Household Issue Selector */}
        {requestType === 'TV' ? (
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              8-Character TV Code *
            </label>
            <input
              type="text"
              maxLength={8}
              required
              value={tvCode}
              onChange={(e) => setTvCode(e.target.value.toUpperCase())}
              placeholder="e.g. 84920194"
              className="w-full px-4 py-3 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white font-mono text-center text-lg tracking-widest placeholder-gray-600 focus:outline-none focus:border-netflixRed"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Household Issue Category
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as HouseholdIssueType)}
              className="w-full px-4 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
            >
              <option value="not_in_household">TV Not Part of Netflix Household</option>
              <option value="travel_temporary">Watching While Traveling / Temporary Access</option>
              <option value="router_replacement">Home Wi-Fi Router / Network Changed</option>
              <option value="other">Other Household Verification Challenge</option>
            </select>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Additional Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any context or error message displayed on your device..."
            className="w-full px-4 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-netflixRed"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Logging Record...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Record</span>
            </>
          )}
        </button>

      </form>

    </div>
  );
}