export type UserRole = 'customer' | 'admin' | 'super_admin';

export type AccountStatus = 'ACTIVE' | 'ON_HOLD' | 'INACTIVE';

export type DeviceStatus = 'ACTIVE' | 'PENDING_ACTIVATION' | 'RETIRED';

export type TvActivationStatus =
  | 'PENDING_OFFICIAL_SIGNIN'
  | 'ACTIVATED'
  | 'EXPIRED'
  | 'UNABLE_TO_ACTIVATE';

export type ActivationStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'PENDING_OFFICIAL_SIGNIN'
  | 'AWAITING_OFFICIAL_PROCESS'
  | 'ACTIVATED'
  | 'UNABLE_TO_ACTIVATE'
  | 'EXPIRED'
  | 'REJECTED';

export interface ActivationValidationResult {
  valid: boolean;
  normalizedCode: string;
  error?: string;
}

export interface ActivationSubmissionResult {
  success: boolean;
  trackingNumber: string;
  status: ActivationStatus;
  directActivationAvailable: boolean;
  message: string;
  providerResponse?: string;
  providerDetails?: string;
}

export interface ActivationStatusResult {
  trackingNumber: string;
  status: ActivationStatus;
  message?: string;
  directActivationAvailable?: boolean;
  lastUpdated?: string;
  providerResponse?: string;
}

export type HouseholdIssueType =
  | 'not_in_household'
  | 'travel_temporary'
  | 'router_replacement'
  | 'other';

export type HouseholdVerificationStatus =
  | 'PENDING'
  | 'VERIFIED_ON_TV'
  | 'RESOLVED'
  | 'CLOSED';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role?: UserRole;
}

export interface NetflixAccount {
  id: string;
  account_email: string; // Real Netflix account email
  account_nickname: string; // e.g. "Living Room 4K", "Family Profile"
  registered_email_inbox: string; // Linked Gmail inbox address
  subscription_plan: string; // e.g. "Standard with Ads", "Standard HD", "Premium 4K Ultra HD"
  account_status: AccountStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  devices?: PersonalDevice[];
}

export interface PersonalDevice {
  id: string;
  netflix_account_id?: string;
  device_name: string;
  device_type: string;
  status: DeviceStatus;
  household_network?: string; // e.g. "Home Wi-Fi 5GHz", "Vacation House"
  last_activated_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  netflix_account?: NetflixAccount;
}

export interface TvActivation {
  id: string;
  tracking_number: string;
  netflix_account_id?: string;
  device_name: string;
  tv_code: string;
  status: TvActivationStatus;
  notes?: string;
  activated_at?: string;
  created_at: string;
  updated_at: string;
  netflix_account?: NetflixAccount;
}

export interface HouseholdVerification {
  id: string;
  tracking_number: string;
  netflix_account_id?: string;
  device_name: string;
  issue_type: HouseholdIssueType;
  status: HouseholdVerificationStatus;
  notes?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  netflix_account?: NetflixAccount;
}

export interface GmailNotificationMessage {
  id: string;
  threadId: string;
  sender: string;
  subject: string;
  date: string;
  snippet: string;
  isHouseholdAlert: boolean;
  isSignInAlert: boolean;
  originalGmailUrl: string;
}

export interface GmailIntegrationInfo {
  isConnected: boolean;
  emailAddress?: string;
  lastSyncedAt?: string;
  scope?: string;
}

export interface AuditLogItem {
  id: string;
  actor_id?: string;
  actor_name?: string;
  action: string;
  target_type: string;
  target_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}
