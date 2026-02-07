'use client';

import { useEffect, useState } from 'react';
import { SideDisplayMedia } from '@/config/constants';

export const useSideDisplayMedia = (intervalMs = 5000) => {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * SideDisplayMedia.length)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(prev => (prev === SideDisplayMedia.length - 1 ? 0 : prev + 1));
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);

  return SideDisplayMedia[index];
};
