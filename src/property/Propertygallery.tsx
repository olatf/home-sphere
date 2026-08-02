'use client';

import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  function onApiChange(carouselApi: CarouselApi) {
    if (!carouselApi) return;
    setApi(carouselApi);

    // Initial sync
    setCurrent(carouselApi.selectedScrollSnap());

    carouselApi.on('select', () => {
      setCurrent(carouselApi.selectedScrollSnap());
    });
  }

  if (!images.length) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <Carousel
        setApi={onApiChange}
        opts={{ loop: true }}
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {images.map((src, i) => (
            <CarouselItem key={src}>
              <div className="relative h-72 w-full md:h-96">
                <Image
                  src={src}
                  alt={`${title} — image ${i + 1}`}
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => api?.scrollPrev()}
              className="absolute top-1/2 left-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => api?.scrollNext()}
              className="absolute top-1/2 right-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div className="absolute right-3 bottom-3 z-10 rounded-full bg-black/50 px-2.5 py-1 text-white text-xs backdrop-blur-sm">
          {current + 1} / {images.length}
        </div>
      </Carousel>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto bg-gray-50 p-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => api?.scrollTo(i)}
              className={cn(
                'h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition',
                i === current
                  ? 'border-brand'
                  : 'border-transparent opacity-60 hover:opacity-100'
              )}
              aria-label={`Go to image ${i + 1}`}
            >
              <div className="relative h-full w-full">
                <Image src={src} alt="" fill className="object-cover" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
