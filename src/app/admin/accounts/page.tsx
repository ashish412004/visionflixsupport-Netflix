'use client';

import React, { useState } from 'react';
import { 
  Tv, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  X, 
  Mail, 
  HardDrive, 
  Layers, 
  CheckCircle2, 
  Lock,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { NetflixAccount } from '@/types';
import { GmailNotificationInbox } from '@/components/gmail/GmailNotificationInbox';

export default function AdminAccountsPage() {
  const { 
    netflixAccounts, 
    personalDevices,
    addAccount, 
    editAccount, 
    removeAccount,
    addDevice
  } = useApp();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<NetflixAccount | null>(null);
  const [addingDeviceForAccount, setAddingDeviceForAccount] = useState<NetflixAccount | null>(null);

  // Form state
  const [formEmail, setFormEmail] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formInbox, setFormInbox] = useState('');
  const [formPlan, setFormPlan] = useState('Premium 4K Ultra HD');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'ON_HOLD' | 'INACTIVE'>('ACTIVE');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Device form state
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('Samsung Smart TV (Tizen OS)');
  const [newDeviceNetwork, setNewDeviceNetwork] = useState('Home Fiber Wi-Fi');

  const filteredAccounts = netflixAccounts.filter((acc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      acc.account_email.toLowerCase().includes(q) ||
      acc.account_nickname.toLowerCase().includes(q) ||
      acc.registered_email_inbox.toLowerCase().includes(q) ||
      (acc.notes && acc.notes.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setFormEmail('');
    setFormNickname('');
    setFormInbox('');
    setFormPlan('Premium 4K Ultra HD');
    setFormStatus('ACTIVE');
    setFormNotes('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (acc: NetflixAccount) => {
    setEditingAccount(acc);
    setFormEmail(acc.account_email);
    setFormNickname(acc.account_nickname);
    setFormInbox(acc.registered_email_inbox);
    setFormPlan(acc.subscription_plan);
    setFormStatus(acc.account_status);
    setFormNotes(acc.notes || '');
    setFormError('');
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formNickname.trim() || !formInbox.trim()) {
      setFormError('Account email, nickname, and registered email inbox are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingAccount) {
        await editAccount(editingAccount.id, {
          account_email: formEmail.trim(),
          account_nickname: formNickname.trim(),
          registered_email_inbox: formInbox.trim(),
          subscription_plan: formPlan,
          account_status: formStatus,
          notes: formNotes,
        });
        setEditingAccount(null);
      } else {
        const res = await addAccount({
          account_email: formEmail.trim(),
          account_nickname: formNickname.trim(),
          registered_email_inbox: formInbox.trim(),
          subscription_plan: formPlan,
          account_status: formStatus,
          notes: formNotes,
        });
        if (!res.success) {
          setFormError(res.error || 'Failed to save account record.');
          return;
        }
        setIsAddModalOpen(false);
      }
    } catch {
      setFormError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove personal account record "${name}"?`)) {
      await removeAccount(id);
    }
  };

  const handleAddDeviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingDeviceForAccount || !newDeviceName.trim()) return;

    setIsSubmitting(true);
    try {
      await addDevice({
        netflix_account_id: addingDeviceForAccount.id,
        device_name: newDeviceName.trim(),
        device_type: newDeviceType,
        status: 'ACTIVE',
        household_network: newDeviceNetwork,
      });
      setAddingDeviceForAccount(null);
      setNewDeviceName('');
    } catch {
      // error handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-netflixRed">Private Admin Account Manager</span>
          <h1 className="text-2xl font-black text-white mt-1">Personal Netflix Accounts</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your personal Netflix accounts, registered inboxes, subscription tiers, and device allocations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Netflix Account
        </button>
      </div>

      {/* Gmail Inbox Integration Widget */}
      <GmailNotificationInbox />

      {/* Search and Filters */}
      <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by account nickname, email, or inbox..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
          />
        </div>
      </div>

      {/* ACCOUNTS LIST */}
      {filteredAccounts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <Tv className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No accounts added yet.</h3>
          <p className="text-xs text-gray-400 mb-6 max-w-sm mx-auto">
            Add your personal Netflix account email and nickname to begin tracking device allocations and linked email notifications.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-netflixRed text-white text-xs font-bold shadow-glow-red inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Netflix Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAccounts.map((acc) => {
            const devices = personalDevices.filter((d) => d.netflix_account_id === acc.id);

            return (
              <div
                key={acc.id}
                className="p-5 sm:p-6 rounded-2xl bg-visionDark-900 border border-visionDark-800 hover:border-visionDark-700 transition-all shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-visionDark-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <Tv className="w-5 h-5 text-netflixRed" />
                        {acc.account_nickname}
                      </h3>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        acc.account_status === 'ACTIVE'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : acc.account_status === 'ON_HOLD'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {acc.account_status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      Account Email: <strong className="text-white font-mono">{acc.account_email}</strong> • Plan: <strong className="text-gray-200">{acc.subscription_plan}</strong>
                    </p>
                    <p className="text-xs text-gray-400">
                      Registered Inbox: <strong className="text-netflixRed">{acc.registered_email_inbox}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setAddingDeviceForAccount(acc)}
                      className="px-3 py-1.5 rounded-xl bg-visionDark-850 hover:bg-visionDark-800 text-gray-200 hover:text-white text-xs font-semibold border border-visionDark-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-netflixRed" />
                      Add Device
                    </button>

                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-2 rounded-xl bg-visionDark-850 hover:bg-visionDark-800 text-gray-300 hover:text-white border border-visionDark-700 transition-colors"
                      title="Edit Account Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(acc.id, acc.account_nickname)}
                      className="p-2 rounded-xl bg-visionDark-850 hover:bg-red-950/60 text-gray-400 hover:text-red-400 border border-visionDark-700 transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {acc.notes && (
                  <p className="text-xs text-gray-400 bg-visionDark-950 p-3 rounded-xl border border-visionDark-800">
                    <strong>Notes:</strong> {acc.notes}
                  </p>
                )}

                {/* Personal Devices Tracked */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                    Personal Device Records ({devices.length})
                  </span>

                  {devices.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No devices registered under this account yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {devices.map((dev) => (
                        <div
                          key={dev.id}
                          className="p-3 rounded-xl bg-visionDark-850 border border-visionDark-750 flex items-start justify-between text-xs"
                        >
                          <div>
                            <p className="font-semibold text-white flex items-center gap-1.5">
                              <Tv className="w-3.5 h-3.5 text-netflixRed" />
                              {dev.device_name}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{dev.device_type}</p>
                            {dev.household_network && (
                              <p className="text-[10px] text-gray-500 mt-0.5">Network: {dev.household_network}</p>
                            )}
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-green-400">
                            {dev.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT ACCOUNT MODAL */}
      {(isAddModalOpen || editingAccount) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-visionDark-900 border border-visionDark-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-visionDark-800 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingAccount ? 'Edit Netflix Account Record' : 'Add Netflix Account'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingAccount(null);
                }}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Netflix Account Email
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. personal.netflix@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white focus:outline-none focus:border-netflixRed"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Account Nickname
                </label>
                <input
                  type="text"
                  value={formNickname}
                  onChange={(e) => setFormNickname(e.target.value)}
                  placeholder="e.g. Living Room 4K Primary"
                  className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white focus:outline-none focus:border-netflixRed"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Registered Email Inbox (for Netflix Notifications)
                </label>
                <input
                  type="email"
                  value={formInbox}
                  onChange={(e) => setFormInbox(e.target.value)}
                  placeholder="e.g. personal.notifications@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white focus:outline-none focus:border-netflixRed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Subscription Plan</label>
                  <select
                    value={formPlan}
                    onChange={(e) => setFormPlan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white focus:outline-none focus:border-netflixRed"
                  >
                    <option value="Standard with Ads">Standard with Ads</option>
                    <option value="Standard HD">Standard HD</option>
                    <option value="Premium 4K Ultra HD">Premium 4K Ultra HD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Account Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white focus:outline-none focus:border-netflixRed"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Account Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Household details or billing cycle notes..."
                  className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white focus:outline-none focus:border-netflixRed resize-none"
                />
              </div>

              {formError && <p className="text-red-400 text-xs">{formError}</p>}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingAccount(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-visionDark-800 text-gray-300 hover:bg-visionDark-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white font-bold shadow-glow-red"
                >
                  {isSubmitting ? 'Saving...' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DEVICE MODAL */}
      {addingDeviceForAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-visionDark-900 border border-visionDark-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-visionDark-800 mb-4">
              <h3 className="text-base font-bold text-white">Add Device to {addingDeviceForAccount.account_nickname}</h3>
              <button onClick={() => setAddingDeviceForAccount(null)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDeviceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Device Name</label>
                <input
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="e.g. Master Bedroom LG OLED"
                  className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white focus:outline-none focus:border-netflixRed"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Device Hardware Type</label>
                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white focus:outline-none focus:border-netflixRed"
                >
                  <option value="Samsung Smart TV (Tizen OS)">Samsung Smart TV (Tizen OS)</option>
                  <option value="LG Smart TV (webOS)">LG Smart TV (webOS)</option>
                  <option value="Sony Bravia (Google TV)">Sony Bravia (Google TV)</option>
                  <option value="Apple TV 4K (tvOS)">Apple TV 4K (tvOS)</option>
                  <option value="Amazon Fire TV Stick 4K">Amazon Fire TV Stick 4K</option>
                  <option value="Roku Streaming Stick / Roku TV">Roku Streaming Stick / Roku TV</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Household Wi-Fi SSID</label>
                <input
                  type="text"
                  value={newDeviceNetwork}
                  onChange={(e) => setNewDeviceNetwork(e.target.value)}
                  placeholder="e.g. Home Wi-Fi 5GHz"
                  className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white focus:outline-none focus:border-netflixRed"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAddingDeviceForAccount(null)}
                  className="px-4 py-2 rounded-xl bg-visionDark-800 text-gray-300 hover:bg-visionDark-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white font-bold shadow-glow-red"
                >
                  {isSubmitting ? 'Adding...' : 'Add Device Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
