import type { ReactNode } from 'react';
import { DashboardShell } from '@/dashboards/DashboardShell';
import { QueryProvider } from '@/providers/QueryProvider';
import { getUserProfile } from '@/actions/auth';
import { PaymentModalWrapper } from '@/dashboards/PaymentModalWrapper';
export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { data } = await getUserProfile();
  const userRole = data?.role;
  return (
    <QueryProvider>
      <DashboardShell userRole={userRole}>
        {children}
        <PaymentModalWrapper userEmail={data?.email ?? ''} />
      </DashboardShell>
    </QueryProvider>
  );
}
