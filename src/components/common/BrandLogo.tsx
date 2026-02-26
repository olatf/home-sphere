import { House } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const BrandLogo = ({ isScrolled }: { isScrolled?: boolean }) => {
  return (
    <Link href="/" className="flex items-center">
      <House
        className={isScrolled ? 'text-brand size-8' : 'size-8 text-white'}
      />
      <span
        className={cn(
          'font-secondary text-foreground text-md ml-1 font-bold lg:ml-2 lg:text-xl',
          isScrolled ? 'text-brand' : 'text-white'
        )}
      >
        HomeSphere
      </span>
    </Link>
  );
};
