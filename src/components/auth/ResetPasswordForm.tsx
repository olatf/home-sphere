'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { resetPassword } from '@/actions/auth';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { BrandInput } from '@/components/common/BrandInput';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { getErrorMessage } from '@/helpers/error.helpers';
import {
  type ResetPasswordFormData,
  resetPasswordSchema,
} from '@/lib/schemas/auth';
import { BrandButton } from '../common/BrandButton';

export const ResetPasswordForm = ({ email }: { email: string }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const [resetting, startResetting] = useTransition();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: ResetPasswordFormData) => {
    startResetting(async () => {
      try {
        if (!email) {
          toast.error('Email is missing.');
          router.push('/sign-up');
          return;
        }
        const result = await resetPassword(values.password, email);
        if (!result.success) {
          const errorMessage = getErrorMessage(result.error);
          toast.error(errorMessage);
          return;
        }
        toast.success('Password reset successfully!');
        router.push('/dashboard');
      } catch (e) {
        const errorMessage = getErrorMessage(e);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <AnimatedWrapper type="slideInRight">
      <div className="relative flex w-full items-center justify-center px-1 md:mx-auto md:w-[90%] md:px-6">
        <Card className="w-full border px-3 shadow md:max-w-md md:border-none md:px-0 md:shadow-none">
          <div className="mx-auto flex justify-center">
            <Link
              href="/"
              className="absolute top-5 left-3 flex cursor-pointer items-center rounded-full bg-white/90 px-4 py-2 text-center font-primary font-semibold text-sm italic shadow hover:text-brand lg:hidden"
            >
              <Undo2 className="mr-2 size-4" />
              HomeSphere
            </Link>
            <h1 className="mt-10 mb-1 text-center font-bold font-secondary text-3xl">
              Reset Your Account Password!
            </h1>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-1 space-y-3 md:mt-7 md:space-y-7"
            >
              <div className="relative">
                <BrandInput
                  name="password"
                  label="Your Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="*******"
                  required
                  leftElement={<Lock className="size-4 text-gray-400" />}
                  formRef={form}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <BrandInput
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="*******"
                  required
                  leftElement={<Lock className="size-4 text-gray-400" />}
                  formRef={form}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <BrandButton
                type="submit"
                className="mx-auto w-[70%]"
                leftIcon={
                  resetting ? <Loader2 className="size-4 animate-spin" /> : null
                }
              >
                {resetting ? <>Resetting Password...</> : 'Reset Password'}
              </BrandButton>
            </form>
          </Form>
        </Card>
      </div>
    </AnimatedWrapper>
  );
};
