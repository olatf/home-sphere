import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, UnauthorizedError } from '@/lib/supabase/guards';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    const status = err instanceof UnauthorizedError ? 403 : 401;
    return NextResponse.json({ error: 'Unauthorized' }, { status });
  }

  const supabase = await createClient();
  const admin = await createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { to, subject, body } = (await req.json()) as {
    to: string;
    subject: string;
    body: string;
  };
  if (!to || !subject || !body)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  // Look up sender profile for author_name
  const { data: sender } = await supabase
    .from('user_profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  // Resolve recipient: `to` can be a user_id (uuid) or email
  let recipientId = to;
  if (!to.match(/^[0-9a-f-]{36}$/i)) {
    // Treat as email — look up user_id
    const { data: recipient } = await admin
      .from('user_profiles')
      .select('id')
      .eq('email', to)
      .single();
    if (!recipient)
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    recipientId = recipient.id;
  }

  const { error } = await admin.from('messages').insert({
    user_id: recipientId,
    subject,
    body,
    author_name: sender?.full_name ?? 'HomeSphere User',
    author_email: sender?.email,
    type: 'message',
    is_read: false,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
