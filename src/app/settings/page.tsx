'use client';

import React, { useState } from 'react';
import { 
  Tv, 
  Plus, 
  Trash2, 
  HardDrive, 
  HelpCircle,
  X,
  CheckCircle2,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import Link from 'next/link';

const DEVICE_TYPES = [
  'Samsung Smart TV (Tizen OS)',
  'LG Smart TV (webOS)',
  'Apple TV 4K',
  'Amazon Fire TV Stick / Cube',
  'Sony / Google TV (Android TV)',
  'Roku Streaming Stick / Ultra',
  'PlayStation 5 / Xbox Series X',
  'iPhone / iPad',
  'Android Smartphone / Tablet',
  'Mac / Windows Browser',
  'Other Smart Device'
];

export default function SettingsPage() {
  const { 
    currentUser, 
    personalDevices, 
    netflixAccounts,
    addDevice, 
    removeDevice 
  } = useApp();
  
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('Samsung Smart TV (Tizen OS)');
  const [householdNetwork, setHouseholdNetwork] = useState('Home Wi-Fi 5GHz');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) {
      setError('Please provide a descriptive device name.');
      return;
    }
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const res = await addDevice({
        device_name: deviceName.trim(),
        device_type: deviceType,
        household_network: householdNetwork.trim() || undefined,
        netflix_account_id: selectedAccountId || undefined,
        status: 'ACTIVE',
        notes: notes.trim() || undefined
      });

      if (res.success) {
        setSuccess(`Device "${deviceName}" successfully registered.`);
        setDeviceName('');
        setHouseholdNetwork('Home Wi-Fi 5GHz');
        setNotes('');
        setIsAdding(false);
      } else {
        setError(res.error || 'Failed to register device.');
      }
    } catch {
      setError('An unexpected error occurred while adding device.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (confirm(`Remove personal device "${name}" from your registered hardware list?`)) {
      await removeDevice(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-netflixRed">Hardware Registry</span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
          Personal Device Registry
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage personal TVs, streaming boxes, and mobile hardware authorized on your Netflix accounts.
        </p>
      </div>

      <DisclaimerBanner />

      {/* CLARIFICATION ALERT ON ZERO CREDENTIALS */}
      <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-4 sm:p-5 mb-8 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-visionDark-800 text-netflixRed shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-gray-300 leading-relaxed">
          <h4 className="font-bold text-white mb-0.5">Personal Device Architecture</h4>
          <p className="text-gray-400 text-[11px]">
            This registry tracks your own family and household devices. VisionFlix does not store or transmit Netflix passwords. Activations for these devices are completed directly through official Netflix activation screens.
          </p>
        </div>
      </div>

      {/* REGISTERED DEVICES CARD */}
      <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-visionDark-800">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Registered Devices</h3>
            <p className="text-xl font-bold text-white mt-1">{personalDevices.length} Hardware Records</p>
          </div>

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2.5 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Register Personal Device
            </button>
          )}
        </div>

        {/* FEEDBACK NOTICES */}
        {error && (
          <div className="p-3 my-4 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 my-4 rounded-xl bg-green-950/40 border border-green-800/60 text-xs text-green-300">
            {success}
          </div>
        )}

        {/* ADD DEVICE FORM */}
        {isAdding && (
          <form onSubmit={handleAddDevice} className="p-5 my-6 rounded-xl bg-visionDark-850 border border-visionDark-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-netflixRed" />
                Register New Personal Device
              </h4>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Device Name / Nickname *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Living Room Samsung TV"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-900 border border-visionDark-700 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-netflixRed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Hardware Type
                </label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-900 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
                >
                  {DEVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Household Network
                </label>
                <input
                  type="text"
                  placeholder="e.g. Home Wi-Fi 5GHz, Vacation House"
                  value={householdNetwork}
                  onChange={(e) => setHouseholdNetwork(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-900 border border-visionDark-700 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-netflixRed"
                />
              </div>

              {netflixAccounts.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Assign to Netflix Account
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-900 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
                  >
                    <option value="">-- Unassigned / Any Account --</option>
                    {netflixAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_nickname ? `${acc.account_nickname} (${acc.account_email})` : acc.account_email}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Setup details, location or TV model..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-900 border border-visionDark-700 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-netflixRed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-lg bg-visionDark-800 text-gray-300 text-xs font-semibold hover:bg-visionDark-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Registering...' : 'Save Device'}
              </button>
            </div>
          </form>
        )}

        {/* DEVICE LIST */}
        <div className="mt-6">
          {personalDevices.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-visionDark-850/60 border border-visionDark-800">
              <HardDrive className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-medium">No personal devices registered yet.</p>
              <button
                onClick={() => setIsAdding(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-netflixRed hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Register Your First Device
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {personalDevices.map((dev) => (
                <div
                  key={dev.id}
                  className="p-4 rounded-xl bg-visionDark-850 border border-visionDark-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{dev.device_name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dev.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {dev.status}
                      </span>
                    </div>
                    <p className="text-gray-400">{dev.device_type}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                      {dev.household_network && <span>Network: {dev.household_network}</span>}
                      {dev.netflix_account && (
                        <span className="text-netflixRed">Linked: {dev.netflix_account.account_nickname || dev.netflix_account.account_email}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href="/tv-activation"
                      className="px-3 py-1.5 rounded-lg bg-visionDark-800 hover:bg-visionDark-700 text-white text-xs font-medium border border-visionDark-700 flex items-center gap-1"
                    >
                      <Tv className="w-3.5 h-3.5 text-netflixRed" />
                      Activate
                    </Link>
                    <button
                      onClick={() => handleRemove(dev.id, dev.device_name)}
                      className="p-2 rounded-lg bg-visionDark-800 hover:bg-red-950/60 text-gray-400 hover:text-red-400 border border-visionDark-700 transition-colors"
                      title="Remove device"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}