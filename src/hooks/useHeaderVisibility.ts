'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Returns true while the header should be visible based on scroll position.
 * The header stays visible when the page is near the top or when the user
 * scrolls upward; it hides once the user scrolls down past the provided threshold.
 *
 * @param threshold How far (in pixels) to scroll down before hiding the header.
 */
export const useHeaderVisibility = (threshold: number = 100) => {
  const [visible, setVisible] = useState(true);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      const previous = lastScroll.current;
      lastScroll.current = current;

      if (current <= 0 || current < previous) {
        setVisible(true);
        return;
      }

      if (current > previous && current > threshold) {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return visible;
};
