'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Wifi, 
  Tv, 
  Smartphone, 
  CheckCircle2, 
  Info, 
  HelpCircle, 
  Send, 
  Loader2, 
  Lock,
  ExternalLink,
  Check,
  Plus
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { GmailNotificationInbox } from '@/components/gmail/GmailNotificationInbox';
import { HouseholdIssueType } from '@/types';
import Link from 'next/link';

export default function HouseholdPage() {
  const { 
    currentUser, 
    personalDevices, 
    householdVerifications, 
    submitHouseholdIssue, 
    markHouseholdSolved 
  } = useApp();

  const [deviceName, setDeviceName] = useState('Living Room Smart TV');
  const [issueType, setIssueType] = useState<HouseholdIssueType>('not_in_household');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Please sign in to track household issues.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await submitHouseholdIssue(deviceName.trim(), issueType, undefined, notes.trim());
      if (res.success) {
        setSuccessMsg(`Household issue tracked under ${res.trackingNumber}. Follow the official steps below.`);
        setNotes('');
      } else {
        setErrorMsg(res.error || 'Failed to submit issue.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-netflixRed/10 border border-netflixRed/25 text-netflixRed text-xs font-semibold uppercase tracking-wider mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>Netflix Household Management & Diagnostics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase mb-3">
          Household Access & Verification
        </h1>
        <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Manage your personal registered devices, review Netflix household error diagnostics, and monitor incoming verification emails via secure Gmail integration.
        </p>
      </div>

      <DisclaimerBanner />

      {/* Gmail Inbox Integration Widget (Shows verification emails with secure link to Gmail) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-netflixRed" />
            Netflix Household & Sign-In Email Notifications
          </h2>
          <span className="text-xs text-gray-400">Direct from your registered inbox</span>
        </div>
        <GmailNotificationInbox />
      </div>

      {/* MY REGISTERED DEVICES */}
      <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-netflixRed" />
              My Registered Devices ({personalDevices.length})
            </h3>
            <p className="text-xs text-gray-400">
              Hardware tracked under your personal Netflix accounts.
            </p>
          </div>
          <Link
            href="/settings"
            className="px-3.5 py-1.5 rounded-xl bg-visionDark-850 hover:bg-visionDark-800 text-xs font-semibold text-gray-200 border border-visionDark-700 transition-colors"
          >
            Manage Hardware
          </Link>
        </div>

        {personalDevices.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-visionDark-950/60 rounded-xl border border-visionDark-800">
            <Tv className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 font-medium mb-1">No personal devices registered yet.</p>
            <p className="text-[11px]">Add your Smart TVs and streaming devices in your Account Manager.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {personalDevices.map((dev) => (
              <div
                key={dev.id}
                className="p-3.5 rounded-xl bg-visionDark-850 border border-visionDark-750 flex items-start justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-netflixRed" />
                    {dev.device_name}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">{dev.device_type}</p>
                  {dev.household_network && (
                    <p className="text-[10px] text-gray-500 mt-0.5">Wi-Fi: {dev.household_network}</p>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                  {dev.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OFFICIAL VERIFICATION INSTRUCTIONS */}
      <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          Official Netflix Household Verification Walkthrough
        </h3>
        <p className="text-xs text-gray-400">
          When your TV displays &quot;This TV isn&apos;t part of your Netflix Household&quot;, follow these official steps:
        </p>

        <div className="space-y-3 pt-2">
          <div className="flex gap-4 p-4 rounded-xl bg-visionDark-850 border border-visionDark-750 text-xs">
            <span className="w-6 h-6 rounded-lg bg-visionDark-800 text-netflixRed font-bold flex items-center justify-center shrink-0">1</span>
            <div>
              <h4 className="font-semibold text-white mb-0.5">Connect to Home Wi-Fi</h4>
              <p className="text-gray-400 text-[11px]">
                Verify both your Smart TV and your smartphone are connected to the exact same home internet router (avoid cellular data or guest networks).
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-visionDark-850 border border-visionDark-750 text-xs">
            <span className="w-6 h-6 rounded-lg bg-visionDark-800 text-netflixRed font-bold flex items-center justify-center shrink-0">2</span>
            <div>
              <h4 className="font-semibold text-white mb-0.5">Select &quot;Update Netflix Household&quot; on TV</h4>
              <p className="text-gray-400 text-[11px]">
                On your TV warning prompt, choose &quot;Update Netflix Household&quot; or &quot;Troubleshoot&quot;. Netflix will send a secure confirmation link to your registered email inbox.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-visionDark-850 border border-visionDark-750 text-xs">
            <span className="w-6 h-6 rounded-lg bg-visionDark-800 text-netflixRed font-bold flex items-center justify-center shrink-0">3</span>
            <div>
              <h4 className="font-semibold text-white mb-0.5">Open Email on Mobile & Confirm</h4>
              <p className="text-gray-400 text-[11px]">
                Open the message securely in your connected Gmail inbox above, tap &quot;Yes, This Was Me&quot;, and select &quot;Confirm Update&quot;.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-visionDark-850 border border-visionDark-750 text-xs">
            <span className="w-6 h-6 rounded-lg bg-visionDark-800 text-netflixRed font-bold flex items-center justify-center shrink-0">4</span>
            <div>
              <h4 className="font-semibold text-white mb-0.5">Relaunch TV App</h4>
              <p className="text-gray-400 text-[11px]">
                Return to your TV and select &quot;Start Watching&quot;. Your TV is now synchronized with your confirmed household IP.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TRACK MANUALLY COMPLETED VERIFICATION */}
      <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-netflixRed/10 text-netflixRed">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Log Household Verification Issue</h3>
            <p className="text-xs text-gray-400">Keep personal records of which devices were verified and when.</p>
          </div>
        </div>

        <form onSubmit={handleReportIssue} className="space-y-4 text-xs pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-1.5">Device Name</label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. Living Room Smart TV"
                className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white focus:outline-none focus:border-netflixRed"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1.5">Issue Type</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as HouseholdIssueType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white focus:outline-none focus:border-netflixRed"
              >
                <option value="not_in_household">&quot;This TV is not part of your Netflix Household&quot;</option>
                <option value="travel_temporary">Temporary Vacation / Travel Access Needed</option>
                <option value="router_replacement">Router Replacement / New Wi-Fi Network</option>
                <option value="other">Other Household Roadblock</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Personal Notes (Optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Router IP rebooted after ISP maintenance... (Do NOT enter passwords or OTPs)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white focus:outline-none focus:border-netflixRed resize-none"
            />
          </div>

          {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
          {successMsg && <p className="text-xs text-green-400 font-semibold">{successMsg}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white font-bold transition-all shadow-glow-red flex items-center gap-1.5"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Track Verification Request
          </button>
        </form>

        {/* List of tracked verifications */}
        {householdVerifications.length > 0 && (
          <div className="pt-6 border-t border-visionDark-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
              Tracked Household Verifications ({householdVerifications.length})
            </span>

            <div className="space-y-2">
              {householdVerifications.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-xl bg-visionDark-850 border border-visionDark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{v.tracking_number}</span>
                      <span className="text-white font-semibold">{v.device_name}</span>
                      <span className="text-gray-400">({v.issue_type.replace(/_/g, ' ')})</span>
                    </div>
                    {v.notes && <p className="text-[11px] text-gray-400 mt-1">{v.notes}</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      v.status === 'VERIFIED_ON_TV' || v.status === 'RESOLVED'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {v.status.replace(/_/g, ' ')}
                    </span>

                    {v.status !== 'VERIFIED_ON_TV' && v.status !== 'RESOLVED' && (
                      <button
                        onClick={() => markHouseholdSolved(v.id)}
                        className="px-3 py-1 rounded-lg bg-visionDark-800 hover:bg-visionDark-750 text-green-400 hover:text-green-300 text-xs font-semibold border border-visionDark-700 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark as Verified
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
