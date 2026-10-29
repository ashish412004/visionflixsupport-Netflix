'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Tv, 
  Shield, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  ShieldCheck, 
  Info,
  Check,
  ExternalLink
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  
  const { 
    tvActivations, 
    householdVerifications, 
    isAdmin,
    markDeviceActivated,
    markHouseholdSolved
  } = useApp();

  const tvReq = tvActivations.find((r) => r.id === ticketId || r.tracking_number.toUpperCase() === ticketId.toUpperCase());
  const houseReq = householdVerifications.find((r) => r.id === ticketId || r.tracking_number.toUpperCase() === ticketId.toUpperCase());

  const [updateMsg, setUpdateMsg] = useState('');

  if (!tvReq && !houseReq) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-netflixRed mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Record Not Found</h2>
        <p className="text-xs text-gray-400 mb-6">
          The requested record was not found or has been removed.
        </p>
        <Link
          href="/tickets"
          className="px-5 py-2.5 rounded-xl bg-netflixRed text-white text-xs font-bold"
        >
          Return to Activity
        </Link>
      </div>
    );
  }

  const isTv = Boolean(tvReq);
  const req = (tvReq || houseReq)!;

  const handleMarkComplete = async () => {
    if (isTv) {
      await markDeviceActivated(req.id);
      setUpdateMsg('TV activation marked as completed.');
    } else {
      await markHouseholdSolved(req.id);
      setUpdateMsg('Household issue marked as resolved.');
    }
    setTimeout(() => setUpdateMsg(''), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header & Back Link */}
      <div className="mb-6">
        <Link
          href={isAdmin ? "/admin/tickets" : "/tickets"}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to {isAdmin ? 'Admin Queue' : 'Activity'}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-xs font-bold text-white bg-visionDark-800 px-2.5 py-1 rounded border border-visionDark-700">
                {req.tracking_number}
              </span>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                req.status === 'ACTIVATED' || req.status === 'RESOLVED' || req.status === 'VERIFIED_ON_TV'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-visionDark-800 text-yellow-400 border border-yellow-500/20'
              }`}>
                {req.status}
              </span>

              <span className="text-xs text-gray-400">
                Logged {new Date(req.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              {isTv ? `TV Activation: ${(tvReq as any).tv_code}` : `Household: ${(houseReq as any).issue_type?.replace(/_/g, ' ')}`}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Device: <strong className="text-white">{req.device_name}</strong>
              {req.netflix_account && (
                <span> • Account: <strong className="text-netflixRed">{req.netflix_account.account_nickname || req.netflix_account.account_email}</strong></span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isTv && (
              <a
                href="https://www.netflix.com/activate"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red flex items-center gap-1.5"
              >
                <span>Open Netflix.com/activate</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={handleMarkComplete}
              className="px-4 py-2 rounded-xl bg-visionDark-800 hover:bg-visionDark-700 text-white text-xs font-bold border border-visionDark-700 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-green-400" />
              Mark as Completed
            </button>
          </div>
        </div>
      </div>

      <DisclaimerBanner compact />

      {updateMsg && (
        <div className="p-3 my-4 rounded-xl bg-green-950/40 border border-green-800/60 text-xs text-green-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
          <span>{updateMsg}</span>
        </div>
      )}

      {/* DETAIL CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        
        {/* Left 2 Cols: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-visionDark-900 border border-visionDark-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Record Information</h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Hardware Device</span>
                <span className="font-semibold text-white">{req.device_name}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Tracking Identifier</span>
                <span className="font-mono font-semibold text-white">{req.tracking_number}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Status</span>
                <span className="font-semibold text-white">{req.status}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Created At</span>
                <span className="text-white">{new Date(req.created_at).toLocaleString()}</span>
              </div>
            </div>

            {isTv && (
              <div className="p-4 rounded-xl bg-visionDark-850 border border-visionDark-700/80">
                <span className="text-gray-400 block text-[11px] mb-1">Activation Code Displayed on TV</span>
                <span className="text-2xl font-black font-mono tracking-widest text-white">
                  {(tvReq as any).tv_code}
                </span>
              </div>
            )}

            {isTv && (tvReq as any).notes && (
              <div className="text-xs text-gray-300">
                <span className="text-gray-400 block text-[11px] mb-1">Notes</span>
                <p className="p-3 rounded-lg bg-visionDark-850 border border-visionDark-700">
                  {(tvReq as any).notes}
                </p>
              </div>
            )}

            {!isTv && (
              <div className="space-y-3 text-xs text-gray-300">
                <div>
                  <span className="text-gray-400 block text-[11px] mb-1">Issue Type</span>
                  <span className="font-semibold text-white">
                    {(houseReq as any).issue_type?.replace(/_/g, ' ')}
                  </span>
                </div>
                {(houseReq as any).notes && (
                  <div>
                    <span className="text-gray-400 block text-[11px] mb-1">Notes</span>
                    <p className="p-3 rounded-lg bg-visionDark-850 border border-visionDark-700">
                      {(houseReq as any).notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Official Steps */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800 text-xs">
            <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>Official Verification</span>
            </h4>
            <p className="text-gray-400 text-[11px] leading-relaxed mb-4">
              To complete activation or household validation, Netflix sends email confirmations to the account inbox. Check your Gmail inbox or open the link directly.
            </p>
            <Link
              href="/household"
              className="w-full block py-2 rounded-xl bg-visionDark-800 hover:bg-visionDark-700 text-white text-center text-xs font-semibold border border-visionDark-700 transition-colors"
            >
              Open Household Assistant
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}