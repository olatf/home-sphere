import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Params {
  params: Promise<{ type: string }>;
}

export async function PATCH(req: Request, { params }: Params) {
  const { type } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { fee, description } = (await req.json()) as {
    fee: number;
    description?: string;
  };

  if (!fee || fee < 0)
    return NextResponse.json({ error: 'Invalid fee' }, { status: 400 });

  const { data, error } = await supabase
    .from('inspection_fee_config')
    .upsert(
      {
        property_type: type,
        fee,
        description,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'property_type' }
    )
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
