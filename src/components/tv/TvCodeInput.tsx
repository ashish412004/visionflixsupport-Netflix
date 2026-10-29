'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Tv, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Clock, 
  Copy, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';

interface TvCodeInputProps {
  codeLength?: number;
  onSuccess?: (trackingNumber: string) => void;
}

export function TvCodeInput({ codeLength = 8, onSuccess }: TvCodeInputProps) {
  const { 
    currentUser, 
    netflixAccounts, 
    personalDevices,
    submitTvCode, 
    markDeviceActivated 
  } = useApp();

  const [digits, setDigits] = useState<string[]>(Array(codeLength).fill(''));
  const [deviceName, setDeviceName] = useState('Living Room Smart TV');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedActivation, setLoggedActivation] = useState<{
    id: string;
    trackingNumber: string;
    code: string;
    deviceName: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [isMarkingActivated, setIsMarkingActivated] = useState(false);
  const [activationConfirmed, setActivationConfirmed] = useState(false);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    const char = value.slice(-1).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError(null);

    if (char && index < codeLength - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < codeLength - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData('text')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase();

    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < codeLength; i++) {
      if (pasteData[i]) {
        newDigits[i] = pasteData[i];
      }
    }
    setDigits(newDigits);
    setError(null);

    const focusIndex = Math.min(pasteData.length, codeLength - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  const fullCode = digits.join('');
  const isComplete = fullCode.length === codeLength;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please sign in to log a TV code.');
      return;
    }

    if (!isComplete) {
      setError(`Please enter all ${codeLength} characters displayed on your TV screen.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await submitTvCode(fullCode, deviceName, selectedAccountId || undefined);
      if (res.success && res.activation) {
        setLoggedActivation({
          id: res.activation.id,
          trackingNumber: res.trackingNumber,
          code: fullCode,
          deviceName,
        });
        setActivationConfirmed(false);
        if (onSuccess) onSuccess(res.trackingNumber);
      } else {
        setError(res.error || 'Failed to record TV code.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkActivated = async () => {
    if (!loggedActivation) return;
    setIsMarkingActivated(true);
    const ok = await markDeviceActivated(loggedActivation.id);
    setIsMarkingActivated(false);
    if (ok) {
      setActivationConfirmed(true);
    }
  };

  const copyCode = () => {
    if (!loggedActivation) return;
    navigator.clipboard.writeText(loggedActivation.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loggedActivation) {
    return (
      <div className="bg-visionDark-900 border border-visionDark-700 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-2xl text-center space-y-6">
        
        {activationConfirmed ? (
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto text-green-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-netflixRed/10 border border-netflixRed/30 flex items-center justify-center mx-auto text-netflixRed">
            <Tv className="w-8 h-8" />
          </div>
        )}

        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
            activationConfirmed
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
          }`}>
            {activationConfirmed ? 'Status: Confirmed Activated on TV' : 'Status: Ready for Official Activation'}
          </span>

          <h3 className="text-xl sm:text-2xl font-bold text-white">
            {activationConfirmed ? 'Device Successfully Activated' : 'Complete Official Sign-In on Netflix'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Tracking ID: <span className="font-mono text-gray-200">{loggedActivation.trackingNumber}</span> for <strong className="text-white">{loggedActivation.deviceName}</strong>
          </p>
        </div>

        {/* Display Code Box */}
        <div className="p-4 rounded-xl bg-visionDark-850 border border-visionDark-750 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">TV Activation Code</span>
            <p className="text-2xl font-mono font-black text-white tracking-widest">{loggedActivation.code}</p>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-visionDark-800 hover:bg-visionDark-700 text-gray-200 hover:text-white text-xs font-semibold border border-visionDark-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
        </div>

        {/* Official Activation Buttons */}
        <div className="space-y-3">
          <a
            href="https://www.netflix.com/activate"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-glow-red"
          >
            <span>Open Official Netflix Activation Flow</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {!activationConfirmed && (
            <button
              onClick={handleMarkActivated}
              disabled={isMarkingActivated}
              className="w-full py-3 px-6 rounded-xl bg-visionDark-800 hover:bg-visionDark-750 text-green-400 hover:text-green-300 font-bold text-xs sm:text-sm border border-visionDark-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isMarkingActivated ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>I Have Signed In — Mark Device as Activated</span>
            </button>
          )}
        </div>

        {/* Step-by-Step Instructions */}
        <div className="p-4 rounded-xl bg-visionDark-950 border border-visionDark-800 text-left text-xs text-gray-400 space-y-1.5">
          <p className="font-semibold text-gray-300">How to activate your TV:</p>
          <ol className="list-decimal pl-5 space-y-1 text-[11px] leading-relaxed">
            <li>Click the red button above to launch Netflix&apos;s verified web activation screen in a secure browser tab.</li>
            <li>Sign in to your personal Netflix account.</li>
            <li>Paste your 8-character code (<span className="text-white font-mono">{loggedActivation.code}</span>) and select &quot;Activate&quot;.</li>
            <li>Once your TV displays your Netflix profile, click &quot;Mark Device as Activated&quot; above to update your records.</li>
          </ol>
        </div>

        <button
          onClick={() => {
            setLoggedActivation(null);
            setDigits(Array(codeLength).fill(''));
          }}
          className="text-xs text-gray-400 hover:text-white"
        >
          Enter another TV code
        </button>

      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
      <div className="bg-visionDark-900 border border-visionDark-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-netflixRed/10 text-netflixRed border border-netflixRed/20">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Enter TV Activation Code</h2>
            <p className="text-xs text-gray-400">8-character code shown on your Smart TV display</p>
          </div>
        </div>

        {/* 8-character segmented input */}
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider mb-3">
            Activation Code
          </label>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-2.5" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-full aspect-square text-center text-lg sm:text-2xl font-black font-mono uppercase rounded-xl bg-visionDark-850 border transition-all outline-none ${
                  digit
                    ? 'border-netflixRed text-white shadow-glow-red/20'
                    : 'border-visionDark-700 text-gray-300 hover:border-visionDark-600 focus:border-netflixRed focus:ring-2 focus:ring-netflixRed/30'
                }`}
              />
            ))}
          </div>

          <p className="text-[11px] text-gray-500 mt-2 flex items-center justify-between">
            <span>Alphanumeric letters and numbers</span>
            <span>{fullCode.length} / {codeLength} characters entered</span>
          </p>
        </div>

        {/* Device Name and Linked Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Personal Device Name
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. Living Room Samsung TV"
              className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Netflix Account (Optional)
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
            >
              <option value="">-- Associate with Account --</option>
              {netflixAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_nickname} ({acc.account_email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!isComplete || isLoading}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            isComplete && !isLoading
              ? 'bg-netflixRed hover:bg-netflixRed-hover text-white shadow-glow-red cursor-pointer'
              : 'bg-visionDark-800 text-gray-500 cursor-not-allowed border border-visionDark-700'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Recording TV Code...
            </>
          ) : (
            <>
              Continue to Activation
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-4 border-t border-visionDark-800 flex items-start gap-2 text-[11px] text-gray-400">
          <ShieldCheck className="w-4 h-4 text-netflixRed shrink-0 mt-0.5" />
          <p>
            Official Netflix web activation flow will open securely. VisionFlix never automates sign-ins or solicits your Netflix password.
          </p>
        </div>

      </div>
    </form>
  );
}
