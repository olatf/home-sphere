'use client';

import { useSyncExternalStore } from 'react';

export const useMediaQuery = (query: string) => {
  const getSnapshot = () =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches;

  const subscribe = (callback: () => void) => {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const mediaQueryList = window.matchMedia(query);
    const listener = () => callback();

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
      return () => mediaQueryList.removeEventListener('change', listener);
    }

    mediaQueryList.addListener(listener);
    return () => mediaQueryList.removeListener(listener);
  };

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
};
