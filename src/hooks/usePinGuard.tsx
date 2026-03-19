'use client';

import { useState, useCallback } from 'react';
import { PinPromptModal } from '@/wallets';

interface GuardOptions {
  title?: string;
  subtitle?: string;
  onVerified: () => void;
}

export function usePinGuard() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<GuardOptions | null>(null);

  const guardWithPin = useCallback((opts: GuardOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  function handleVerified() {
    setIsOpen(false);
    options?.onVerified();
  }

  function handleClose() {
    setIsOpen(false);
    setOptions(null);
  }

  const PinModal = (
    <PinPromptModal
      isOpen={isOpen}
      title={options?.title}
      subtitle={options?.subtitle}
      onVerified={handleVerified}
      onClose={handleClose}
    />
  );

  return { guardWithPin, PinModal };
}
