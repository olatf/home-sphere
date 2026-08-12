import Image from 'next/image';
import Link from 'next/link';

export const BrandLogo = ({ isScrolled }: { isScrolled?: boolean }) => {
  const imgSrc = isScrolled
    ? '/images/logo-white.webp'
    : '/images/logo-green.webp';

  return (
    <Link href="/" className="mx-0 flex items-center md:mx-6">
      <Image
        src={imgSrc}
        alt="Brand Logo"
        width={150}
        height={40}
        className="h-auto w-full"
        priority
      />
    </Link>
  );
};
