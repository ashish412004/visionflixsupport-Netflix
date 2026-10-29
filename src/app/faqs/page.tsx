'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Shield, Tv, Lock } from 'lucide-react';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import Link from 'next/link';

interface StaticFaq {
  category: string;
  question: string;
  answer: string;
}

const STATIC_FAQS: StaticFaq[] = [
  {
    category: 'TV Activation',
    question: 'How do I locate the 8-character activation code on my TV?',
    answer:
      'Launch the Netflix application on your Smart TV, streaming media player (Apple TV, Fire TV, Roku), or gaming console. Select "Sign In". If your device prompts for web activation, an 8-character alphanumeric code will appear on your TV screen.',
  },
  {
    category: 'TV Activation',
    question: 'Why does VisionFlix display "Direct Netflix activation is not available"?',
    answer:
      'Direct third-party activation requires an officially authorized provider API integration. To protect your streaming security and adhere to strict consumer protection standards, VisionFlix logs your device code for administrative tracking and directs you to complete activation directly on Netflix\'s official portal at netflix.com/activate without compromising your credentials.',
  },
  {
    category: 'Household Access',
    question: 'Why am I seeing "This TV isn\'t part of your Netflix Household"?',
    answer:
      'Netflix defines a household based on the primary broadband internet connection. If your TV connects via a different Wi-Fi network, cellular hotspot, or secondary router node, Netflix flags the IP discrepancy and requests confirmation.',
  },
  {
    category: 'Household Access',
    question: 'Does VisionFlix ever request my Netflix password or OTP verification code?',
    answer:
      'NEVER. VisionFlix operates under a strict Zero-Credential Policy. We will never ask for your Netflix account password, one-time verification SMS OTP, or email confirmation links. Any service soliciting streaming passwords is unauthorized.',
  },
  {
    category: 'Device Management',
    question: 'What are "Device Allocations" in my VisionFlix portal?',
    answer:
      'Device allocations are VisionFlix administrative record limits used by support technicians to track hardware in your household that has received concierge assistance. They do not represent, enforce, or override Netflix\'s internal concurrent stream restrictions.',
  },
];

export default function FaqsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'TV Activation', 'Household Access', 'Device Management'];

  const filtered = STATIC_FAQS.filter((f) => {
    if (selectedCategory !== 'ALL' && f.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-netflixRed/10 border border-netflixRed/20 text-netflixRed text-xs font-semibold uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base & Guidance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
          Answers regarding TV code entry, Netflix household network rules, and VisionFlix administrative support.
        </p>
      </div>

      <DisclaimerBanner />

      {/* SEARCH & CATEGORY SELECTOR */}
      <div className="my-8 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search FAQs (e.g. household, activation code, password)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-visionDark-900 border border-visionDark-700 text-white text-xs sm:text-sm focus:outline-none focus:border-netflixRed"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-netflixRed text-white shadow-glow-red'
                  : 'bg-visionDark-900 text-gray-400 hover:text-white border border-visionDark-800'
              }`}
            >
              {cat === 'ALL' ? 'All Topics' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQS ACCORDION */}
      <div className="space-y-3">
        {filtered.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-visionDark-900 border border-visionDark-800 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-visionDark-850/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-visionDark-800 text-netflixRed border border-netflixRed/20">
                    {item.category}
                  </span>
                  <span className="font-bold text-sm sm:text-base text-white">
                    {item.question}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-visionDark-800/80 bg-visionDark-950/40">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER CTA */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-visionDark-900 to-visionDark-850 border border-visionDark-800 text-center">
        <h3 className="text-base font-bold text-white mb-1">Still experiencing household issues?</h3>
        <p className="text-xs text-gray-400 mb-4">Our specialists can assist with network configuration guidance.</p>
        <Link
          href="/household"
          className="inline-block px-5 py-2.5 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red"
        >
          View Household Diagnostic Guide
        </Link>
      </div>

    </div>
  );
}
