'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Tv, 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2, 
  Eye, 
  EyeOff, 
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setError('Please enter your Customer ID or Email and account password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await login(cleanId, password);
      if (res.success) {
        // Check if admin user logged in via regular login page
        if (cleanId.toLowerCase() === 'hhshukla241099@gmail.com') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(res.error || 'Invalid Customer ID/Email or password. Please verify credentials with your administrator.');
      }
    } catch {
      setError('An unexpected error occurred during sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
      
      {/* Brand Header */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="w-11 h-11 rounded-xl bg-netflixRed flex items-center justify-center shadow-glow-red transition-transform group-hover:scale-105">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex flex-col">
            <span className="text-xl font-black tracking-wider text-white">
              VISION<span className="text-netflixRed">FLIX</span>
            </span>
            <span className="text-[10px] tracking-widest font-semibold text-gray-400 uppercase -mt-1">
              Netflix Support
            </span>
          </div>
        </Link>
        <h2 className="text-lg font-bold text-white mt-1">Welcome Back</h2>
        <p className="text-xs text-gray-400">
          Sign in to access your streaming concierge & hardware allocations
        </p>
      </div>

      <DisclaimerBanner compact />

      {/* Main Customer Login Card */}
      <div className="bg-visionDark-900 border border-visionDark-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl mt-4">
        
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Customer ID / Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Customer ID / Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="customer@example.com or ID"
                autoComplete="username email"
                autoCapitalize="none"
                spellCheck="false"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:border-netflixRed transition-colors"
                required
              />
            </div>
          </div>

          {/* Password with Show/Hide Control */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-gray-400 hover:text-netflixRed transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:border-netflixRed transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-gray-200 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs animate-in fade-in">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white font-bold text-xs sm:text-sm transition-all shadow-glow-red flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>LOGIN</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Administrator Provisioning Notice (Replaces Sign Up Link) */}
        <div className="mt-6 pt-5 border-t border-visionDark-800/80 text-center">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Customer access is managed exclusively by our administrator.
            <br />
            Accounts and device allocations are provisioned privately.
          </p>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-visionDark-900 border border-visionDark-700 rounded-2xl max-w-sm w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-netflixRed/15 text-netflixRed flex items-center justify-center mb-3">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Password Assistance</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Because VisionFlix operates as a private concierge service, password resets are processed directly by your administrator to protect account security.
            </p>
            <div className="p-3 rounded-xl bg-visionDark-850 border border-visionDark-700 text-xs text-gray-300 space-y-1 mb-5">
              <p className="font-semibold text-white">How to reset:</p>
              <p>Contact your VisionFlix support administrator to request a secure temporary password reset code.</p>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-visionDark-800 hover:bg-visionDark-700 text-white text-xs font-semibold border border-visionDark-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
