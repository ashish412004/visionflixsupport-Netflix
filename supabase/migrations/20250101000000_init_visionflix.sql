-- ============================================================================
-- VISIONFLIX — PERSONAL NETFLIX MANAGEMENT SYSTEM
-- Supabase PostgreSQL Migration with Row Level Security (RLS)
-- Designed for personal management of authorized Netflix accounts and inboxes.
-- ============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Administrator / Owner profile)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ADMIN ROLES
create table if not exists public.admin_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  role_level text default 'super_admin' not null check (role_level in ('support_admin', 'super_admin')),
  granted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. NETFLIX ACCOUNTS (Personal Netflix Account Records)
-- Tracks Netflix account emails, nicknames, subscription tiers, and linked inbox.
-- Passwords are never collected or stored.
create table if not exists public.netflix_accounts (
  id uuid default uuid_generate_v4() primary key,
  account_email text not null,
  account_nickname text not null,
  registered_email_inbox text not null,
  subscription_plan text default 'Premium 4K Ultra HD' not null,
  account_status text default 'ACTIVE' not null check (account_status in ('ACTIVE', 'ON_HOLD', 'INACTIVE')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PERSONAL DEVICES (Hardware allocations associated with accounts)
create table if not exists public.personal_devices (
  id uuid default uuid_generate_v4() primary key,
  netflix_account_id uuid references public.netflix_accounts(id) on delete cascade,
  device_name text not null,
  device_type text not null,
  status text default 'ACTIVE' not null check (status in ('ACTIVE', 'PENDING_ACTIVATION', 'RETIRED')),
  household_network text,
  last_activated_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TV ACTIVATIONS (Personal TV Code Activation Records)
create table if not exists public.tv_activations (
  id uuid default uuid_generate_v4() primary key,
  tracking_number text unique not null,
  netflix_account_id uuid references public.netflix_accounts(id) on delete set null,
  device_name text not null,
  tv_code text not null,
  status text default 'PENDING_OFFICIAL_SIGNIN' not null check (status in ('PENDING_OFFICIAL_SIGNIN', 'ACTIVATED', 'EXPIRED', 'UNABLE_TO_ACTIVATE')),
  notes text,
  activated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. HOUSEHOLD VERIFICATIONS (Household Support & Diagnostics)
create table if not exists public.household_verifications (
  id uuid default uuid_generate_v4() primary key,
  tracking_number text unique not null,
  netflix_account_id uuid references public.netflix_accounts(id) on delete set null,
  device_name text not null,
  issue_type text default 'not_in_household' not null check (issue_type in ('not_in_household', 'travel_temporary', 'router_replacement', 'other')),
  status text default 'PENDING' not null check (status in ('PENDING', 'VERIFIED_ON_TV', 'RESOLVED', 'CLOSED')),
  notes text,
  verified_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. GMAIL INTEGRATIONS (Secure OAuth token storage for Netflix notification inbox)
create table if not exists public.gmail_integrations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  email_address text not null,
  encrypted_access_token text not null,
  encrypted_refresh_token text,
  token_expiry timestamp with time zone,
  scope text not null,
  is_connected boolean default true not null,
  last_synced_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, email_address)
);

-- 8. AUDIT LOGS
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Admin-only and Authenticated Owner Access
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.admin_roles enable row level security;
alter table public.netflix_accounts enable row level security;
alter table public.personal_devices enable row level security;
alter table public.tv_activations enable row level security;
alter table public.household_verifications enable row level security;
alter table public.gmail_integrations enable row level security;
alter table public.audit_logs enable row level security;

-- Helper function: Is administrator
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_roles
    where user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Profiles: Authenticated user views/updates own
create policy "User manages own profile or admin manages all"
  on public.profiles for all
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- Admin roles: Admins only
create policy "Admin roles managed by admin"
  on public.admin_roles for all
  using (public.is_admin());

-- Netflix Accounts: Authenticated users manage accounts
create policy "Manage personal netflix accounts"
  on public.netflix_accounts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Personal Devices: Authenticated users manage personal devices
create policy "Manage personal devices"
  on public.personal_devices for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- TV Activations: Authenticated users manage TV activations
create policy "Manage TV activations"
  on public.tv_activations for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Household Verifications: Authenticated users manage household verifications
create policy "Manage household verifications"
  on public.household_verifications for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Gmail Integrations: User manages own connected Gmail
create policy "Manage own Gmail integration"
  on public.gmail_integrations for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Audit logs: Authenticated users view / insert
create policy "Authenticated users view audit logs"
  on public.audit_logs for select
  using (auth.role() = 'authenticated');

create policy "Insert audit logs"
  on public.audit_logs for insert
  with check (true);
