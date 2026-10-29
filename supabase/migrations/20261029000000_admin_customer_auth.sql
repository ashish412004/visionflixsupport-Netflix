-- ============================================================================
-- VISIONFLIX — ADMIN AUTHENTICATION & CUSTOMER ACCESS CONTROL MIGRATION
-- Migration: 20261029000000_admin_customer_auth.sql
-- Enforces:
-- 1. Sole Authorized Admin: hhshukla241099@gmail.com
-- 2. Complete removal of public customer registration
-- 3. Strict Admin-provisioned customer authentication
-- 4. Row Level Security (RLS) on all customer and administrative tables
-- ============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE ENHANCEMENTS
alter table if exists public.profiles
  add column if not exists must_change_password boolean default false,
  add column if not exists status text default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED', 'PENDING'));

-- 2. USER ROLES TABLE
create table if not exists public.user_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('admin', 'customer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, role)
);

-- 3. CUSTOMER PLANS
create table if not exists public.customer_plans (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  max_devices integer default 2 not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed default plans if not already present
insert into public.customer_plans (name, max_devices, description)
values 
  ('Basic Support', 1, 'Essential 1-Device TV Activation & Concierge Support'),
  ('Standard Concierge', 2, '2 Hardware Devices, TV Activation & Household Assistance'),
  ('Premium 4K VIP', 4, 'Full VIP Priority Access, up to 4 Dedicated Hardware Allocations')
on conflict (name) do nothing;

-- 4. CUSTOMER SUBSCRIPTIONS
create table if not exists public.customer_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  plan_name text default 'Premium 4K VIP' not null,
  status text default 'ACTIVE' not null check (status in ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'TRIAL')),
  max_device_allocations integer default 4 not null,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CUSTOMER DEVICE ALLOCATIONS
create table if not exists public.customer_device_allocations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  device_name text not null,
  device_type text not null,
  location text,
  status text default 'ACTIVE' not null check (status in ('ACTIVE', 'PENDING_SETUP', 'RETIRED')),
  household_network text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. AUDIT LOGS TABLE ENHANCEMENTS
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. ENFORCE SOLE AUTHORIZED ADMIN VIA SQL FUNCTION
-- Only hhshukla241099@gmail.com with role = 'admin' satisfies this check.
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 
    from public.user_roles ur
    join auth.users u on u.id = ur.user_id
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
      and lower(u.email) = 'hhshukla241099@gmail.com'
  );
end;
$$ language plpgsql security definer;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.customer_plans enable row level security;
alter table public.customer_subscriptions enable row level security;
alter table public.customer_device_allocations enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles Policies
drop policy if exists "User manages own profile or admin manages all" on public.profiles;
create policy "User manages own profile or admin manages all"
  on public.profiles for all
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- User Roles Policies
drop policy if exists "User reads own role, admin manages roles" on public.user_roles;
create policy "User reads own role, admin manages roles"
  on public.user_roles for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Only admin can insert or update roles" on public.user_roles;
create policy "Only admin can insert or update roles"
  on public.user_roles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Customer Plans Policies
drop policy if exists "Authenticated users can read plans" on public.customer_plans;
create policy "Authenticated users can read plans"
  on public.customer_plans for select
  using (auth.role() = 'authenticated');

drop policy if exists "Only admin can manage plans" on public.customer_plans;
create policy "Only admin can manage plans"
  on public.customer_plans for all
  using (public.is_admin())
  with check (public.is_admin());

-- Customer Subscriptions Policies
drop policy if exists "User views own subscription or admin views all" on public.customer_subscriptions;
create policy "User views own subscription or admin views all"
  on public.customer_subscriptions for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admin manages customer subscriptions" on public.customer_subscriptions;
create policy "Admin manages customer subscriptions"
  on public.customer_subscriptions for all
  using (public.is_admin())
  with check (public.is_admin());

-- Customer Device Allocations Policies
drop policy if exists "User manages own device allocations or admin manages all" on public.customer_device_allocations;
create policy "User manages own device allocations or admin manages all"
  on public.customer_device_allocations for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Audit Logs Policies
drop policy if exists "Admin reads audit logs" on public.audit_logs;
create policy "Admin reads audit logs"
  on public.audit_logs for select
  using (public.is_admin());

drop policy if exists "Anyone authenticated can append audit logs" on public.audit_logs;
create policy "Anyone authenticated can append audit logs"
  on public.audit_logs for insert
  with check (auth.role() = 'authenticated');

-- 9. AUTOMATIC TRIGGER FOR SECURE ROLE ASSIGNMENT
-- Ensures hhshukla241099@gmail.com is given admin role on signup/bootstrap,
-- while all other users are strictly given customer roles.
create or replace function public.handle_user_auth_sync()
returns trigger as $$
begin
  if lower(new.email) = 'hhshukla241099@gmail.com' then
    -- Assign Admin role
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;

    -- Upsert Admin Profile
    insert into public.profiles (id, email, full_name, is_active, must_change_password, status)
    values (
      new.id, 
      new.email, 
      coalesce(new.raw_user_meta_data->>'full_name', 'Authorized Administrator'), 
      true, 
      false, 
      'ACTIVE'
    )
    on conflict (id) do update set
      status = 'ACTIVE',
      updated_at = now();
  else
    -- Assign Customer role
    insert into public.user_roles (user_id, role)
    values (new.id, 'customer')
    on conflict (user_id, role) do nothing;

    -- Upsert Customer Profile
    insert into public.profiles (id, email, full_name, is_active, must_change_password, status)
    values (
      new.id, 
      new.email, 
      coalesce(new.raw_user_meta_data->>'full_name', 'Customer'), 
      true, 
      coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, true),
      'ACTIVE'
    )
    on conflict (id) do update set
      updated_at = now();
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger hook on auth.users
drop trigger if exists on_auth_user_created_sync on auth.users;
create trigger on_auth_user_created_sync
  after insert or update on auth.users
  for each row execute procedure public.handle_user_auth_sync();

-- 10. IMMEDIATE ONE-TIME BOOTSTRAP CHECK
-- If hhshukla241099@gmail.com already exists in auth.users, grant admin role immediately.
do $$
declare
  admin_uid uuid;
begin
  select id into admin_uid
  from auth.users
  where lower(email) = 'hhshukla241099@gmail.com'
  limit 1;

  if admin_uid is not null then
    insert into public.user_roles (user_id, role)
    values (admin_uid, 'admin')
    on conflict (user_id, role) do nothing;

    insert into public.profiles (id, email, full_name, is_active, must_change_password, status)
    values (admin_uid, 'hhshukla241099@gmail.com', 'System Administrator', true, false, 'ACTIVE')
    on conflict (id) do update set
      is_active = true,
      status = 'ACTIVE',
      updated_at = now();
      
    raise notice 'Administrator hhshukla241099@gmail.com has been granted admin privileges.';
  else
    raise notice 'Admin account hhshukla241099@gmail.com not yet found in auth.users. It will be assigned admin automatically upon creation.';
  end if;
end;
$$;
