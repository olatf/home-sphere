'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Undo2 } from 'lucide-react';

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/schemas/auth';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { getErrorMessage } from '@/helpers/error.helpers';
import { toast } from 'sonner';
import { resetPasswordForEmail } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import { BrandButton } from '../common/BrandButton';
import { BrandInput } from '@/components/common/BrandInput';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';

export const ForgotPasswordForm = () => {
  const router = useRouter();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const [sendingOtp, startSendingotp] = useTransition();

  const onSubmit = async (values: ForgotPasswordFormData) => {
    startSendingotp(async () => {
      try {
        const result = await resetPasswordForEmail(values.email);

        if (!result.success) {
          const errorMessage = getErrorMessage(result.error);
          toast.error(errorMessage);
          return;
        }
        toast.success('Magic link sent — Please check your email.');
        router.push(`/verify-otp?email=${values.email}&mode=forgot-password`);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    });
  };

  return (
    <AnimatedWrapper type="slideInRight">
      <div className="relative mx-auto mt-20 flex w-full items-center justify-center px-1 md:w-[90%] md:px-6">
        <Card className="flex w-full max-w-md border shadow md:border-none md:shadow-none">
          <div className="mx-auto flex justify-center">
            <Link
              href="/"
              className="font-primary hover:text-brand absolute -top-10 left-0 flex cursor-pointer items-center rounded-full bg-white/90 px-4 py-2 text-center text-sm font-semibold italic shadow lg:hidden"
            >
              <Undo2 className="mr-2 size-4" />
              HomeSphere
            </Link>
            <h1 className="font-secondary mb-1 text-center text-3xl font-bold">
              Forgot Password?
            </h1>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-1 space-y-3 md:mt-7 md:space-y-5"
            >
              <BrandInput
                name="email"
                label="Your Email"
                type="email"
                placeholder="you@example.com"
                formRef={form}
              />

              <BrandButton type="submit" className="mx-auto w-[70%]">
                {sendingOtp ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  ' Reset '
                )}
              </BrandButton>
            </form>
          </Form>
        </Card>
      </div>
    </AnimatedWrapper>
  );
};
