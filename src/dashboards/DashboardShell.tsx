'use client';

import type { ReactNode } from 'react';
import { DashboardNavbar, AdminNavbar } from '@/navigations';
import { usePathname } from 'next/navigation';

const isEventPageRoute = (pathname: string | null) =>
  !!pathname &&
  (pathname.startsWith('/dashboard/events/create') ||
    /^\/dashboard\/events\/[^/]+\/edit$/.test(pathname) ||
    pathname.startsWith('/admin/events/create') ||
    /^\/admin\/events\/[^/]+\/edit$/.test(pathname));

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isEventPage = isEventPageRoute(pathname);
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <main>
      {!isEventPage && (isAdmin ? <AdminNavbar /> : <DashboardNavbar />)}
      <div className="h-full px-4 sm:px-6 md:px-10 xl:px-0">{children}</div>
      {/* <div className="bg-brand-primary h-16 p-5 fixed bottom-3 right-3 rounded-xl">
       <p className="text-white font-medium">Back to Table4Thirteen Website</p>
      </div> */}
    </main>
  );
}
