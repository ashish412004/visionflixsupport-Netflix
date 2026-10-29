import React from 'react';
import Link from 'next/link';
import { Tv, Shield, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-visionDark-950 border-t border-visionDark-800 text-gray-400 text-xs mt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top Footer Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-netflixRed flex items-center justify-center">
                <Tv className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-black tracking-wider text-white">
                VISION<span className="text-netflixRed">FLIX</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              Dedicated customer support concierge for Smart TV activation and Household network troubleshooting.
            </p>
            <div className="flex items-center gap-2 text-green-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Concierge Support Queue Online
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Support Services</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tv-activation" className="hover:text-white transition-colors">
                  TV Code Activation Queue
                </Link>
              </li>
              <li>
                <Link href="/household" className="hover:text-white transition-colors">
                  Netflix Household Diagnostics
                </Link>
              </li>
              <li>
                <Link href="/tickets" className="hover:text-white transition-colors">
                  Track Support Requests
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-white transition-colors">
                  Knowledge Base & FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Customer Account</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Customer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-white transition-colors">
                  Device Record Allocation
                </Link>
              </li>
              <li>
                <Link href="/tickets" className="hover:text-white transition-colors">
                  Active Support Tickets
                </Link>
              </li>
              <li className="flex items-center gap-1 text-gray-500">
                <Lock className="w-3.5 h-3.5" /> Zero-Credential Policy
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Compliance & Trust</h4>
            <p className="text-gray-400 text-[11px] leading-relaxed mb-2">
              VisionFlix adheres strictly to consumer protection and data security principles. We do not solicit or store streaming passwords or OTP verification codes.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <Shield className="w-3.5 h-3.5 text-netflixRed" />
              <span>TLS 256-bit Encrypted Transmission</span>
            </div>
          </div>

        </div>

        {/* Legal Disclaimer Box */}
        <div className="border-t border-visionDark-800 pt-6 mt-6">
          <div className="bg-visionDark-900/60 border border-visionDark-800/80 rounded-xl p-4 text-[11px] leading-relaxed text-gray-400">
            <p className="font-semibold text-gray-300 mb-1">
              Independent Support Service Disclosure:
            </p>
            <p>
              VisionFlix is an independent third-party technical support platform and concierge service. VisionFlix is not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with Netflix, Inc., or any of its subsidiaries or affiliates. The official Netflix website is available at netflix.com. The names Netflix as well as related names, marks, emblems, and images are registered trademarks of their respective owners.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-gray-500 text-[11px]">
            <p>© {new Date().getFullYear()} VisionFlix Support Systems. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Security Standards</span>
              <span>•</span>
              <span>Provider Adapter Ready</span>
              <span>•</span>
              <span>RLS Protected</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
