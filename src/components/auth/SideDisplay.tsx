'use client';

import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import { Undo2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { BrandButton } from '@/components/common/BrandButton';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { MediaSlider } from '@/data/MediaSlider';
import { cn } from '@/lib/utils';

export const SideDisplay = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setActiveIndex(api.selectedScrollSnap());
    };

    onSelect();
    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);
  return (
    <AnimatedWrapper type="slideInLeft">
      <div className="relative mt-10 hidden h-[95%] rounded-2xl! bg-transparent! lg:block">
        <Carousel
          opts={{
            loop: true,
            watchDrag: false,
          }}
          setApi={setApi}
          plugins={[
            Fade(),
            Autoplay({
              delay: 5000,
              playOnInit: true,
            }),
          ]}
          className="h-full w-full overflow-hidden rounded-2xl [&>div]:h-full"
        >
          <CarouselContent className="h-full">
            {MediaSlider.map(slide => (
              <SlideItem key={slide.alt} {...slide} />
            ))}
          </CarouselContent>

          <div className="absolute top-4 right-4 flex h-5! gap-2">
            {MediaSlider.map((slide, idx) => {
              return (
                <BrandButton
                  type="button"
                  key={slide.alt}
                  onClick={() => api?.scrollTo(idx)}
                  className={cn(
                    'h-3 w-3 cursor-pointer rounded-full transition-all duration-200',
                    activeIndex === idx ? 'w-7 bg-white' : 'bg-white/50'
                  )}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              );
            })}
          </div>
        </Carousel>

        <Link
          href="/"
          className="absolute top-6 left-6 flex cursor-pointer items-center rounded-full bg-white/90 px-4 py-2 font-primary font-semibold text-sm italic shadow hover:text-brand"
        >
          <Undo2 className="mr-2 size-4" />
          HomeSphere
        </Link>
      </div>
    </AnimatedWrapper>
  );
};

const SlideItem = ({ src, alt }: { src: string; alt: string }) => (
  <CarouselItem className="relative h-full w-full">
    <Image src={src} fill alt={alt} className="object-cover" />

    <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/40 to-black" />
    <div className="absolute bottom-10 left-10 max-w-md text-white">
      <h2 className="mb-2 font-semibold text-2xl">
        Manage Properties Efficiently
      </h2>
      <p className="text-sm text-white/90">
        Easily track rent payments, maintenance requests, and tenant
        communications in one place. Say goodbye to manual management.
      </p>
    </div>
  </CarouselItem>
);
