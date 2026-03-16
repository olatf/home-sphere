'use client';

import { WalletSummary } from './WalletSummary';
import { useMemo } from 'react';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import { useUserProfile } from '@/hooks/useUserProfile';
import { VerificationStatusSteps } from '@/verification';
import { BrandLoader } from '@/components/common/BrandLoader';

export const SummaryHeader = () => {
  const { profile, isLoading } = useUserProfile();
  const verification = useVerificationStatus();

  const verificationSteps = useMemo(
    () => ({
      email: verification.isEmailVerified,
      documents: verification.isDocumentsVerified,
      live: verification.isLiveVerified,
    }),
    [
      verification.isEmailVerified,
      verification.isDocumentsVerified,
      verification.isLiveVerified,
    ]
  );

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center">
        <BrandLoader />
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-row justify-between gap-2 md:items-center md:gap-4">
      <h1 className="font-primary flex items-center gap-1 text-base font-semibold text-zinc-900 md:gap-2 md:text-xl">
        Hello, {profile?.full_name}
      </h1>

      <div className="flex items-center gap-4">
        <WalletSummary />
        <VerificationStatusSteps
          verificationSteps={verificationSteps}
          fullName={profile?.full_name}
          avatarUrl={profile?.avatar_url}
        />
      </div>
    </div>
  );
};
