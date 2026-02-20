'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { logout } from '@/actions/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { safeStr } from '@/helpers/data.helpers';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';
import { If } from './If';

export const ProfileTracker = ({ isScrolled }: { isScrolled?: boolean }) => {
  const [open, setOpen] = useState(false);
  const { profile } = useUserProfile();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/sign-in');
  };

  const buttonClass =
    'border text-brand-dark hover:bg-brand-dark hover:text-white min-h-12 rounded-[45px] px-6 text-base font-secondary';

  if (!profile) {
    return null;
  }

  return (
    <React.Fragment>
      {/* Mobile Profile Menu */}
      <div className="block w-full md:hidden">
        <DropdownMenu onOpenChange={setOpen}>
          <DropdownMenuTrigger
            className={cn(
              'flex h-12 w-full min-w-56 cursor-pointer items-center justify-center pr-1 pl-3',
              buttonClass
            )}
          >
            <div className="text-left">
              <p className="font-secondary leading-none font-normal">
                Hi {safeStr(profile?.full_name)}
              </p>
            </div>

            <ChevronDown
              className={cn(
                'size-6 transition-transform',
                open ? 'rotate-180' : 'rotate-0'
              )}
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            sideOffset={5}
            className="font-secondary min-w-[320px] rounded-lg border bg-white p-1 shadow-lg"
          >
            <DropdownMenuItem className="text-md cursor-pointer">
              <Link href="/account">My Account</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-md cursor-pointer"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Profile Menu */}
      <div className="hidden md:block">
        <DropdownMenu onOpenChange={setOpen}>
          <DropdownMenuTrigger className="cursor-pointer outline-none">
            <div
              className={cn(
                'flex items-center justify-center gap-3 rounded-full px-4 py-3 text-base text-white',
                buttonClass,
                isScrolled ? 'text-brand bg-white' : 'bg-transparent text-white'
              )}
            >
              <div className="text-left">
                <p className="font-secondary leading-none font-normal">
                  Hi {safeStr(profile?.full_name)}
                </p>
              </div>

              <ChevronDown
                className={cn(
                  'size-6 transition-transform',
                  open ? 'rotate-180' : 'rotate-0'
                )}
              />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="font-secondary w-56 rounded-lg border bg-white p-2 shadow-lg"
            sideOffset={8}
          >
            <div className="mb-2 cursor-pointer border-b px-3 py-2">
              <p className="font-primary text-base font-normal text-zinc-900">
                {safeStr(profile?.full_name)}
              </p>

              <p className="font-secondary text-sm font-semibold">
                {' '}
                {safeStr(profile?.email)}
              </p>
              <If cond={profile?.role !== null}>
                <p className="text-sm text-gray-600">
                  Role: {safeStr(profile?.role)}
                </p>
              </If>
            </div>

            <DropdownMenuItem className="cursor-pointer text-sm">
              <Link href="/account">My Account</Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-sm"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </React.Fragment>
  );
};
