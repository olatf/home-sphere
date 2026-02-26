import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/actions/auth';

export function useUserProfile() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const result = await getUserProfile();

      if (!result.success) {
        return null;
      }

      return result.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    isUserAuthenticated: !!data,
    isOnboarded: data?.onboarding_complete,
    profile: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
