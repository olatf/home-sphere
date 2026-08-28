type PostgresErrorLike = {
  code?: string;
  message?: string;
};

const POSTGRES_USER_MESSAGES: Record<string, string> = {
  '23505':
    'This record already exists. Refresh the page to see the latest data.',
  '42501':
    "You don't have permission to perform this action. Please contact your workspace administrator.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toPostgresErrorLike(value: unknown): PostgresErrorLike | null {
  if (!isRecord(value)) return null;
  if (!('code' in value)) return null;
  if (typeof value.code !== 'string') return null;

  return value as PostgresErrorLike;
}

function parsePostgresError(error: unknown): PostgresErrorLike | null {
  const direct = toPostgresErrorLike(error);
  if (direct) return direct;

  if (!(error instanceof Error)) return null;

  try {
    const parsed = JSON.parse(error.message) as unknown;
    return toPostgresErrorLike(parsed);
  } catch {
    // Not a JSON-encoded Postgres error payload.
  }

  return null;
}

export function getErrorMessage(error: unknown): string {
  const postgresError = parsePostgresError(error);
  if (postgresError?.code && POSTGRES_USER_MESSAGES[postgresError.code]) {
    return POSTGRES_USER_MESSAGES[postgresError.code];
  }

  if (postgresError?.message) {
    return postgresError.message;
  }

  if (error instanceof Error) return error.message;
  return String(error);
}
