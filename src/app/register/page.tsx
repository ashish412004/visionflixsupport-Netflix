'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tv, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await register(fullName, email, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch {
      setError('An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-netflixRed flex items-center justify-center mx-auto mb-3 shadow-glow-red">
          <Tv className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-wider">
          VISION<span className="text-netflixRed">FLIX</span>
        </h1>
        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold -mt-0.5">
          New Customer Portal Registration
        </p>
      </div>

      <DisclaimerBanner compact />

      <div className="bg-visionDark-900 border border-visionDark-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl mt-4">
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alexander Wright"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs sm:text-sm focus:outline-none focus:border-netflixRed"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs sm:text-sm focus:outline-none focus:border-netflixRed"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Choose a Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs sm:text-sm focus:outline-none focus:border-netflixRed"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white font-bold text-xs sm:text-sm transition-all shadow-glow-red flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-netflixRed hover:underline font-semibold">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
