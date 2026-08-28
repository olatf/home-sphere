import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('inspection_fee_config')
    .select('property_type, fee, description')
    .order('property_type');

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=300' }, // cache 5 minutes
  });
}
