import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/helpers/error.helpers';
import { createClient } from '@/lib/supabase/server';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (status === 'rejected') {
      const { error } = await supabase
        .from('properties')
        .update({
          status: 'revised',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('landlord_id', user.id)
        .eq('status', 'rejected');

      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase
      .from('properties')
      .update({
        status: 'pending_review',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('landlord_id', user.id)
      .eq('status', 'draft');

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = getErrorMessage(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
