'use client';

import { useState, useTransition } from 'react';
import { verifyOtp, resendOtp } from '@/actions/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import AnimatedWrapper from '../common/AnimatedWrapper';
import { BrandButton } from '@/components/common/BrandButton';
import { getErrorMessage } from '@/helpers/error.helpers';

interface VerifyOtpFormProps {
  email: string;
  mode?: string;
}

export const VerifyOtpForm = ({ mode, email }: VerifyOtpFormProps) => {
  const router = useRouter();
  const { setStep } = useOnboardingStore();
  const [otp, setOtp] = useState('');
  const [isVerifying, startVerifying] = useTransition();
  const [isResending, startResending] = useTransition();

  const verifyOtpCode = () => {
    if (otp.length !== 6) {
      toast.error('Enter all 6 digits.');
      return;
    }

    startVerifying(async () => {
      try {
        const result = await verifyOtp(email!, otp);
        if (!result.success) {
          const errorMessage = getErrorMessage('Invalid or expired OTP');
          toast.error(errorMessage);
          return;
        }
        if (mode === 'forgot-password') {
          router.push(`/reset-password?email=${encodeURIComponent(email!)}`);
          return;
        }

        setStep('otp_verified');
        toast.success('Email verified!');
        router.push(`/complete-profile?email=${encodeURIComponent(email!)}`);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        toast.error(errorMessage);
      }
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtpCode();
  };

  const handleResend = () => {
    startResending(async () => {
      try {
        const result = await resendOtp(email!);
        if (result.success) {
          toast.success('A new OTP has been sent to your email.');
          setOtp('');
        } else {
          const errorMessage = getErrorMessage(result.error);
          toast.error(errorMessage);
        }
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        toast.error(errorMessage);
      }
    });
  };

  const otpSlotClass = `
  min-h-11 min-w-11
  rounded-[24px]
  border border-[#D0D5DD]
  text-base font-medium text-[#535A63]

  has-[input:focus-visible]:border-brand-primary-dark
  has-[input:focus-visible]:ring-1
  has-[input:focus-visible]:ring-brand-primary-dark
  transition-colors
`;

  return (
    <section className="mx-auto flex min-h-[85vh] w-full max-w-3xl flex-col justify-center py-14">
      <AnimatedWrapper type="slideInRight">
        <div className="my-8 text-center">
          <h1 className="font-secondary text-[40px] leading-[1.2] font-normal">
            Verify OTP
          </h1>
          <div className="font-secondary my-9 text-center text-lg leading-normal font-medium">
            We sent a code to{' '}
            <span className="text-brand-primary-light">{email}</span>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex w-full flex-col items-center justify-center gap-6"
          >
            <div className="flex w-full justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                onComplete={verifyOtpCode}
              >
                <InputOTPGroup className="gap-4">
                  <InputOTPSlot index={0} className={otpSlotClass} />
                  <InputOTPSlot index={1} className={otpSlotClass} />
                  <InputOTPSlot index={2} className={otpSlotClass} />
                  <InputOTPSlot index={3} className={otpSlotClass} />
                  <InputOTPSlot index={4} className={otpSlotClass} />
                  <InputOTPSlot index={5} className={otpSlotClass} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <BrandButton
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              className="w-[70%]"
            >
              {isVerifying ? 'Verifying...' : 'Verify OTP'}
            </BrandButton>

            <div className="flex items-center gap-2 text-sm text-[#535A63]">
              <span className="font-secondary">
                Didn&apos;t receive a code?
              </span>
              <Button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                variant="ghost"
                className="font-secondary text-brand-primary-light h-auto p-0 text-base font-medium underline-offset-2 hover:underline"
              >
                {isResending ? 'Resending...' : 'Resend'}
              </Button>
            </div>
          </form>
        </div>
      </AnimatedWrapper>
    </section>
  );
};
