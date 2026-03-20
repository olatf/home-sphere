'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BrandButton } from '@/components/common/BrandButton';
import { useState, useTransition } from 'react';
import { updateWalletPin } from '@/actions/wallets';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { getErrorMessage } from '@/helpers/error.helpers';
import { Loader2 } from 'lucide-react';
import { BrandKeyPad } from '@/components/common/BrandKeyPad';
import { useInvalidateWallet } from '@/hooks/Useinvalidatewallet';

type Step = 'old' | 'new';

export const UpdateWalletPin = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [step, setStep] = useState<Step>('old');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isUpdating, startUpdating] = useTransition();
  const { invalidate } = useInvalidateWallet();

  const activePin = step === 'old' ? oldPin : newPin;
  const setActivePin = step === 'old' ? setOldPin : setNewPin;

  function handleClose() {
    setStep('old');
    setOldPin('');
    setNewPin('');
    onClose();
  }

  const handleContinue = () => {
    if (activePin.length !== 4) {
      toast.error('PIN must be 4 digits.');
      return;
    }

    if (step === 'old') {
      setStep('new');
      return;
    }

    handleSubmit();
  };

  const handleSubmit = () => {
    if (newPin.length !== 4) {
      toast.error('New PIN must be 4 digits.');
      return;
    }

    startUpdating(async () => {
      try {
        const result = await updateWalletPin(oldPin, newPin);

        if (!result.success) {
          toast.error(result.error || 'Something went wrong');
          setStep('old');
          setOldPin('');
          setNewPin('');
          return;
        }

        toast.success('Wallet PIN updated successfully!');
        await invalidate();
        handleClose();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  };

  const otpSlotClass = `
    min-h-11 min-w-11
    rounded-[10px]
    border border-brand
    ring-0
    text-base font-medium text-[#535A63]
    has-[input:focus-visible]:bg-brand-light/30
    has-[input:focus-visible]:border-brand
    transition-colors
    text-brand-light
    bg-gray-50  focus:bg-white
  `;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {step === 'old' ? 'Enter Current PIN' : 'Enter New PIN'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center gap-2">
            {(['old', 'new'] as Step[]).map(s => (
              <div
                key={s}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  step === s ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <InputOTP maxLength={4} value={activePin} onChange={setActivePin}>
              <InputOTPGroup className="gap-4">
                <InputOTPSlot index={0} className={otpSlotClass} />
                <InputOTPSlot index={1} className={otpSlotClass} />
                <InputOTPSlot index={2} className={otpSlotClass} />
                <InputOTPSlot index={3} className={otpSlotClass} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <BrandKeyPad pin={activePin} setPin={setActivePin} />

          <div className="flex gap-3">
            {step === 'new' && (
              <BrandButton
                onClick={() => {
                  setStep('old');
                  setNewPin('');
                }}
                disabled={isUpdating}
                className="flex-1 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                Back
              </BrandButton>
            )}
            <BrandButton
              onClick={handleContinue}
              disabled={isUpdating || activePin.length !== 4}
              className="bg-brand hover:brand-dark/80 w-full text-white"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : step === 'old' ? (
                'Continue'
              ) : (
                'Update PIN'
              )}
            </BrandButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
