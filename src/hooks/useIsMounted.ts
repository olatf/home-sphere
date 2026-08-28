import { useEffect, useState } from 'react';

/**
 * Hook to detect if a component has mounted on the client
 *
 * Useful for preventing SSR hydration mismatches when you need to access
 * client-only APIs (window, localStorage, device detection, etc.) or render
 * different content on client vs server.
 *
 * @returns boolean indicating if the component has mounted
 *
 * @example
 * ```typescript
 * const isMounted = useIsMounted();
 *
 * if (!isMounted) return null; // Prevent hydration mismatch
 *
 * return <ClientOnlyComponent />;
 * ```
 *
 * @example
 * ```typescript
 * const isMounted = useIsMounted();
 * const deviceType = isMounted ? isMobile() : false;
 *
 * return deviceType ? <MobileView /> : <DesktopView />;
 * ```
 *
 * @example
 * ```typescript
 * // Conditional rendering based on client-side state
 * const isMounted = useIsMounted();
 *
 * if (!isMounted) {
 *   return <SkeletonLoader />; // Show placeholder during SSR
 * }
 *
 * return <div>{window.innerWidth}px</div>;
 * ```
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  return mounted;
}
