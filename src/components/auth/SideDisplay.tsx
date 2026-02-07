'use client';

import Image from 'next/image';
import { Undo2 } from 'lucide-react';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import Link from 'next/link';
import { safeStr } from '@/helpers/data.helpers';
import { useSideDisplayMedia } from '@/hooks/useSideDisplayMedia';

export const SideDisplay = () => {
  const currentMedia = useSideDisplayMedia();
  return (
    <AnimatedWrapper type="slideInLeft">
      <div className="relative hidden h-[90%] rounded-2xl! bg-transparent! lg:block">
        <Image
          src={safeStr(currentMedia?.src)}
          alt={safeStr(currentMedia?.alt)}
          fill
          className="object-fit hover:scale(105) h-full w-full rounded-2xl object-cover transition-all duration-300 ease-in-out"
          priority
        />

        <div className="absolute inset-0 rounded-2xl bg-black/30" />

        <Link
          href="/"
          className="font-primary hover:text-brand absolute top-6 left-6 flex cursor-pointer items-center rounded-full bg-white/90 px-4 py-2 text-sm font-semibold italic shadow"
        >
          <Undo2 className="mr-2 size-4" />
          HomeSphere
        </Link>

        <div className="absolute bottom-10 left-10 max-w-md text-white">
          <h2 className="mb-2 text-2xl font-semibold">
            Manage Properties Efficiently
          </h2>
          <p className="text-sm text-white/90">
            Easily track rent payments, maintenance requests, and tenant
            communications in one place. Say goodbye to manual management.
          </p>
        </div>
      </div>
    </AnimatedWrapper>
  );
};
