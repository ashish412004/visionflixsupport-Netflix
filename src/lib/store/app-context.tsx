'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  UserProfile,
  NetflixAccount,
  PersonalDevice,
  TvActivation,
  HouseholdVerification,
  AuditLogItem,
  GmailNotificationMessage,
  GmailIntegrationInfo,
  HouseholdIssueType,
} from '@/types';
import * as db from '@/lib/supabase/database';

interface AppContextType {
  currentUser: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;

  // Personal Netflix Records (from Supabase)
  netflixAccounts: NetflixAccount[];
  personalDevices: PersonalDevice[];
  tvActivations: TvActivation[];
  householdVerifications: HouseholdVerification[];
  auditLogs: AuditLogItem[];

  // Gmail Notification Integration
  gmailStatus: GmailIntegrationInfo | null;
  gmailMessages: GmailNotificationMessage[];
  isLoadingGmail: boolean;
  refreshGmailMessages: () => Promise<void>;
  disconnectGmail: () => Promise<boolean>;

  // Auth Operations
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Netflix Accounts
  addAccount: (
    account: Omit<NetflixAccount, 'id' | 'created_at' | 'updated_at' | 'devices'>
  ) => Promise<{ success: boolean; account?: NetflixAccount; error?: string }>;
  editAccount: (id: string, updates: Partial<NetflixAccount>) => Promise<boolean>;
  removeAccount: (id: string) => Promise<boolean>;

  // Personal Devices
  addDevice: (
    device: Omit<PersonalDevice, 'id' | 'created_at' | 'updated_at' | 'netflix_account'>
  ) => Promise<{ success: boolean; device?: PersonalDevice; error?: string }>;
  editDevice: (id: string, updates: Partial<PersonalDevice>) => Promise<boolean>;
  removeDevice: (id: string) => Promise<boolean>;

  // TV Activation
  submitTvCode: (
    tvCode: string,
    deviceName: string,
    netflixAccountId?: string,
    notes?: string
  ) => Promise<{ success: boolean; activation?: TvActivation; trackingNumber: string; error?: string }>;
  markDeviceActivated: (id: string) => Promise<boolean>;

  // Household Management
  submitHouseholdIssue: (
    deviceName: string,
    issueType: HouseholdIssueType,
    netflixAccountId?: string,
    notes?: string
  ) => Promise<{ success: boolean; verification?: HouseholdVerification; trackingNumber: string; error?: string }>;
  markHouseholdSolved: (id: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Live Records
  const [netflixAccounts, setNetflixAccounts] = useState<NetflixAccount[]>([]);
  const [personalDevices, setPersonalDevices] = useState<PersonalDevice[]>([]);
  const [tvActivations, setTvActivations] = useState<TvActivation[]>([]);
  const [householdVerifications, setHouseholdVerifications] = useState<HouseholdVerification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Gmail State
  const [gmailStatus, setGmailStatus] = useState<GmailIntegrationInfo | null>(null);
  const [gmailMessages, setGmailMessages] = useState<GmailNotificationMessage[]>([]);
  const [isLoadingGmail, setIsLoadingGmail] = useState(false);

  const isAdmin = useMemo(() => {
    return Boolean(
      currentUser &&
      currentUser.email?.toLowerCase() === 'hhshukla241099@gmail.com' &&
      (currentUser.role === 'admin' || currentUser.role === 'super_admin')
    );
  }, [currentUser]);

  // Refresh live records from Supabase
  const refreshData = useCallback(async () => {
    try {
      const supabase = createClient();
      if (!supabase) return;

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const profile = await db.fetchProfile(user.id);
        setCurrentUser(profile);

        const accounts = await db.fetchNetflixAccounts();
        setNetflixAccounts(accounts);

        const devices = await db.fetchPersonalDevices();
        setPersonalDevices(devices);

        const activations = await db.fetchTvActivations();
        setTvActivations(activations);

        const household = await db.fetchHouseholdVerifications();
        setHouseholdVerifications(household);

        const logs = await db.fetchAuditLogs();
        setAuditLogs(logs);
      } else {
        setCurrentUser(null);
        setNetflixAccounts([]);
        setPersonalDevices([]);
        setTvActivations([]);
        setHouseholdVerifications([]);
      }
    } catch (err) {
      console.error('Error refreshing data from Supabase:', err);
    }
  }, []);

  // Fetch Gmail status and messages
  const refreshGmailMessages = useCallback(async () => {
    setIsLoadingGmail(true);
    try {
      // 1. Check status
      const statusRes = await fetch('/api/gmail/status');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setGmailStatus(statusData);

        // 2. If connected, fetch messages
        if (statusData.isConnected) {
          const msgRes = await fetch('/api/gmail/messages');
          if (msgRes.ok) {
            const msgData = await msgRes.json();
            setGmailMessages(msgData.messages || []);
          }
        } else {
          setGmailMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed refreshing Gmail notifications:', err);
    } finally {
      setIsLoadingGmail(false);
    }
  }, []);

  // Disconnect Gmail
  const disconnectGmail = async () => {
    try {
      const res = await fetch('/api/gmail/disconnect', { method: 'POST' });
      if (res.ok) {
        setGmailStatus({ isConnected: false });
        setGmailMessages([]);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Initial Auth & Load
  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function initAuth() {
      try {
        if (!supabase) {
          setIsLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user && mounted) {
          const profile = await db.fetchProfile(user.id);
          setCurrentUser(profile);
        }
      } catch (err) {
        console.error('initAuth error:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
          refreshData();
          refreshGmailMessages();
        }
      }
    }

    initAuth();

    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await db.fetchProfile(session.user.id);
          if (mounted) setCurrentUser(profile);
        } else {
          if (mounted) {
            setCurrentUser(null);
            setNetflixAccounts([]);
            setPersonalDevices([]);
            setTvActivations([]);
            setHouseholdVerifications([]);
          }
        }
        refreshData();
        refreshGmailMessages();
      });

      return () => {
        mounted = false;
        authListener.subscription.unsubscribe();
      };
    }
  }, [refreshData, refreshGmailMessages]);

  // Auth Operations
  const login = async (email: string, password: string) => {
    const supabase = createClient();
    if (!supabase) {
      return { success: false, error: 'Supabase client is not configured with environment keys.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await db.fetchProfile(data.user.id);
        if (profile?.status === 'SUSPENDED') {
          await supabase.auth.signOut();
          return { 
            success: false, 
            error: 'Your account has been suspended by the administrator. Please contact support.' 
          };
        }
        setCurrentUser(profile);
        await refreshData();
        await refreshGmailMessages();
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      return { success: false, error: msg };
    }
  };

  const register = async () => {
    return {
      success: false,
      error: 'Public customer registration is disabled. Accounts must be provisioned by the administrator.',
    };
  };

  const logout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setNetflixAccounts([]);
    setPersonalDevices([]);
    setTvActivations([]);
    setHouseholdVerifications([]);
  };

  // Netflix Account Operations
  const addAccount = async (
    account: Omit<NetflixAccount, 'id' | 'created_at' | 'updated_at' | 'devices'>
  ) => {
    const created = await db.insertNetflixAccount(account);
    if (created) {
      await db.insertAuditLog(
        currentUser?.id,
        'NETFLIX_ACCOUNT_ADDED',
        'NETFLIX_ACCOUNT',
        created.id,
        { email: created.account_email, nickname: created.account_nickname }
      );
      await refreshData();
      return { success: true, account: created };
    }
    return { success: false, error: 'Failed to save Netflix account record.' };
  };

  const editAccount = async (id: string, updates: Partial<NetflixAccount>) => {
    const ok = await db.updateNetflixAccount(id, updates);
    if (ok) {
      await db.insertAuditLog(
        currentUser?.id,
        'NETFLIX_ACCOUNT_UPDATED',
        'NETFLIX_ACCOUNT',
        id,
        updates as Record<string, unknown>
      );
      await refreshData();
    }
    return ok;
  };

  const removeAccount = async (id: string) => {
    const ok = await db.deleteNetflixAccount(id);
    if (ok) {
      await db.insertAuditLog(currentUser?.id, 'NETFLIX_ACCOUNT_DELETED', 'NETFLIX_ACCOUNT', id);
      await refreshData();
    }
    return ok;
  };

  // Personal Device Operations
  const addDevice = async (
    device: Omit<PersonalDevice, 'id' | 'created_at' | 'updated_at' | 'netflix_account'>
  ) => {
    const created = await db.insertPersonalDevice(device);
    if (created) {
      await db.insertAuditLog(
        currentUser?.id,
        'PERSONAL_DEVICE_REGISTERED',
        'PERSONAL_DEVICE',
        created.id,
        { deviceName: created.device_name, type: created.device_type }
      );
      await refreshData();
      return { success: true, device: created };
    }
    return { success: false, error: 'Failed to record personal device.' };
  };

  const editDevice = async (id: string, updates: Partial<PersonalDevice>) => {
    const ok = await db.updatePersonalDevice(id, updates);
    if (ok) {
      await db.insertAuditLog(currentUser?.id, 'PERSONAL_DEVICE_UPDATED', 'PERSONAL_DEVICE', id, updates as Record<string, unknown>);
      await refreshData();
    }
    return ok;
  };

  const removeDevice = async (id: string) => {
    const ok = await db.deletePersonalDevice(id);
    if (ok) {
      await db.insertAuditLog(currentUser?.id, 'PERSONAL_DEVICE_DELETED', 'PERSONAL_DEVICE', id);
      await refreshData();
    }
    return ok;
  };

  // TV Activation Operations
  const submitTvCode = async (
    tvCode: string,
    deviceName: string,
    netflixAccountId?: string,
    notes?: string
  ) => {
    const cleanCode = tvCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const trackingNumber = `VF-TV-${Math.floor(10000 + Math.random() * 90000)}`;

    const created = await db.insertTvActivation({
      tracking_number: trackingNumber,
      netflix_account_id: netflixAccountId || undefined,
      device_name: deviceName,
      tv_code: cleanCode,
      status: 'PENDING_OFFICIAL_SIGNIN',
      notes,
    });

    if (created) {
      await db.insertAuditLog(
        currentUser?.id,
        'TV_CODE_LOGGED',
        'TV_ACTIVATION',
        created.id,
        { trackingNumber, code: cleanCode, deviceName }
      );
      await refreshData();
      return { success: true, activation: created, trackingNumber };
    }
    return { success: false, trackingNumber, error: 'Failed to record TV activation.' };
  };

  const markDeviceActivated = async (id: string) => {
    const ok = await db.markTvActivated(id);
    if (ok) {
      await db.insertAuditLog(currentUser?.id, 'TV_ACTIVATION_MARKED_COMPLETED', 'TV_ACTIVATION', id);
      await refreshData();
    }
    return ok;
  };

  // Household Verification Operations
  const submitHouseholdIssue = async (
    deviceName: string,
    issueType: HouseholdIssueType,
    netflixAccountId?: string,
    notes?: string
  ) => {
    const trackingNumber = `VF-HSD-${Math.floor(10000 + Math.random() * 90000)}`;

    const created = await db.insertHouseholdVerification({
      tracking_number: trackingNumber,
      netflix_account_id: netflixAccountId || undefined,
      device_name: deviceName,
      issue_type: issueType,
      status: 'PENDING',
      notes,
    });

    if (created) {
      await db.insertAuditLog(
        currentUser?.id,
        'HOUSEHOLD_VERIFICATION_LOGGED',
        'HOUSEHOLD_VERIFICATION',
        created.id,
        { trackingNumber, deviceName, issueType }
      );
      await refreshData();
      return { success: true, verification: created, trackingNumber };
    }
    return { success: false, trackingNumber, error: 'Failed to log household verification issue.' };
  };

  const markHouseholdSolved = async (id: string) => {
    const ok = await db.markHouseholdVerified(id);
    if (ok) {
      await db.insertAuditLog(currentUser?.id, 'HOUSEHOLD_MARKED_VERIFIED', 'HOUSEHOLD_VERIFICATION', id);
      await refreshData();
    }
    return ok;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAdmin,
        isLoading,
        netflixAccounts,
        personalDevices,
        tvActivations,
        householdVerifications,
        auditLogs,
        gmailStatus,
        gmailMessages,
        isLoadingGmail,
        refreshGmailMessages,
        disconnectGmail,
        login,
        register,
        logout,
        refreshData,
        addAccount,
        editAccount,
        removeAccount,
        addDevice,
        editDevice,
        removeDevice,
        submitTvCode,
        markDeviceActivated,
        submitHouseholdIssue,
        markHouseholdSolved,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
