import { NextRequest, NextResponse } from 'next/server';
import { verifyServerAdmin, createAdminSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/customers/reset-password
 * Admin securely resets customer password and marks must_change_password = true.
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
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ 
        error: 'User ID and a temporary password (min 6 characters) are required.' 
      }, { status: 400 });
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
      user_metadata: { must_change_password: true },
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Set must_change_password in profiles
    await supabaseAdmin
      .from('profiles')
      .update({ must_change_password: true, updated_at: new Date().toISOString() })
      .eq('id', userId);

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: auth.user?.id,
      actor_email: auth.user?.email,
      action: 'RESET_CUSTOMER_PASSWORD',
      target_type: 'CUSTOMER',
      target_id: userId,
    });

    return NextResponse.json({ success: true, message: 'Password reset successfully.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to reset customer password';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
