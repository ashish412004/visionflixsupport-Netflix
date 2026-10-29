'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2, 
  Eye, 
  EyeOff,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

const AUTHORIZED_ADMIN_EMAIL = 'hhshukla241099@gmail.com';

export default function AdminLoginPage() {
  const router = useRouter();
  const { currentUser, isAdmin, login, isLoading: isAuthLoading } = useApp();

  const [email, setEmail] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // If already authenticated as administrator, redirect to /admin/dashboard
  useEffect(() => {
    if (!isAuthLoading && currentUser && isAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [currentUser, isAdmin, isAuthLoading, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setError('Too many failed administrative login attempts. Please wait 60 seconds.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      setError(`Access Denied: Only the designated administrator (${AUTHORIZED_ADMIN_EMAIL}) is permitted.`);
      setAttempts((prev) => prev + 1);
      return;
    }

    if (!password) {
      setError('Please enter your administrator password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await login(cleanEmail, password);
      if (res.success) {
        router.push('/admin/dashboard');
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setIsLocked(true);
          setTimeout(() => {
            setIsLocked(false);
            setAttempts(0);
          }, 60000);
          setError('Maximum login attempts exceeded. Terminal temporarily locked for 60 seconds.');
        } else {
          setError(res.error || 'Invalid administrator password. Access denied.');
        }
      }
    } catch {
      setError('Authentication server error. Please check Supabase connectivity.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        
        {/* Admin Gateway Badge */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-netflixRed/15 border border-netflixRed/40 text-netflixRed flex items-center justify-center mx-auto mb-3 shadow-glow-red">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800 text-[10px] font-bold tracking-widest uppercase text-red-300 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Restricted Gateway</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">
            VISION<span className="text-netflixRed">FLIX</span> ADMIN
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Private Administrator Authentication Console
          </p>
        </div>

        <DisclaimerBanner compact />

        {/* Login Box */}
        <div className="bg-visionDark-900 border border-visionDark-700/90 rounded-2xl p-6 sm:p-8 shadow-2xl mt-4 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-netflixRed/10 rounded-full blur-2xl pointer-events-none" />

          <form onSubmit={handleAdminLogin} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Authorized Administrator Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@visionflix.com"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs sm:text-sm focus:outline-none focus:border-netflixRed transition-colors"
                  required
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Sole authorized admin: <span className="text-gray-300 font-mono">{AUTHORIZED_ADMIN_EMAIL}</span>
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Admin Master Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  autoComplete="current-password"
                  disabled={isLocked}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs sm:text-sm focus:outline-none focus:border-netflixRed transition-colors disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-200 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full py-3 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white font-bold text-xs sm:text-sm transition-all shadow-glow-red flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Administrator Token...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>AUTHORIZE ADMIN ACCESS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Audit Notice */}
          <div className="mt-6 pt-4 border-t border-visionDark-800/80 text-center">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Security notice: All administrative actions and login attempts are cryptographically verified and recorded in the audit registry.
            </p>
          </div>

        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Customer Portal
          </Link>
        </div>

      </div>
    </div>
  );
}
