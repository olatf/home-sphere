'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { MobileMenu } from '@/components/common/MobileMenu';
import { ProfileTracker } from '@/components/common/ProfileTracker';
import { headerLinks } from '@/data/HeaderLinks';
import { useHeaderVisibility } from '@/hooks/useHeaderVisibility';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useScroll } from '@/hooks/useScroll';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';
import { useMobileMenu } from '@/stores/useMobileMenu';
import { BrandButton } from './BrandButton';
import { BrandLoader } from './BrandLoader';
import { BrandLogo } from './BrandLogo';

export default function Header() {
  const { open: mobileMenuOpen, close, openMenu } = useMobileMenu();
  const scrolled = useScroll(80);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isVisible = useHeaderVisibility(100);
  const pathname = usePathname();

  const { isUserAuthenticated, isLoading } = useUserProfile();

  if (pathname.includes('/properties/')) {
    return null;
  }

  return (
    <React.Fragment>
      <header
        className={cn(
          'fixed top-0 left-0 z-50 w-full transform transition-all duration-300',
          isVisible ? 'translate-y-0' : '-translate-y-full',
          scrolled
            ? 'bg-white/70 text-brand backdrop-blur-md hover:text-brand-black'
            : 'bg-brand text-white'
        )}
      >
        <DesktopNav
          isLoading={isLoading}
          isScrolled={scrolled}
          isUserAuthenticated={isUserAuthenticated}
          pathname={pathname}
        />

        <MobileNav openMenu={openMenu} isScrolled={scrolled} />
      </header>

      <MobileMenu
        open={mobileMenuOpen && !isDesktop}
        onClose={close}
        isActiveUser={isUserAuthenticated}
      />
    </React.Fragment>
  );
}

const DesktopNav = ({
  isLoading,
  isUserAuthenticated,
  isScrolled,
  pathname,
}: {
  isLoading: boolean;
  isUserAuthenticated: boolean;
  isScrolled: boolean;
  pathname: string;
}) => {
  const buttonClass =
    ' text-zinc-900 hover:border-b hover:border-white hover:text-white text-base font-primary font-semibold transition-colors duration-300 ease-in-out';

  return (
    <nav className="hidden w-full items-center gap-4 px-10 py-7 lg:flex xl:px-6">
      <div className="flex w-full items-center justify-between">
        <BrandLogo isScrolled={isScrolled} />

        <div className="flex w-[70%] items-center justify-end gap-15">
          <div className="flex items-center gap-9">
            {headerLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    buttonClass,
                    isScrolled
                      ? 'text-zinc-900 hover:border-brand hover:border-b-2 hover:text-brand'
                      : 'text-white',
                    isActive &&
                      (isScrolled
                        ? 'border-brand border-b-2'
                        : 'border-white border-b-2')
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div>
            {isLoading ? (
              <BrandLoader />
            ) : isUserAuthenticated ? (
              <ProfileTracker isScrolled={isScrolled} />
            ) : (
              <BrandButton
                asChild
                className={cn(
                  'bg-white text-zinc-900 hover:bg-zinc-900 hover:text-white',
                  isScrolled
                    ? 'bg-brand text-white hover:bg-zinc-900 hover:text-white'
                    : 'bg-white text-zinc-900 hover:bg-zinc-900 hover:text-white'
                )}
              >
                <Link href="/sign-in">Sign-in</Link>
              </BrandButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const MobileNav = ({
  openMenu,
  isScrolled,
}: {
  openMenu: () => void;
  isScrolled: boolean;
}) => {
  return (
    <nav className="my-5 flex w-full justify-between px-4 py-2 lg:hidden">
      <BrandLogo isScrolled={isScrolled} />

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="z-50 flex h-10 w-10 cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open Menu"
          onClick={openMenu}
        >
          <Menu
            className={cn('size-7', isScrolled ? 'text-brand' : 'text-white')}
          />
        </button>
      </div>
    </nav>
  );
};
