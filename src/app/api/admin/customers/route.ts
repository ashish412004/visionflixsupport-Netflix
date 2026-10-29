import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyServerAdmin, 
  createAdminSupabaseClient, 
  createServerSupabaseClient 
} from '@/lib/supabase/server';

/**
 * GET /api/admin/customers
 * Retrieves all customers with subscription details and device allocation counts.
 */
export async function GET() {
  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  const supabase = createServerSupabaseClient();
  const supabaseAdmin = createAdminSupabaseClient();
  const client = supabaseAdmin || supabase;

  if (!client) {
    return NextResponse.json({ error: 'Database client unavailable' }, { status: 500 });
  }

  try {
    // Fetch profiles that have role = 'customer' or all non-admin profiles
    const { data: customerRoles } = await client
      .from('user_roles')
      .select('user_id')
      .eq('role', 'customer');

    const customerUserIds = (customerRoles || []).map((r) => r.user_id);

    let query = client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Exclude the admin email
    query = query.neq('email', 'hhshukla241099@gmail.com');

    const { data: profiles, error: profileErr } = await query;

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    // Fetch subscriptions
    const { data: subscriptions } = await client
      .from('customer_subscriptions')
      .select('*');

    // Fetch device allocations count
    const { data: devices } = await client
      .from('customer_device_allocations')
      .select('user_id');

    const deviceCountMap: Record<string, number> = {};
    (devices || []).forEach((d) => {
      deviceCountMap[d.user_id] = (deviceCountMap[d.user_id] || 0) + 1;
    });

    const subMap: Record<string, any> = {};
    (subscriptions || []).forEach((s) => {
      subMap[s.user_id] = s;
    });

    const customers = (profiles || []).map((p) => {
      const sub = subMap[p.id];
      return {
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        status: p.status || (p.is_active ? 'ACTIVE' : 'SUSPENDED'),
        must_change_password: Boolean(p.must_change_password),
        created_at: p.created_at,
        plan_name: sub?.plan_name || 'Standard Concierge',
        expires_at: sub?.expires_at || null,
        max_devices: sub?.max_device_allocations || 2,
        allocated_devices_count: deviceCountMap[p.id] || 0,
      };
    });

    return NextResponse.json({ customers });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve customers';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/admin/customers
 * Creates a real Supabase Auth customer user and initializes subscription.
 */
export async function POST(req: NextRequest) {
  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  const supabaseAdmin = createAdminSupabaseClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ 
      error: 'SUPABASE_SERVICE_ROLE_KEY is required in environment variables for administrative user creation.' 
    }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { 
      fullName, 
      email, 
      temporaryPassword, 
      planName = 'Standard Concierge', 
      maxDevices = 2, 
      expiresAt, 
      status = 'ACTIVE' 
    } = body;

    const cleanEmail = email?.trim().toLowerCase();
    const cleanName = fullName?.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid customer email is required.' }, { status: 400 });
    }
    if (!cleanName) {
      return NextResponse.json({ error: 'Customer full name is required.' }, { status: 400 });
    }
    if (!temporaryPassword || temporaryPassword.length < 6) {
      return NextResponse.json({ error: 'Temporary password must be at least 6 characters.' }, { status: 400 });
    }

    // Check if creating admin email is attempted
    if (cleanEmail === 'hhshukla241099@gmail.com') {
      return NextResponse.json({ error: 'Cannot create customer using the reserved administrator email.' }, { status: 400 });
    }

    // 1. Create User in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
        must_change_password: true,
      },
    });

    if (authError || !authUser?.user) {
      return NextResponse.json({ error: authError?.message || 'Failed to create user in Supabase Auth' }, { status: 400 });
    }

    const userId = authUser.user.id;

    // 2. Ensure customer role is assigned
    await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: userId, role: 'customer' }, { onConflict: 'user_id,role' });

    // 3. Upsert profile
    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: cleanEmail,
        full_name: cleanName,
        is_active: status === 'ACTIVE',
        status,
        must_change_password: true,
        updated_at: new Date().toISOString(),
      });

    // 4. Create customer subscription
    await supabaseAdmin
      .from('customer_subscriptions')
      .upsert({
        user_id: userId,
        plan_name: planName,
        status,
        max_device_allocations: Number(maxDevices) || 2,
        expires_at: expiresAt || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    // 5. Append audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: auth.user?.id,
      actor_email: auth.user?.email,
      action: 'CREATE_CUSTOMER',
      target_type: 'CUSTOMER',
      target_id: userId,
      details: {
        email: cleanEmail,
        full_name: cleanName,
        plan: planName,
        max_devices: maxDevices,
      },
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: userId,
        email: cleanEmail,
        full_name: cleanName,
        status,
        plan_name: planName,
        max_devices: maxDevices,
        expires_at: expiresAt,
        must_change_password: true,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error during customer creation';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PUT /api/admin/customers
 * Updates customer details, subscription plan, device limits, expiry, or status.
 */
export async function PUT(req: NextRequest) {
  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  const supabaseAdmin = createAdminSupabaseClient();
  const supabase = createServerSupabaseClient();
  const client = supabaseAdmin || supabase;

  if (!client) {
    return NextResponse.json({ error: 'Database client unavailable' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id, fullName, planName, maxDevices, expiresAt, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required.' }, { status: 400 });
    }

    // Update profile
    if (fullName || status) {
      const profileUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (fullName) profileUpdates.full_name = fullName.trim();
      if (status) {
        profileUpdates.status = status;
        profileUpdates.is_active = status === 'ACTIVE';
      }

      await client
        .from('profiles')
        .update(profileUpdates)
        .eq('id', id);
    }

    // Update subscription
    if (planName || maxDevices !== undefined || expiresAt !== undefined || status) {
      const subUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (planName) subUpdates.plan_name = planName;
      if (maxDevices !== undefined) subUpdates.max_device_allocations = Number(maxDevices);
      if (expiresAt !== undefined) subUpdates.expires_at = expiresAt || null;
      if (status) subUpdates.status = status;

      await client
        .from('customer_subscriptions')
        .upsert({ user_id: id, ...subUpdates }, { onConflict: 'user_id' });
    }

    // Audit log
    await client.from('audit_logs').insert({
      actor_id: auth.user?.id,
      actor_email: auth.user?.email,
      action: 'UPDATE_CUSTOMER',
      target_type: 'CUSTOMER',
      target_id: id,
      details: { fullName, planName, maxDevices, status, expiresAt },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update customer';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/customers
 * Permanently removes a customer from Auth and Database.
 */
export async function DELETE(req: NextRequest) {
  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  const supabaseAdmin = createAdminSupabaseClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ 
      error: 'SUPABASE_SERVICE_ROLE_KEY is required to delete customer accounts.' 
    }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required.' }, { status: 400 });
    }

    // Safety check: Prevent deleting administrator
    if (id === auth.user?.id) {
      return NextResponse.json({ error: 'Cannot delete the administrator account.' }, { status: 400 });
    }

    // Delete customer in Supabase Auth (cascades to profile and sub-tables)
    const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 400 });
    }

    // Clean up profile explicitly just in case cascade is delayed
    await supabaseAdmin.from('profiles').delete().eq('id', id);

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: auth.user?.id,
      actor_email: auth.user?.email,
      action: 'DELETE_CUSTOMER',
      target_type: 'CUSTOMER',
      target_id: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete customer';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
