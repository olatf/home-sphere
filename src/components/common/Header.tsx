'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { BrandLoader } from './BrandLoader';
import { BrandLogo } from './BrandLogo';
import { useScroll } from '@/hooks/useScroll';
import { cn } from '@/lib/utils';
import { MobileMenu } from '@/components/common/MobileMenu';
import { useMobileMenu } from '@/stores/useMobileMenu';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useHeaderVisibility } from '@/hooks/useHeaderVisibility';
import { useUserProfile } from '@/hooks/useUserProfile';
import { BrandButton } from './BrandButton';
import { ProfileTracker } from '@/components/common/ProfileTracker';

export default function Header() {
  const { open: mobileMenuOpen, close, openMenu } = useMobileMenu();
  const scrolled = useScroll(80);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isVisible = useHeaderVisibility(100);

  const { isUserAuthenticated, isLoading } = useUserProfile();

  return (
    <React.Fragment>
      <header
        className={cn(
          'fixed top-0 left-0 z-100 w-full transform transition-all duration-300',
          isVisible ? 'translate-y-0' : '-translate-y-full',
          scrolled
            ? 'bg-white/70 backdrop-blur-md'
            : 'text-brand bg-transparent'
        )}
      >
        <AnimatedWrapper type="slideInDown" delay={0}>
          <DesktopNav
            isLoading={isLoading}
            isUserAuthenticated={isUserAuthenticated}
          />

          <MobileNav openMenu={openMenu} />
        </AnimatedWrapper>
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
}: {
  isLoading: boolean;
  isUserAuthenticated: boolean;
}) => {
  const buttonClass =
    ' text-zinc-900 hover:border-b hover:border-brand hover:text-brand text-base font-primary font-semibold transition-colors duration-300 ease-in-out';

  return (
    <nav className="hidden w-full items-center gap-4 px-10 py-7 lg:flex xl:mx-auto xl:max-w-310 xl:px-0">
      <div className="flex w-full items-center justify-between">
        <BrandLogo />

        <div className="flex w-[70%] items-center justify-end gap-15">
          <div className="flex items-center gap-9">
            <Link href="#" className={buttonClass}>
              Marketplace
            </Link>

            <Link href="#" className={buttonClass}>
              Members Lounge
            </Link>
          </div>

          <div>
            {isLoading ? (
              <BrandLoader />
            ) : isUserAuthenticated ? (
              <ProfileTracker />
            ) : (
              <BrandButton asChild className="">
                <Link href="/sign-in">Sign-in</Link>
              </BrandButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const MobileNav = ({ openMenu }: { openMenu: () => void }) => {
  return (
    <nav className="flex justify-between border border-black px-4 py-2 lg:hidden">
      <BrandLogo />

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="z-50 flex h-10 w-10 cursor-pointer items-center justify-center lg:hidden"
          aria-label="Open Menu"
          onClick={openMenu}
        >
          <Menu className={cn('size-7 text-black')} />
        </button>
      </div>
    </nav>
  );
};
