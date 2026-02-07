import type { PropsWithChildren } from 'react';

export function If({ cond, children }: PropsWithChildren<{ cond: boolean }>) {
  if (cond) return <>{children}</>;

  return null;
}
