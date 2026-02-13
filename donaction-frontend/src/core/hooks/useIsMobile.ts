import { useEffect, useState } from 'react';

export const MOBILE_BREAKPOINT = 768;

/**
 * SSR-safe hook that returns true when viewport is below the mobile breakpoint (768px).
 * Always returns false on the server to avoid hydration mismatches.
 */
const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    setIsMobile(mql.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isMobile;
};

export default useIsMobile;
