import { House } from 'lucide-react';
import Link from 'next/link';

export const BrandLogo = () => {
  return (
    <Link href="/" className="flex items-center">
      <House className="text-brand size-8" />
      <span className="font-secondary text-foreground text-md ml-1 font-bold lg:ml-2 lg:text-xl">
        HomeSphere
      </span>
    </Link>
  );
};
