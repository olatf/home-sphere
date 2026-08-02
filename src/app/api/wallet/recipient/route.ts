import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/helpers/error.helpers';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

interface Profile {
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const admin = await createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: 'Search query must be at least 3 characters' },
        { status: 400 }
      );
    }

    const isEmail = query.includes('@');
    let targetUserId: string | null = null;

    if (isEmail) {
      // Resolve user_id from email
      const { data: profileData, error: profileError } = await admin
        .from('user_profiles')
        .select('user_id')
        .eq('email', query)
        .neq('user_id', user.id)
        .single();

      if (profileError || !profileData) {
        return NextResponse.json(
          { error: 'No wallet found for that ID or email' },
          { status: 404 }
        );
      }

      targetUserId = profileData.user_id;
    } else {
      // Resolve user_id from wallet_id
      const { data: walletData, error: walletError } = await admin
        .from('wallets')
        .select('user_id')
        .eq('wallet_id', query.toUpperCase())
        .neq('user_id', user.id)
        .single();

      if (walletError || !walletData) {
        return NextResponse.json(
          { error: 'No wallet found for that ID or email' },
          { status: 404 }
        );
      }

      targetUserId = walletData.user_id;
    }

    // Fetch wallet and profile
    const [
      { data: walletData, error: walletError },
      { data: profileData, error: profileError },
    ] = await Promise.all([
      admin
        .from('wallets')
        .select('id, wallet_id')
        .eq('user_id', targetUserId)
        .single(),
      admin
        .from('user_profiles')
        .select('full_name, email, avatar_url')
        .eq('id', targetUserId)
        .single(),
    ]);

    if (walletError || !walletData) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    if (profileError || !profileData) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profileData as Profile;

    return NextResponse.json({
      wallet_id: walletData.id,
      display_wallet_id: walletData.wallet_id,
      name: profile.full_name,
      email: profile.email,
      avatar_url: profile.avatar_url,
    });
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
