'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Undo2 } from 'lucide-react';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/schemas/auth';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { getErrorMessage } from '@/helpers/error.helpers';
import { toast } from 'sonner';
import { resetPassword } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import { BrandButton } from '../common/BrandButton';
import { BrandInput } from '@/components/common/BrandInput';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';

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
              className="font-primary hover:text-brand absolute top-5 left-3 flex cursor-pointer items-center rounded-full bg-white/90 px-4 py-2 text-center text-sm font-semibold italic shadow lg:hidden"
            >
              <Undo2 className="mr-2 size-4" />
              HomeSphere
            </Link>
            <h1 className="font-secondary mt-10 mb-1 text-center text-3xl font-bold">
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
                  formRef={form}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
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
                  formRef={form}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <BrandButton type="submit" className="mx-auto w-[70%]">
                {resetting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </BrandButton>
            </form>
          </Form>
        </Card>
      </div>
    </AnimatedWrapper>
  );
};
