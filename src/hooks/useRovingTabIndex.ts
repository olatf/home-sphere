'use client';

import { type KeyboardEvent, useCallback, useRef, useState } from 'react';

interface UseRovingTabIndexOptions {
  itemCount: number;
  orientation?: 'vertical' | 'horizontal' | 'both';
  loop?: boolean;
  onSelect?: (index: number) => void;
}

export function useRovingTabIndex({
  itemCount,
  orientation = 'vertical',
  loop = true,
  onSelect,
}: UseRovingTabIndexOptions) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const focusItem = useCallback((index: number) => {
    setActiveIndex(index);
    itemRefs.current[index]?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (itemCount === 0) return;

      const isNext =
        event.key === 'ArrowDown' ||
        (orientation === 'horizontal' && event.key === 'ArrowRight');
      const isPrev =
        event.key === 'ArrowUp' ||
        (orientation === 'horizontal' && event.key === 'ArrowLeft');

      let nextIndex: number | null = null;

      if (isNext) nextIndex = activeIndex + 1;
      else if (isPrev) nextIndex = activeIndex - 1;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = itemCount - 1;
      else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect?.(activeIndex);
        return;
      } else return;

      event.preventDefault();

      if (nextIndex < 0) nextIndex = loop ? itemCount - 1 : 0;
      if (nextIndex >= itemCount) nextIndex = loop ? 0 : itemCount - 1;

      focusItem(nextIndex);
    },
    [activeIndex, itemCount, orientation, loop, onSelect, focusItem]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      ref: (el: HTMLElement | null) => {
        itemRefs.current[index] = el;
      },
      tabIndex: index === activeIndex ? 0 : -1,
      onFocus: () => setActiveIndex(index),
    }),
    [activeIndex]
  );

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    getItemProps,
    focusItem,
  };
}
