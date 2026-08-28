'use client';

import { LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { logout } from '@/actions/auth';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandLogo } from '@/components/common/BrandLogo';
import {
  CommonRoutes,
  type DashboardRoute,
  LandlordRoutes,
  TenantRoutes,
} from '@/config/dashboardRoutes';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { cn } from '@/lib/utils';

type userRole = 'tenant' | 'landlord';
export const DashboardNavbar = ({
  userRole,
}: {
  userRole: userRole | undefined;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEscapeKey(isOpen, () => setIsOpen(false));

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
          'group relative flex items-center gap-3 rounded-lg px-4 py-3 font-medium font-secondary text-md transition-all duration-200',
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
      <div className="relative flex items-center justify-between border-b px-4 py-3 md:hidden">
        <BrandLogo isScrolled={true} />
        <BrandButton
          onClick={() => setIsOpen(true)}
          leftIcon={<Menu size={22} />}
        />
      </div>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 transform border-r bg-background px-4 py-6 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:static md:z-auto md:translate-x-0'
        )}
      >
        <div className="mb-6 flex items-center justify-between md:hidden">
          <BrandLogo isScrolled={true} />
          <BrandButton
            onClick={() => setIsOpen(false)}
            leftIcon={<X size={22} />}
          />
        </div>

        <div className="mb-6 hidden md:block">
          <BrandLogo isScrolled={true} />
        </div>

        <nav className="flex flex-col gap-2">
          {userRole?.includes('landlord')
            ? LandlordRoutes.map(renderRoute)
            : TenantRoutes.map(renderRoute)}
          {CommonRoutes.map(renderRoute)}
        </nav>

        <div className="absolute bottom-4 mt-auto flex w-[80%] flex-col gap-2 rounded-lg bg-primary/10">
          <BrandButton onClick={handleSignout} leftIcon={<LogOut size={22} />}>
            <span className="group-hover:text-foreground">Logout</span>
          </BrandButton>
        </div>
      </aside>
    </>
  );
};
