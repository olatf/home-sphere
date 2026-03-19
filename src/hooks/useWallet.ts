import { useQuery } from '@tanstack/react-query';
import { getUserWallet, getUserWalletTransactions } from '@/actions/wallets';

export function useUserWallet() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-wallet'],
    queryFn: async () => {
      const [walletRes, txRes] = await Promise.all([
        getUserWallet(),
        getUserWalletTransactions(),
      ]);

      if (!walletRes.success) {
        throw new Error(walletRes.error);
      }

      if (!txRes.success) {
        throw new Error(txRes.error);
      }

      return {
        wallet: walletRes.data,
        transactions: txRes.data,
      };
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    wallet: data?.wallet ?? null,
    transactions: data?.transactions ?? [],
    isLoading,
    error,
    refetch,
  };
}
