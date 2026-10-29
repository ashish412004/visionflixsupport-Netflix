import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export function DisclaimerBanner({ compact = false }: DisclaimerBannerProps) {
  if (compact) {
    return (
      <div className="bg-visionDark-900 border-b border-visionDark-700/60 px-4 py-1.5 text-center text-[11px] text-gray-400">
        <span className="font-semibold text-gray-300">Notice:</span> VisionFlix is an independent support concierge service and is <span className="text-gray-300">not affiliated with Netflix</span>.
      </div>
    );
  }

  return (
    <div className="bg-visionDark-900/90 border border-visionDark-700/70 rounded-xl p-3.5 sm:p-4 my-4 flex items-start gap-3 shadow-sm">
      <div className="p-1.5 rounded-lg bg-netflixRed/10 text-netflixRed shrink-0 mt-0.5">
        <ShieldAlert className="w-5 h-5" />
      </div>
      <div className="text-xs sm:text-sm text-gray-300 leading-relaxed">
        <p className="font-semibold text-white mb-0.5">Important Security & Independence Disclosure</p>
        <p className="text-gray-400">
          VisionFlix is an independent third-party customer support service and is not affiliated with, endorsed by, or sponsored by Netflix, Inc.
          Our specialists provide device network routing and manual concierge assistance. We will <span className="text-white font-medium">never</span> ask for your Netflix password, verification OTPs, or payment credentials.
        </p>
      </div>
    </div>
  );
}
