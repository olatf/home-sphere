'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Returns a single `invalidate()` function that clears all wallet-related
 * query caches at once — balance, transactions, and chart data.
 */
export function useInvalidateWallet() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['user-wallet'] }),
      queryClient.invalidateQueries({ queryKey: ['wallet-chart-data'] }),
    ]);
  }, [queryClient]);

  return { invalidate };
}
