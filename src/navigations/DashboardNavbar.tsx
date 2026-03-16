'use client';

import { useState } from 'react';
import {
  type DashboardRoute,
  LandlordRoutes,
  CommonRoutes,
} from '@/config/dashboardRoutes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { logout } from '@/actions/auth';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/common/BrandLogo';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type userRole = 'tenant' | 'landlord';
export const DashboardNavbar = ({
  userRole,
}: {
  userRole: userRole | undefined;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname === path;
  const handleSignout = async () => {
    await logout();
    router.push('/');
  };

  const renderRoute = (route: DashboardRoute) => {
    const active = isActive(route.path);

    return (
      <Link
        key={route.path}
        href={route.path}
        onClick={() => setIsOpen(false)}
        className={cn(
          'group text-md font-secondary relative flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200',
          active
            ? 'bg-primary/10 text-brand'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <span
          className={cn(
            'absolute top-0 left-0 h-full w-1 rounded-r-full transition-all duration-200',
            active ? 'bg-primary' : 'bg-transparent'
          )}
        />

        <span
          className={cn(
            active
              ? 'text-brand'
              : 'text-muted-foreground group-hover:text-foreground'
          )}
        >
          {route.icon}
        </span>

        <span>{route.label}</span>
      </Link>
    );
  };

  return (
    <>
      <div className="relative flex items-center justify-between border-b px-4 py-3 lg:hidden">
        <BrandLogo isScrolled={true} />
        <button onClick={() => setIsOpen(true)}>
          <Menu size={22} />
        </button>
      </div>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-background fixed top-0 left-0 z-50 h-screen w-64 transform border-r px-4 py-6 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:static lg:z-auto lg:translate-x-0'
        )}
      >
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <BrandLogo isScrolled={true} />
          <button onClick={() => setIsOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <div className="mb-6 hidden lg:block">
          <BrandLogo isScrolled={true} />
        </div>

        <nav className="flex flex-col gap-2">
          {userRole?.includes('landlord') && LandlordRoutes.map(renderRoute)}
          {CommonRoutes.map(renderRoute)}
        </nav>

        <div className="bg-primary/10 absolute bottom-4 mt-auto flex w-[80%] flex-col gap-2 rounded-lg">
          <button
            onClick={handleSignout}
            className="group text-md font-secondary hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="group-hover:text-foreground">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
