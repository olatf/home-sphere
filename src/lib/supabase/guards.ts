import 'server-only';
import { createClient } from '@/lib/supabase/server';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export async function requireAdmin(): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError('You must be signed in to do this.');
  }

  const { data: isAdmin, error } = await supabase.rpc('is_admin');

  if (error || !isAdmin) {
    throw new UnauthorizedError(
      'You do not have permission to perform this action.'
    );
  }
}
