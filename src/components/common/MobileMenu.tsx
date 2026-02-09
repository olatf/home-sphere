import Link from 'next/link';
import { BrandButton } from './BrandButton';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ProfileTracker } from '@/components/common/ProfileTracker';
import { BrandLogo } from './BrandLogo';
interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  isActiveUser?: boolean;
}

export const MobileMenu = ({
  open,
  onClose,
  isActiveUser,
}: MobileMenuProps) => {
  return (
    <Drawer open={open} onOpenChange={onClose} direction={'right'}>
      <DrawerContent className="bg-brand-primary z-100 min-w-full border-none! p-2">
        <div className="font-secondary size-full rounded-xl p-5 text-white">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Mobile Menu</DrawerTitle>
            <DrawerDescription>This is a mobile menu.</DrawerDescription>
          </DrawerHeader>

          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="absolute top-6 right-6 text-base font-medium md:text-[20px]"
          >
            Close
          </button>

          <div className="relative flex h-full flex-col">
            <div className="flex justify-center pt-6">
              <BrandLogo />
            </div>
            <ul className="font-primary mt-25 flex flex-col items-center space-y-10 md:space-y-16">
              <li className="text-center text-3xl font-semibold md:text-6xl">
                <Link href="#" onClick={onClose} className="group relative">
                  Marketplace
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>

              <li className="text-center text-3xl font-semibold md:text-6xl">
                <Link
                  href="/members-lounge"
                  onClick={onClose}
                  className="group relative"
                >
                  Members&apos; Lounge
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            </ul>
            {isActiveUser ? (
              <div className="mt-auto w-full">
                <ProfileTracker />
              </div>
            ) : (
              <BrandButton asChild className="absolute bottom-2 w-full">
                <Link href="/sign-in">Sign In</Link>
              </BrandButton>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
