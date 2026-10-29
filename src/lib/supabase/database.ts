import { createClient } from './client';
import {
  UserProfile,
  NetflixAccount,
  PersonalDevice,
  TvActivation,
  HouseholdVerification,
  AuditLogItem,
  TvActivationStatus,
  HouseholdVerificationStatus,
  HouseholdIssueType,
} from '@/types';

// ============================================================================
// PROFILES & ADMIN ROLES
// ============================================================================

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) return null;

    // Check user_roles table
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    const isAuthorizedAdmin = 
      profile.email?.toLowerCase() === 'hhshukla241099@gmail.com' &&
      (userRole?.role === 'admin' || !userRole);

    return {
      ...profile,
      role: isAuthorizedAdmin ? 'admin' : 'customer',
    };
  } catch (err) {
    console.error('fetchProfile error:', err);
    return null;
  }
}

// ============================================================================
// NETFLIX ACCOUNTS (Personal Netflix Account Records)
// ============================================================================

export async function fetchNetflixAccounts(): Promise<NetflixAccount[]> {
  const supabase = createClient();
  if (!supabase) return [];

  try {
    const { data: accounts, error } = await supabase
      .from('netflix_accounts')
      .select(`
        *,
        devices:personal_devices(*)
      `)
      .order('created_at', { ascending: false });

    if (error || !accounts) return [];
    return accounts as NetflixAccount[];
  } catch (err) {
    console.error('fetchNetflixAccounts error:', err);
    return [];
  }
}

export async function insertNetflixAccount(
  account: Omit<NetflixAccount, 'id' | 'created_at' | 'updated_at' | 'devices'>
): Promise<NetflixAccount | null> {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('netflix_accounts')
      .insert([account])
      .select()
      .single();

    if (error) {
      console.error('insertNetflixAccount error:', error);
      return null;
    }
    return data as NetflixAccount;
  } catch (err) {
    console.error('insertNetflixAccount exception:', err);
    return null;
  }
}

export async function updateNetflixAccount(
  id: string,
  updates: Partial<NetflixAccount>
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('netflix_accounts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return !error;
  } catch (err) {
    console.error('updateNetflixAccount error:', err);
    return false;
  }
}

export async function deleteNetflixAccount(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('netflix_accounts')
      .delete()
      .eq('id', id);

    return !error;
  } catch (err) {
    console.error('deleteNetflixAccount error:', err);
    return false;
  }
}

// ============================================================================
// PERSONAL DEVICES
// ============================================================================

export async function fetchPersonalDevices(netflixAccountId?: string): Promise<PersonalDevice[]> {
  const supabase = createClient();
  if (!supabase) return [];

  try {
    let query = supabase
      .from('personal_devices')
      .select('*, netflix_account:netflix_accounts(account_nickname, account_email)')
      .order('created_at', { ascending: false });

    if (netflixAccountId) {
      query = query.eq('netflix_account_id', netflixAccountId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as PersonalDevice[];
  } catch (err) {
    console.error('fetchPersonalDevices error:', err);
    return [];
  }
}

export async function insertPersonalDevice(
  device: Omit<PersonalDevice, 'id' | 'created_at' | 'updated_at' | 'netflix_account'>
): Promise<PersonalDevice | null> {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('personal_devices')
      .insert([device])
      .select()
      .single();

    if (error) {
      console.error('insertPersonalDevice error:', error);
      return null;
    }
    return data as PersonalDevice;
  } catch (err) {
    console.error('insertPersonalDevice exception:', err);
    return null;
  }
}

export async function updatePersonalDevice(
  id: string,
  updates: Partial<PersonalDevice>
): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('personal_devices')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return !error;
  } catch (err) {
    console.error('updatePersonalDevice error:', err);
    return false;
  }
}

export async function deletePersonalDevice(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('personal_devices')
      .delete()
      .eq('id', id);

    return !error;
  } catch (err) {
    console.error('deletePersonalDevice error:', err);
    return false;
  }
}

// ============================================================================
// TV ACTIVATIONS
// ============================================================================

export async function fetchTvActivations(): Promise<TvActivation[]> {
  const supabase = createClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('tv_activations')
      .select('*, netflix_account:netflix_accounts(account_nickname, account_email)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as TvActivation[];
  } catch (err) {
    console.error('fetchTvActivations error:', err);
    return [];
  }
}

export async function insertTvActivation(
  activation: Omit<TvActivation, 'id' | 'created_at' | 'updated_at' | 'netflix_account'>
): Promise<TvActivation | null> {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('tv_activations')
      .insert([activation])
      .select()
      .single();

    if (error) {
      console.error('insertTvActivation error:', error);
      return null;
    }
    return data as TvActivation;
  } catch (err) {
    console.error('insertTvActivation exception:', err);
    return null;
  }
}

export async function markTvActivated(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('tv_activations')
      .update({
        status: 'ACTIVATED',
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return !error;
  } catch (err) {
    console.error('markTvActivated error:', err);
    return false;
  }
}

// ============================================================================
// HOUSEHOLD VERIFICATIONS
// ============================================================================

export async function fetchHouseholdVerifications(): Promise<HouseholdVerification[]> {
  const supabase = createClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('household_verifications')
      .select('*, netflix_account:netflix_accounts(account_nickname, account_email)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as HouseholdVerification[];
  } catch (err) {
    console.error('fetchHouseholdVerifications error:', err);
    return [];
  }
}

export async function insertHouseholdVerification(
  verification: Omit<HouseholdVerification, 'id' | 'created_at' | 'updated_at' | 'netflix_account'>
): Promise<HouseholdVerification | null> {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('household_verifications')
      .insert([verification])
      .select()
      .single();

    if (error) {
      console.error('insertHouseholdVerification error:', error);
      return null;
    }
    return data as HouseholdVerification;
  } catch (err) {
    console.error('insertHouseholdVerification exception:', err);
    return null;
  }
}

export async function markHouseholdVerified(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('household_verifications')
      .update({
        status: 'VERIFIED_ON_TV',
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return !error;
  } catch (err) {
    console.error('markHouseholdVerified error:', err);
    return false;
  }
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export async function fetchAuditLogs(): Promise<AuditLogItem[]> {
  const supabase = createClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return data as AuditLogItem[];
  } catch (err) {
    console.error('fetchAuditLogs error:', err);
    return [];
  }
}

export async function insertAuditLog(
  actorId: string | undefined,
  action: string,
  targetType: string,
  targetId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;

  try {
    await supabase.from('audit_logs').insert([
      {
        actor_id: actorId || null,
        action,
        target_type: targetType,
        target_id: targetId || null,
        details: details || {},
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error('insertAuditLog error:', err);
  }
}
