import { useUserProfile } from '@/hooks/useUserProfile';

type VerificationStatus = {
  isEmailVerified: boolean;
  isDocumentsVerified: boolean;
  isLiveVerified: boolean;
  isFullyVerified: boolean;
  canVerifyLive: boolean;
  needsDocumentsReUpload: boolean;
  isLoading: boolean;
  verificationStatus: string | null;
};

export const useVerificationStatus = (): VerificationStatus => {
  const { profile, isLoading: profileLoading } = useUserProfile();

  const isEmailVerified = !!profile?.is_email_verified;
  const isDocumentsVerified = !!profile?.is_documents_verified;
  const isLiveVerified = !!profile?.is_live_verified;

  const isFullyVerified =
    isDocumentsVerified &&
    isLiveVerified &&
    profile?.verification_status === 'fully_verified';

  const canVerifyLive =
    isDocumentsVerified &&
    profile?.verification_status === 'documents_approved' &&
    !isLiveVerified;

  const needsDocumentsReUpload =
    profile?.verification_status === 'documents_failed' ||
    (profile?.verification_status === 'documents_submitted' &&
      !isDocumentsVerified);

  return {
    isEmailVerified,
    isDocumentsVerified,
    isLiveVerified,
    isFullyVerified,
    canVerifyLive,
    needsDocumentsReUpload,
    isLoading: profileLoading,
    verificationStatus: profile?.verification_status || 'not_started',
  };
};
