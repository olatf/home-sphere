'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrandButton } from '@/components/common/BrandButton';
import { cn } from '@/lib/utils';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <BrandButton
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed right-5 bottom-5 z-50 cursor-pointer rounded-full p-3 shadow-lg',
        'bg-black text-white transition-all duration-300 hover:bg-gray-800',
        'hover:-translate-y-1 hover:scale-110',
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      )}
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </BrandButton>
  );
}
