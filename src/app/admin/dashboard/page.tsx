'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Tv, 
  Clock, 
  HardDrive, 
  ShieldCheck, 
  Plus, 
  Search, 
  KeyRound, 
  Edit3, 
  Trash2, 
  UserX, 
  UserCheck, 
  Copy, 
  Check, 
  Loader2, 
  Mail, 
  Calendar, 
  AlertTriangle,
  X,
  RefreshCw,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useApp } from '@/lib/store/app-context';
import { AdminCustomerView } from '@/types';

function generateRandomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let pass = 'VF-';
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export default function AdminDashboardPage() {
  const { 
    netflixAccounts, 
    personalDevices, 
    tvActivations, 
    householdVerifications, 
    gmailStatus 
  } = useApp();

  const [customers, setCustomers] = useState<AdminCustomerView[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [customerError, setCustomerError] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerView | null>(null);

  // Form states for Create
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createPlan, setCreatePlan] = useState('Standard Concierge');
  const [createMaxDevices, setCreateMaxDevices] = useState(2);
  const [createExpiry, setCreateExpiry] = useState('');
  const [createStatus, setCreateStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'PENDING'>('ACTIVE');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    pass: string;
    name: string;
  } | null>(null);

  // Form states for Edit
  const [editName, setEditName] = useState('');
  const [editPlan, setEditPlan] = useState('');
  const [editMaxDevices, setEditMaxDevices] = useState(2);
  const [editExpiry, setEditExpiry] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'PENDING'>('ACTIVE');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Form states for Reset Password
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoadingCustomers(true);
    setCustomerError('');
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        setCustomerError(errData.error || 'Failed to load customers from database.');
      }
    } catch {
      setCustomerError('Network error while connecting to Supabase.');
    } finally {
      setIsLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Open Create Modal
  const openCreateModal = () => {
    setCreateName('');
    setCreateEmail('');
    setCreatePassword(generateRandomPassword());
    setCreatePlan('Standard Concierge');
    setCreateMaxDevices(2);
    // Default expiry 30 days from now
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setCreateExpiry(d.toISOString().split('T')[0]);
    setCreateStatus('ACTIVE');
    setCreateError('');
    setCreatedCredentials(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError('');

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: createName,
          email: createEmail,
          temporaryPassword: createPassword,
          planName: createPlan,
          maxDevices: createMaxDevices,
          expiresAt: createExpiry ? new Date(createExpiry).toISOString() : null,
          status: createStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create customer.');
      } else {
        setCreatedCredentials({
          email: createEmail,
          pass: createPassword,
          name: createName,
        });
        fetchCustomers();
      }
    } catch {
      setCreateError('Network failure creating user in Supabase Auth.');
    } finally {
      setIsCreating(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (c: AdminCustomerView) => {
    setSelectedCustomer(c);
    setEditName(c.full_name);
    setEditPlan(c.plan_name || 'Standard Concierge');
    setEditMaxDevices(c.max_devices || 2);
    setEditExpiry(c.expires_at ? c.expires_at.split('T')[0] : '');
    setEditStatus(c.status);
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setIsSavingEdit(true);
    setEditError('');

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedCustomer.id,
          fullName: editName,
          planName: editPlan,
          maxDevices: editMaxDevices,
          expiresAt: editExpiry ? new Date(editExpiry).toISOString() : null,
          status: editStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setEditError(data.error || 'Failed to update customer details.');
      } else {
        setIsEditModalOpen(false);
        fetchCustomers();
      }
    } catch {
      setEditError('Failed to communicate with database.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Toggle Suspend / Reactivate directly
  const handleToggleStatus = async (c: AdminCustomerView) => {
    const nextStatus = c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/customers/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: c.id, status: nextStatus }),
      });
      if (res.ok) {
        fetchCustomers();
      }
    } catch {
      console.error('Failed toggling status');
    }
  };

  // Open Reset Password Modal
  const openResetModal = (c: AdminCustomerView) => {
    setSelectedCustomer(c);
    setResetPasswordVal(generateRandomPassword());
    setResetSuccess(false);
    setResetError('');
    setIsResetModalOpen(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setIsResetting(true);
    setResetError('');

    try {
      const res = await fetch('/api/admin/customers/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedCustomer.id,
          newPassword: resetPasswordVal,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setResetError(data.error || 'Failed to reset password.');
      } else {
        setResetSuccess(true);
        fetchCustomers();
      }
    } catch {
      setResetError('Network failure resetting password.');
    } finally {
      setIsResetting(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (c: AdminCustomerView) => {
    setSelectedCustomer(c);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/admin/customers?id=${selectedCustomer.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || 'Failed to delete customer.');
      } else {
        setIsDeleteModalOpen(false);
        fetchCustomers();
      }
    } catch {
      setDeleteError('Network error while deleting user.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Filtered customer list
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = 
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingActivations = tvActivations.filter((r) => r.status === 'PENDING_OFFICIAL_SIGNIN');
  const openHousehold = householdVerifications.filter((r) => r.status === 'PENDING');
  const totalOpenRequests = pendingActivations.length + openHousehold.length;

  return (
    <div className="space-y-8">
      
      {/* 1. OVERVIEW METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Total Customers */}
        <div className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Customers</span>
            <Users className="w-4 h-4 text-netflixRed" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mb-1">{customers.length}</p>
          <p className="text-[10px] sm:text-[11px] text-gray-400">Admin-controlled accounts</p>
        </div>

        {/* Metric 2: Streaming Accounts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Netflix Hubs</span>
            <Tv className="w-4 h-4 text-netflixRed" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mb-1">{netflixAccounts.length}</p>
          <p className="text-[10px] sm:text-[11px] text-gray-400">Configured inboxes</p>
        </div>

        {/* Metric 3: Personal Devices */}
        <div className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Hardware Registry</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mb-1">{personalDevices.length}</p>
          <p className="text-[10px] sm:text-[11px] text-gray-400">Allocated Smart TVs</p>
        </div>

        {/* Metric 4: Open Requests */}
        <div className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Open Requests</span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mb-1">{totalOpenRequests}</p>
          <p className="text-[10px] sm:text-[11px] text-yellow-400/90 font-medium">Pending concierge</p>
        </div>

        {/* Metric 5: Gmail Sync */}
        <div className="p-4 sm:p-5 rounded-2xl bg-visionDark-900 border border-visionDark-800 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">Gmail OAuth</span>
            <Mail className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-lg sm:text-xl font-black text-white mb-1 truncate">
            {gmailStatus?.isConnected ? 'Active' : 'Unlinked'}
          </p>
          <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">
            {gmailStatus?.emailAddress || 'Read-only sync'}
          </p>
        </div>

      </div>

      {/* 2. CUSTOMER MANAGEMENT SECTION */}
      <div className="bg-visionDark-900 border border-visionDark-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        
        {/* Header & Create Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-visionDark-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-netflixRed">Administrative Control</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Customer Management
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Create customer IDs, provision temporary credentials, manage plans, and set hardware device allocations.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={fetchCustomers}
              className="p-2.5 rounded-xl bg-visionDark-850 hover:bg-visionDark-800 text-gray-300 hover:text-white border border-visionDark-700 transition-colors"
              title="Refresh Customers"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingCustomers ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openCreateModal}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white font-bold text-xs sm:text-sm transition-all shadow-glow-red cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Customer</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name or email / ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:border-netflixRed transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-visionDark-750 text-white border border-visionDark-600'
                  : 'bg-visionDark-850 text-gray-400 hover:text-white border border-visionDark-700'
              }`}
            >
              All ({customers.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === 'ACTIVE'
                  ? 'bg-green-950/40 text-green-300 border border-green-800'
                  : 'bg-visionDark-850 text-gray-400 hover:text-white border border-visionDark-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('SUSPENDED')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === 'SUSPENDED'
                  ? 'bg-red-950/40 text-red-300 border border-red-800'
                  : 'bg-visionDark-850 text-gray-400 hover:text-white border border-visionDark-700'
              }`}
            >
              Suspended
            </button>
          </div>
        </div>

        {/* Database notice / error */}
        {customerError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs mb-4 flex items-center justify-between">
            <span>{customerError}</span>
            <button onClick={fetchCustomers} className="underline text-xs ml-2 hover:text-white">
              Retry
            </button>
          </div>
        )}

        {/* Customers Table */}
        <div className="overflow-x-auto rounded-xl border border-visionDark-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-visionDark-850 text-gray-400 uppercase text-[10px] tracking-wider border-b border-visionDark-800">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Devices</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-visionDark-800">
              {isLoadingCustomers ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-netflixRed" />
                    <span>Loading customers from Supabase database...</span>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <Users className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <p className="font-semibold text-gray-300">No customer records found</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'Click "+ Create Customer" above to provision the first customer.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const isSuspended = c.status === 'SUSPENDED';
                  const expiryText = c.expires_at 
                    ? new Date(c.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Lifetime / No Expiry';

                  return (
                    <tr key={c.id} className="hover:bg-visionDark-850/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-netflixRed/15 text-netflixRed font-bold flex items-center justify-center text-xs shrink-0">
                            {c.full_name?.charAt(0) || 'C'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{c.full_name}</p>
                            <p className="text-gray-400 text-[11px] truncate font-mono">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-visionDark-800 text-gray-200 border border-visionDark-700">
                          {c.plan_name || 'Standard Concierge'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            SUSPENDED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-950/60 text-green-400 border border-green-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            ACTIVE
                          </span>
                        )}
                        {c.must_change_password && (
                          <span className="block mt-1 text-[9px] text-yellow-400">
                            * Temp Password
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-300 font-mono text-[11px]">
                          <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{c.allocated_devices_count || 0} / {c.max_devices || 2}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-300 font-mono text-[11px]">
                        {expiryText}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg bg-visionDark-800 hover:bg-visionDark-700 text-gray-300 hover:text-white transition-colors"
                            title="Edit Customer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password Button */}
                          <button
                            onClick={() => openResetModal(c)}
                            className="p-1.5 rounded-lg bg-visionDark-800 hover:bg-visionDark-700 text-yellow-400 hover:text-yellow-300 transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend / Reactivate */}
                          <button
                            onClick={() => handleToggleStatus(c)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSuspended 
                                ? 'bg-green-950/40 hover:bg-green-900/60 text-green-400' 
                                : 'bg-red-950/40 hover:bg-red-900/60 text-red-400'
                            }`}
                            title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                          >
                            {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => openDeleteModal(c)}
                            className="p-1.5 rounded-lg bg-visionDark-800 hover:bg-red-950/50 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE CUSTOMER */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-visionDark-900 border border-visionDark-750 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {!createdCredentials ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-netflixRed/15 text-netflixRed flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">+ Create Customer Account</h3>
                    <p className="text-[11px] text-gray-400">Provisions a Supabase Auth user & assigns customer role</p>
                  </div>
                </div>

                <form onSubmit={handleCreateCustomer} className="space-y-4 mt-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Customer Full Name *
                    </label>
                    <input
                      type="text"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs sm:text-sm focus:outline-none focus:border-netflixRed"
                      required
                    />
                  </div>

                  {/* Email / ID */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Customer Email / ID *
                    </label>
                    <input
                      type="email"
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs sm:text-sm focus:outline-none focus:border-netflixRed"
                      required
                    />
                  </div>

                  {/* Temporary Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-gray-300">
                        Temporary Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setCreatePassword(generateRandomPassword())}
                        className="text-[10px] text-netflixRed hover:underline flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw className="w-3 h-3" /> Regenerate
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-netflixRed"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleCopy(createPassword, 'tempPass')}
                        className="absolute right-2 text-gray-400 hover:text-white p-1"
                        title="Copy Password"
                      >
                        {copiedKey === 'tempPass' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Customer will be required to change this upon first login.
                    </p>
                  </div>

                  {/* Plan & Max Devices */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Customer Plan
                      </label>
                      <select
                        value={createPlan}
                        onChange={(e) => {
                          setCreatePlan(e.target.value);
                          if (e.target.value === 'Basic Support') setCreateMaxDevices(1);
                          if (e.target.value === 'Standard Concierge') setCreateMaxDevices(2);
                          if (e.target.value === 'Premium 4K VIP') setCreateMaxDevices(4);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
                      >
                        <option value="Basic Support">Basic Support (1 Device)</option>
                        <option value="Standard Concierge">Standard Concierge (2 Devices)</option>
                        <option value="Premium 4K VIP">Premium 4K VIP (4 Devices)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Device Allocations Limit
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={createMaxDevices}
                        onChange={(e) => setCreateMaxDevices(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
                      />
                    </div>
                  </div>

                  {/* Expiry Date & Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Account Expiry Date
                      </label>
                      <input
                        type="date"
                        value={createExpiry}
                        onChange={(e) => setCreateExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Initial Status
                      </label>
                      <select
                        value={createStatus}
                        onChange={(e) => setCreateStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
                      >
                        <option value="ACTIVE">ACTIVE (Immediate Access)</option>
                        <option value="SUSPENDED">SUSPENDED (Locked)</option>
                      </select>
                    </div>
                  </div>

                  {createError && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                      {createError}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-visionDark-800 text-gray-300 hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-5 py-2 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      <span>Create Account</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success / Share Initial Credentials View */
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/15 border border-green-500/30 text-green-400 flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white text-center">Customer Account Created!</h3>
                <p className="text-xs text-gray-300 text-center">
                  Account provisioned in Supabase Auth. Share these credentials with the customer:
                </p>

                <div className="p-4 rounded-xl bg-visionDark-850 border border-visionDark-700 text-xs space-y-2 font-mono">
                  <div>
                    <span className="text-gray-400">Portal URL: </span>
                    <span className="text-white">https://visionflixsupport-netflix.vercel.app</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Customer Email: </span>
                    <span className="text-green-400 font-bold">{createdCredentials.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Temporary Password: </span>
                    <span className="text-yellow-400 font-bold">{createdCredentials.pass}</span>
                  </div>
                </div>

                {/* Copy Full Credentials String Button */}
                <button
                  onClick={() => {
                    const shareText = `VISIONFLIX LOGIN CREDENTIALS\nPortal: https://visionflixsupport-netflix.vercel.app\nCustomer ID / Email: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.pass}\nNote: You will be asked to update this password upon your first sign in.`;
                    handleCopy(shareText, 'fullCreds');
                  }}
                  className="w-full py-2.5 rounded-xl bg-visionDark-800 hover:bg-visionDark-750 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-visionDark-700 cursor-pointer"
                >
                  {copiedKey === 'fullCreds' ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Login Details for Customer</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT CUSTOMER */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-visionDark-900 border border-visionDark-750 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Edit Customer Details</h3>
            <p className="text-xs text-gray-400 font-mono mb-4">{selectedCustomer.email}</p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs sm:text-sm focus:outline-none focus:border-netflixRed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Plan
                  </label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
                  >
                    <option value="Basic Support">Basic Support</option>
                    <option value="Standard Concierge">Standard Concierge</option>
                    <option value="Premium 4K VIP">Premium 4K VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Device Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editMaxDevices}
                    onChange={(e) => setEditMaxDevices(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={editExpiry}
                    onChange={(e) => setEditExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white text-xs focus:outline-none focus:border-netflixRed"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                  {editError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-visionDark-800 text-gray-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red flex items-center gap-1.5"
                >
                  {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RESET PASSWORD */}
      {/* ========================================================================= */}
      {isResetModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-visionDark-900 border border-visionDark-750 rounded-2xl max-w-sm w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-yellow-500/15 text-yellow-400 flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">Reset Customer Password</h3>
            <p className="text-xs text-gray-400 font-mono mb-4">{selectedCustomer.email}</p>

            {!resetSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-300">
                      New Temporary Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setResetPasswordVal(generateRandomPassword())}
                      className="text-[10px] text-netflixRed hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className="w-3 h-3" /> Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-visionDark-850 border border-visionDark-700 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-netflixRed"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    The user will be required to change this upon next sign in.
                  </p>
                </div>

                {resetError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                    {resetError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-visionDark-800 text-gray-300 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isResetting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <KeyRound className="w-4 h-4" />}
                    <span>Confirm Reset</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-green-950/40 border border-green-800 text-green-300 text-xs">
                  Password updated in Supabase Auth! Provide this new password to the customer:
                </div>
                <div className="p-3 rounded-xl bg-visionDark-850 border border-visionDark-700 font-mono text-sm text-yellow-400 flex items-center justify-between">
                  <span>{resetPasswordVal}</span>
                  <button
                    onClick={() => handleCopy(resetPasswordVal, 'resetPass')}
                    className="p-1 hover:text-white"
                  >
                    {copiedKey === 'resetPass' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-visionDark-800 hover:bg-visionDark-750 text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE CUSTOMER CONFIRMATION */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-visionDark-900 border border-red-900/60 rounded-2xl max-w-sm w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-red-950/60 text-netflixRed flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">Delete Customer Account</h3>
            <p className="text-xs text-gray-300 mb-2">
              Are you sure you want to permanently delete <strong className="text-white font-mono">{selectedCustomer.email}</strong>?
            </p>
            <p className="text-[11px] text-red-400 mb-4">
              This will remove the Supabase Auth user, profile, subscriptions, and device allocations. This action cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs mb-3">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-visionDark-800 text-gray-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-netflixRed hover:bg-netflixRed-hover text-white text-xs font-bold transition-all shadow-glow-red flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Confirm Delete</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
