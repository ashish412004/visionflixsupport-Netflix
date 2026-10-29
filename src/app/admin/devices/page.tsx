'use client';

import React, { useState } from 'react';
import { 
  HardDrive, 
  Tv, 
  Plus, 
  Trash2, 
  Search, 
  X, 
  CheckCircle2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { PersonalDevice } from '@/types';

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

export default function AdminDevicesAllocationPage() {
  const { 
    personalDevices, 
    netflixAccounts, 
    addDevice, 
    removeDevice 
  } = useApp();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [formDeviceName, setFormDeviceName] = useState('');
  const [formDeviceType, setFormDeviceType] = useState('Samsung Smart TV (Tizen OS)');
  const [formHouseholdNetwork, setFormHouseholdNetwork] = useState('Home Wi-Fi 5GHz');
  const [formAccountId, setFormAccountId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const filteredDevices = personalDevices.filter((dev) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      dev.device_name.toLowerCase().includes(q) ||
      dev.device_type.toLowerCase().includes(q) ||
      (dev.household_network && dev.household_network.toLowerCase().includes(q)) ||
      (dev.netflix_account?.account_nickname && dev.netflix_account.account_nickname.toLowerCase().includes(q)) ||
      (dev.netflix_account?.account_email && dev.netflix_account.account_email.toLowerCase().includes(q))
    );
  });

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDeviceName.trim()) {
      setFormError('Please provide a descriptive device name.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const res = await addDevice({
        device_name: formDeviceName.trim(),
        device_type: formDeviceType,
        household_network: formHouseholdNetwork.trim() || undefined,
        netflix_account_id: formAccountId || undefined,
        status: 'ACTIVE',
        notes: formNotes.trim() || undefined
      });

      if (res.success) {
        setIsAddModalOpen(false);
        setFormDeviceName('');
        setFormHouseholdNetwork('Home Wi-Fi 5GHz');
        setFormNotes('');
      } else {
        setFormError(res.error || 'Failed to record device.');
      }
    } catch {
      setFormError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (confirm(`Remove personal device "${name}" from hardware registry?`)) {
      await removeDevice(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-netflixRed">Hardware Registry</span>
          <h1 className="text-2xl font-black text-white mt-1">Personal Device Registry</h1>
          <p className="text-xs text-gray-400 mt-1">
            Track personal TVs, streaming boxes, and mobile hardware authorized on your Netflix accounts.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Register Hardware Device</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search by device, type, network, or account..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-visionDark-900 border border-visionDark-800 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-netflixRed shadow-subtle-card"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
      </div>

      {/* DEVICES TABLE / GRID */}
      {filteredDevices.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <HardDrive className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">
            {search ? 'No matching hardware devices found' : 'No personal devices registered yet.'}
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
            {search 
              ? `No devices matched "${search}".` 
              : 'Add your smart TVs, streaming sticks, and computers to organize Netflix account authorizations.'}
          </p>
          {!search && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-netflixRed text-white text-xs font-bold"
            >
              Register First Device
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((dev) => (
            <div
              key={dev.id}
              className="p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800 hover:border-visionDark-700 transition-all text-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-sm">{dev.device_name}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{dev.device_type}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  dev.status === 'ACTIVE' 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                  {dev.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-visionDark-850 border border-visionDark-800 space-y-1.5 text-[11px]">
                {dev.household_network && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network:</span>
                    <span className="text-white font-medium">{dev.household_network}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Linked Account:</span>
                  <span className="text-netflixRed font-medium truncate max-w-[150px]">
                    {dev.netflix_account ? (dev.netflix_account.account_nickname || dev.netflix_account.account_email) : 'Unassigned'}
                  </span>
                </div>
              </div>

              {dev.notes && (
                <p className="text-[11px] text-gray-400 italic">
                  &ldquo;{dev.notes}&rdquo;
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-visionDark-800">
                <span className="text-[10px] text-gray-500">
                  Added {new Date(dev.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleRemove(dev.id, dev.device_name)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-visionDark-800 transition-colors"
                  title="Remove device"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD DEVICE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-visionDark-900 border border-visionDark-700 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-netflixRed" />
                Register Hardware Device
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateDevice} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Device Name / Nickname *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom Apple TV"
                  value={formDeviceName}
                  onChange={(e) => setFormDeviceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-netflixRed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Hardware Type
                  </label>
                  <select
                    value={formDeviceType}
                    onChange={(e) => setFormDeviceType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
                  >
                    {DEVICE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
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
                    placeholder="e.g. Home Wi-Fi 5GHz"
                    value={formHouseholdNetwork}
                    onChange={(e) => setFormHouseholdNetwork(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-netflixRed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Linked Netflix Account
                </label>
                <select
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
                >
                  <option value="">-- Unassigned --</option>
                  {netflixAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_nickname ? `${acc.account_nickname} (${acc.account_email})` : acc.account_email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Internal Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes on setup, room, IP or MAC address..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-netflixRed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-visionDark-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-visionDark-800 text-gray-300 text-xs font-semibold hover:bg-visionDark-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}