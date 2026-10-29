'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Lock, 
  CheckCircle2, 
  Clock,
  Sparkles,
  Link2Off
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';

interface GmailNotificationInboxProps {
  compact?: boolean;
}

export function GmailNotificationInbox({ compact = false }: GmailNotificationInboxProps) {
  const { 
    gmailStatus, 
    gmailMessages, 
    isLoadingGmail, 
    refreshGmailMessages, 
    disconnectGmail 
  } = useApp();

  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (confirm('Disconnect your Gmail inbox integration?')) {
      setIsDisconnecting(true);
      await disconnectGmail();
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-5 sm:p-6 shadow-2xl">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-visionDark-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-netflixRed/15 text-netflixRed">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Registered Email Inbox</h3>
              {gmailStatus?.isConnected && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {gmailStatus?.isConnected && gmailStatus.emailAddress
                ? `Monitoring Netflix notifications on ${gmailStatus.emailAddress}`
                : 'Connect your Gmail inbox via read-only OAuth to view Netflix sign-in & Household notifications.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gmailStatus?.isConnected ? (
            <>
              <button
                onClick={refreshGmailMessages}
                disabled={isLoadingGmail}
                className="px-3 py-1.5 rounded-xl bg-visionDark-850 hover:bg-visionDark-800 text-gray-300 hover:text-white text-xs font-semibold border border-visionDark-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Refresh notifications"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGmail ? 'animate-spin text-netflixRed' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="p-2 rounded-xl bg-visionDark-850 hover:bg-red-950/50 text-gray-400 hover:text-red-400 border border-visionDark-700 transition-colors"
                title="Disconnect Gmail integration"
              >
                <Link2Off className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <a
              href="/api/auth/google"
              className="px-4 py-2 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" />
              Connect Gmail (Read-Only)
            </a>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="my-4 p-3 rounded-xl bg-visionDark-950 border border-visionDark-800 flex items-start gap-2.5 text-xs text-gray-400">
        <Lock className="w-4 h-4 text-netflixRed shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong className="text-gray-300">Security Guarantee:</strong> Read-only access displays notification subject and timestamps. VisionFlix never collects, stores, or auto-redeems authentication tokens or OTPs. Open your original email securely in Gmail to complete official verification.
        </p>
      </div>

      {/* Message List */}
      {!gmailStatus?.isConnected ? (
        <div className="py-8 text-center text-xs text-gray-500">
          <Mail className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 font-medium mb-1">Gmail Inbox Not Connected</p>
          <p className="max-w-md mx-auto text-[11px]">
            Connect your Gmail address to view incoming Netflix Household and device sign-in notifications directly in this dashboard.
          </p>
        </div>
      ) : gmailMessages.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-500">
          <p className="text-gray-400 font-medium">No recent Netflix notifications found.</p>
          <p className="text-[11px] mt-1">When Netflix sends sign-in alerts or household verification messages, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2.5 mt-4">
          {gmailMessages.map((msg) => (
            <div
              key={msg.id}
              className="p-3.5 rounded-xl bg-visionDark-850 border border-visionDark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-visionDark-700 transition-colors"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white truncate">{msg.subject}</span>
                  
                  {msg.isHouseholdAlert && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-netflixRed/15 text-netflixRed border border-netflixRed/30">
                      Household Notice
                    </span>
                  )}
                  {msg.isSignInAlert && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      Sign-In Activity
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-gray-400 line-clamp-1">
                  {msg.snippet || 'Notification from Netflix'}
                </p>

                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span>From: {msg.sender}</span>
                  <span>•</span>
                  <span>{new Date(msg.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              </div>

              <div className="shrink-0">
                <a
                  href={msg.originalGmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-visionDark-800 hover:bg-visionDark-750 text-white text-xs font-semibold border border-visionDark-700 transition-colors"
                >
                  <span>Open in Gmail</span>
                  <ExternalLink className="w-3 h-3 text-netflixRed" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
