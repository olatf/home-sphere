import { House } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const BrandLogo = ({ isScrolled }: { isScrolled?: boolean }) => {
  return (
    <Link href="/" className="mx-0 flex items-center md:mx-6">
      <House
        className={isScrolled ? 'size-8 text-brand' : 'size-8 text-white'}
      />
      <span
        className={cn(
          'ml-1 font-bold font-secondary text-foreground text-md lg:ml-2 lg:text-xl',
          isScrolled ? 'text-brand' : 'text-white'
        )}
      >
        HomeSphere
      </span>
    </Link>
  );
};
