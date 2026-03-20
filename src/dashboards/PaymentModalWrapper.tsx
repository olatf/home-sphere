'use client';

import dynamic from 'next/dynamic';

const PaymentModal = dynamic(
  () => import('@/wallets').then(m => m.PaymentModal),
  { ssr: false, loading: () => null }
);

interface PaymentModalWrapperProps {
  userEmail: string;
}

export function PaymentModalWrapper({ userEmail }: PaymentModalWrapperProps) {
  return <PaymentModal userEmail={userEmail} />;
}
