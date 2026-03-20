'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Send, CreditCard, ArrowUp } from 'lucide-react';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import { BrandToast } from '@/components/common/BrandToolTip';
import { usePayment } from '@/hooks/usePayment';

const TopUpModal = dynamic(
  () => import('@/wallets/TopUpModal').then(m => m.TopUpModal),
  { ssr: false, loading: () => null }
);

const WithdrawModal = dynamic(
  () => import('@/wallets/WithdrawModal').then(m => m.WithdrawModal),
  { ssr: false, loading: () => null }
);

const TransferModal = dynamic(
  () => import('@/wallets/TransferModal').then(m => m.TransferModal),
  { ssr: false, loading: () => null }
);

type ModalType = 'topup' | 'withdraw' | 'transfer' | null;

export const WalletActions = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showToast, setShowToast] = useState(false);

  const { profile: user, isLoading } = useUserProfile();
  const { isFullyVerified } = useVerificationStatus();
  const { openPayment } = usePayment();

  const showVerificationToast = useCallback(() => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const actions = [
    {
      name: 'Top Up',
      icon: Plus,
      description: 'Add funds',
      onClick: () => setActiveModal('topup'),
    },
    {
      name: 'Withdraw',
      icon: ArrowUp,
      description: 'To bank account',
      onClick: () => setActiveModal('withdraw'),
    },
    {
      name: 'Renew Rent',
      icon: CreditCard,
      description: 'Pay rent',
      onClick: () => {
        openPayment({
          amount: 100000,
          label: 'Rent Payment',
          description: 'Rent for House 1',
          transactionType: 'rent_payment',
          receiverWalletId: '123456',
        });
      },
    },
    {
      name: 'Transfer',
      icon: Send,
      description: 'Send funds',
      onClick: () => setActiveModal('transfer'),
    },
  ];

  if (isLoading) return <WalletActionsSkeleton />;

  return (
    <>
      <AnimatedWrapper type="slideInUp">
        <div className="mx-3 mt-5 grid grid-cols-2 gap-4 md:mx-7 md:mt-7 md:grid-cols-4">
          {actions.map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.name}
                onClick={isFullyVerified ? a.onClick : showVerificationToast}
                className={`hover:border-brand-light flex flex-col items-center gap-3 rounded-xl border bg-white p-6 transition hover:shadow-md active:scale-95 ${
                  !isFullyVerified ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <div className="bg-brand flex h-10 w-10 items-center justify-center rounded-full text-white">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-medium text-gray-800">
                    {a.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-400">
                    {a.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </AnimatedWrapper>

      <BrandToast
        show={showToast}
        content="Complete your verification to carry out wallet actions."
      />

      <TopUpModal
        isOpen={activeModal === 'topup'}
        onClose={() => setActiveModal(null)}
        userEmail={user?.email ?? ''}
      />

      <WithdrawModal
        isOpen={activeModal === 'withdraw'}
        onClose={() => setActiveModal(null)}
      />

      <TransferModal
        isOpen={activeModal === 'transfer'}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
};

function WalletActionsSkeleton() {
  return (
    <div className="m-7 grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex h-28 animate-pulse flex-col items-center gap-3 rounded-xl border bg-linear-to-br from-slate-100 via-slate-200 to-slate-100 p-8 shadow-sm"
        />
      ))}
    </div>
  );
}
