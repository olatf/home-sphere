'use client';

import React, { useEffect, useState } from 'react';
import { BrandLoader } from '@/components/common/BrandLoader';
import { SMILE_OS_ENV } from '@/config/constants';

interface VerifyLiveProps {
  userId: string;
}

type Config = {
  partnerId: string;
  timestamp: string;
  signature: string;
  environment: string;
  callbackUrl: string;
  userId: string;
  jobType: number;
};

export const VerifyLive = ({ userId }: VerifyLiveProps) => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initSmile = async () => {
      try {
        // Load web component
        await import('@smileid/web-components');

        // Get signed config from backend
        const res = await fetch('/api/smile/generate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (!res.ok) {
          throw new Error('Failed to get verification config');
        }

        const data = await res.json();

        setConfig({
          partnerId: data.partnerId,
          timestamp: data.timestamp,
          signature: data.signature,
          environment: SMILE_OS_ENV,
          callbackUrl: `${window.location.origin}/api/smile/webhook`,
          userId,
          jobType: 2, // 2 = Liveness only
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to initialize verification'
        );
      } finally {
        setLoading(false);
      }
    };

    initSmile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-gray-500">
        <BrandLoader />
        <p>Preparing live verification...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-gray-500">
        <p>Unable to load verification. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {React.createElement('smile-id-web', {
        'partner-id': config.partnerId,
        timestamp: config.timestamp,
        signature: config.signature,
        environment: config.environment,
        'callback-url': config.callbackUrl,
        'user-id': config.userId,
        'job-type': config.jobType,
        style: { width: '100%', height: '600px' },
      })}
    </div>
  );
};
