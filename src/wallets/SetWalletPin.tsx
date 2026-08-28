'use client';

import { Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { setWalletPin as setWalletPinAction } from '@/actions/wallets';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandKeyPad } from '@/components/common/BrandKeyPad';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { getErrorMessage } from '@/helpers/error.helpers';
import { useInvalidateWallet } from '@/hooks/Useinvalidatewallet';

export const SetWalletPin = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [pin, setPin] = useState('');
  const [isUpdating, startUpdating] = useTransition();
  const { invalidate } = useInvalidateWallet();

  const handleSubmit = () => {
    if (pin.length !== 4) {
      toast.error('Wallet PIN must be 4 digits.');
      return;
    }

    startUpdating(async () => {
      try {
        const result = await setWalletPinAction(pin);

        if (!result.success) {
          toast.error(result.error || 'Something went wrong');
          return;
        }

        setPin('');
        toast.success('Your wallet PIN has been set!');
        await invalidate();
        onClose();
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Set Wallet PIN</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={4} value={pin} onChange={setPin}>
              <InputOTPGroup className="gap-4">
                <InputOTPSlot index={0} className={otpSlotClass} />
                <InputOTPSlot index={1} className={otpSlotClass} />
                <InputOTPSlot index={2} className={otpSlotClass} />
                <InputOTPSlot index={3} className={otpSlotClass} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <BrandKeyPad pin={pin} setPin={setPin} />

          <BrandButton
            onClick={handleSubmit}
            disabled={isUpdating || pin.length !== 4}
            className="hover:brand-dark/80 w-full bg-brand text-white"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting PIN...
              </>
            ) : (
              'Set Wallet PIN'
            )}
          </BrandButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
