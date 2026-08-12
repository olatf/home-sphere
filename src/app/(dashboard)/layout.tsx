import type { ReactNode } from 'react';
import { getUserProfile } from '@/actions/auth';
import { DashboardShell } from '@/dashboards/DashboardShell';
import { PaymentModalWrapper } from '@/dashboards/PaymentModalWrapper';
import { QueryProvider } from '@/providers/QueryProvider';
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
