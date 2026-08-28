'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { resetPasswordForEmail } from '@/actions/auth';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { BrandInput } from '@/components/common/BrandInput';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { getErrorMessage } from '@/helpers/error.helpers';
import {
  type ForgotPasswordFormData,
  forgotPasswordSchema,
} from '@/lib/schemas/auth';
import { BrandButton } from '../common/BrandButton';

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
      <div className="relative flex w-full items-center justify-center rounded-lg border px-1 shadow md:mx-auto md:w-[90%] md:px-6 lg:border-none lg:shadow-none">
        <Card className="w-full space-y-10 border-none px-3 shadow-none md:max-w-md md:px-0">
          <div className="mx-auto flex flex-col justify-center">
            <Link
              href="/"
              className="absolute top-5 left-3 flex cursor-pointer items-center rounded-full bg-white/90 px-4 py-2 text-center font-primary font-semibold text-sm italic shadow hover:text-brand lg:hidden"
            >
              <Undo2 className="mr-2 size-4" />
              HomeSphere
            </Link>
            <div>
              <h1 className="mt-20 mb-1 text-center font-bold font-secondary text-3xl">
                Forgot Password?
              </h1>
              <p className="mt-5 mb-1 text-center font-normal font-secondary text-base">
                Enter your registered email to set ur password.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-1 space-y-3 md:space-y-5"
            >
              <BrandInput
                name="email"
                label="Your Email"
                type="email"
                placeholder="you@example.com"
                required
                leftElement={<Mail className="size-4" />}
                formRef={form}
              />

              <BrandButton
                type="submit"
                className="mx-auto w-[70%]"
                leftIcon={<Loader2 className="size-4 animate-spin" />}
              >
                {sendingOtp ? <>Resetting...</> : ' Reset '}
              </BrandButton>
            </form>
          </Form>
        </Card>
      </div>
    </AnimatedWrapper>
  );
};
