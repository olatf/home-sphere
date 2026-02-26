import type { ReactNode } from 'react';
import { DashboardShell } from '@/dashboards/DashboardShell';
import { QueryProvider } from '@/providers/QueryProvider';

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <QueryProvider>
      <DashboardShell>{children}</DashboardShell>
    </QueryProvider>
  );
}
