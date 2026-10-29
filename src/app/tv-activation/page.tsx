'use client';

import React from 'react';
import { TvCodeInput } from '@/components/tv/TvCodeInput';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { 
  Tv, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import Link from 'next/link';

export default function TvActivationPage() {
  const { tvActivations, markDeviceActivated } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-netflixRed/10 border border-netflixRed/20 text-netflixRed text-xs font-semibold uppercase tracking-wider mb-3">
          <Tv className="w-3.5 h-3.5" />
          <span>Personal TV Activation Concierge</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase mb-3">
          Connect Your TV
        </h1>
        <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Enter the 8-character code shown on your Smart TV to open the official Netflix activation flow and track activation status.
        </p>
      </div>

      <DisclaimerBanner />

      {/* 3-Step Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        <div className="bg-visionDark-900 border border-visionDark-800 rounded-xl p-4 flex sm:flex-col items-center sm:items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-visionDark-800 border border-visionDark-700 text-netflixRed font-bold flex items-center justify-center shrink-0 text-sm">
            1
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Open Netflix on TV</h3>
            <p className="text-[11px] text-gray-400">Launch the app on your Smart TV or streaming stick and select &quot;Sign In&quot; to prompt code display.</p>
          </div>
        </div>

        <div className="bg-visionDark-900 border border-visionDark-800 rounded-xl p-4 flex sm:flex-col items-center sm:items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-visionDark-800 border border-visionDark-700 text-netflixRed font-bold flex items-center justify-center shrink-0 text-sm">
            2
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Enter Code Below</h3>
            <p className="text-[11px] text-gray-400">Enter the 8 characters below. We validate the syntax and open the official Netflix activation page.</p>
          </div>
        </div>

        <div className="bg-visionDark-900 border border-visionDark-800 rounded-xl p-4 flex sm:flex-col items-center sm:items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-visionDark-800 border border-visionDark-700 text-netflixRed font-bold flex items-center justify-center shrink-0 text-sm">
            3
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Sign In & Confirm</h3>
            <p className="text-[11px] text-gray-400">Complete official sign-in at netflix.com/activate and mark your device as activated.</p>
          </div>
        </div>
      </div>

      {/* Main Code Input */}
      <div className="my-8">
        <TvCodeInput codeLength={8} />
      </div>

      {/* Personal TV Activation History */}
      {tvActivations.length > 0 && (
        <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-6 my-10 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-netflixRed" />
            Your TV Activation History ({tvActivations.length})
          </h3>

          <div className="space-y-3">
            {tvActivations.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-visionDark-850 border border-visionDark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono font-bold text-white bg-visionDark-800 px-2 py-0.5 rounded border border-visionDark-700">
                      {item.tracking_number}
                    </span>
                    <span className="font-mono font-black text-netflixRed bg-netflixRed/10 px-2.5 py-0.5 rounded border border-netflixRed/25">
                      CODE: {item.tv_code}
                    </span>
                    <span className="font-semibold text-white">
                      {item.device_name}
                    </span>
                  </div>

                  <span className="text-[11px] text-gray-400">
                    Logged {new Date(item.created_at).toLocaleDateString()}
                    {item.activated_at && ` • Activated on ${new Date(item.activated_at).toLocaleDateString()}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                    item.status === 'ACTIVATED'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>

                  {item.status !== 'ACTIVATED' && (
                    <button
                      onClick={() => markDeviceActivated(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-visionDark-800 hover:bg-visionDark-750 text-green-400 hover:text-green-300 text-xs font-semibold border border-visionDark-700 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Activated
                    </button>
                  )}

                  <a
                    href="https://www.netflix.com/activate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-visionDark-800 hover:bg-visionDark-750 text-gray-300 hover:text-white transition-colors"
                    title="Open official Netflix activation in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helpful Links */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-visionDark-800 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-netflixRed" />
          <span>Having Household Verification blocks?</span>
          <Link href="/household" className="text-white font-semibold hover:underline">
            Open Household Troubleshooting Guide &rarr;
          </Link>
        </div>
      </div>

    </div>
  );
}
