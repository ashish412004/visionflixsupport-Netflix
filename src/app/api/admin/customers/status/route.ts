import { NextRequest, NextResponse } from 'next/server';
import { verifyServerAdmin, createAdminSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/customers/status
 * Suspends or reactivates a customer.
 */
export async function POST(req: NextRequest) {
  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  const supabaseAdmin = createAdminSupabaseClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ 
      error: 'SUPABASE_SERVICE_ROLE_KEY is required in environment variables.' 
    }, { status: 500 });
  }

  try {
    const { userId, status } = await req.json();

    if (!userId || !['ACTIVE', 'SUSPENDED'].includes(status)) {
      return NextResponse.json({ error: 'Valid userId and status (ACTIVE or SUSPENDED) required.' }, { status: 400 });
    }

    // Update profile
    await supabaseAdmin
      .from('profiles')
      .update({
        status,
        is_active: status === 'ACTIVE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Update subscription
    await supabaseAdmin
      .from('customer_subscriptions')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: auth.user?.id,
      actor_email: auth.user?.email,
      action: status === 'SUSPENDED' ? 'SUSPEND_CUSTOMER' : 'REACTIVATE_CUSTOMER',
      target_type: 'CUSTOMER',
      target_id: userId,
      details: { status },
    });

    return NextResponse.json({ success: true, status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update customer status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
