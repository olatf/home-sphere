import Link from 'next/link';
import { ProfileTracker } from '@/components/common/ProfileTracker';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { headerLinks } from '@/data/HeaderLinks';
import { BrandButton } from './BrandButton';
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
      <DrawerContent className="z-100 min-w-full border-none! bg-zinc-900 p-2 text-center">
        <div className="size-full rounded-xl p-5 font-secondary text-white">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Mobile Menu</DrawerTitle>
            <DrawerDescription>This is a mobile menu.</DrawerDescription>
          </DrawerHeader>

          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="absolute top-6 right-6 font-medium text-base md:text-[20px]"
          >
            Close
          </button>

          <div className="relative flex h-full flex-col">
            <div className="flex justify-center pt-6">
              <BrandLogo />
            </div>
            <ul className="mt-25 flex flex-col items-center space-y-10 font-primary md:space-y-16">
              {headerLinks.map(link => (
                <li
                  key={link.name}
                  className="text-center font-semibold text-3xl md:text-6xl"
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="group relative"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
            {isActiveUser ? (
              <div className="mt-auto w-full">
                <ProfileTracker />
              </div>
            ) : (
              <BrandButton
                asChild
                variant="primary"
                className="absolute bottom-2 min-h-15 w-full"
              >
                <Link href="/sign-in">Sign In</Link>
              </BrandButton>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
