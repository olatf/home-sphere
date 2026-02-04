/* eslint-disable @typescript-eslint/no-explicit-any */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String((error as any)?.message ?? error);
};
