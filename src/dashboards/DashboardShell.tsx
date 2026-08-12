'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { AdminNavbar, DashboardNavbar, SummaryHeader } from '@/navigations';
import { DashboardVerificationWidget } from './DashboardVerificationWidget';

export function DashboardShell({
  children,
  userRole,
}: {
  children: ReactNode;
  userRole?: 'tenant' | 'landlord';
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden md:flex-row">
      {/* Sidebar */}
      <aside className="border-r bg-background py-3 md:w-64 md:shrink-0 md:py-0">
        {isAdmin ? <AdminNavbar /> : <DashboardNavbar userRole={userRole} />}
      </aside>

      <div className="relative flex flex-col overflow-hidden md:flex-1">
        {/* Summary Header */}
        <div className="flex h-15 items-center border-b px-3 md:h-20 md:shrink-0 md:px-6">
          <SummaryHeader />
          {!isAdmin && (
            <div
              key={refreshKey}
              className="absolute top-5 right-0 px-3 py-2 md:px-6"
            >
              <DashboardVerificationWidget onRefresh={handleRefresh} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="no-scrollbar flex-1 overflow-y-auto py-2">
          {children}
        </div>
      </div>
    </div>
  );
}
