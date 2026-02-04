import { BrandButton } from '@/components/common/BrandButton';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-linear-to-br from-gray-50 via-white to-gray-100 px-6">
      <h1 className="animate-pulse bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-8xl font-extrabold text-transparent">
        404
      </h1>

      <p className="mt-4 max-w-md text-center text-lg text-gray-600">
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>

      <BrandButton
        asChild
        className="mt-4 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 font-medium text-white shadow-lg transition-all duration-300 hover:opacity-90"
      >
        <Link href="/">Go Back Home </Link>
      </BrandButton>
    </div>
  );
}
