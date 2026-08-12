import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ids } = (await req.json()) as { ids: string[] };
  if (!ids?.length)
    return NextResponse.json({ error: 'No ids provided' }, { status: 400 });

  const { error } = await supabase
    .from('messages')
    .delete()
    .in('id', ids)
    .eq('user_id', user.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
