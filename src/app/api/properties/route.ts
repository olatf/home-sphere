import { NextResponse } from 'next/server';
import { createProperty } from '@/actions/property';
import { getErrorMessage } from '@/helpers/error.helpers';

export async function POST(req: Request) {
  try {
    const { publish, ...data } = await req.json();
    const result = await createProperty(data, Boolean(publish));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
