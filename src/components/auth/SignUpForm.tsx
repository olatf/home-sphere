'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Undo2 } from 'lucide-react';
import { SignProvidersButtons } from './SignProviderButtons';
import { registerSchema, type RegisterFormValues } from '@/lib/schemas/auth';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { getErrorMessage } from '@/helpers/error.helpers';
import { toast } from 'sonner';
import { signUp } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandInput } from '@/components/common/BrandInput';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';

export const SignUpForm = () => {
  const [isSendingOtp, startSendingOtp] = useTransition();
  const setEmail = useOnboardingStore(state => state.setEmail);
  const setStep = useOnboardingStore(state => state.setStep);
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    startSendingOtp(async () => {
      try {
        const result = await signUp(values.email);

        if (!result.success) {
          const errorMessage = getErrorMessage(result.error);
          throw new Error(errorMessage);
        }

        setEmail(values.email);
        setStep('otp_sent');
        toast.success('Magic link sent — check your email.');
        router.push(`/verify-otp?email=${values.email}`);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    });
  };

  return (
    <AnimatedWrapper type="slideInRight">
      <div className="relative mx-auto flex w-full items-center justify-center px-2 py-3 md:w-[90%] md:px-6">
        <Card className="w-full max-w-md border shadow md:border-none md:shadow-none">
          <div className="flex w-full justify-center">
            <Link
              href="/"
              className="font-primary hover:text-brand absolute -top-5 left-0 flex cursor-pointer items-center rounded-full border border-black bg-white/90 px-4 py-2 text-sm font-semibold italic shadow lg:hidden"
            >
              <Undo2 className="mr-2 size-4" />
              HomeSphere
            </Link>
            <h1 className="font-secondary mb-1 text-center text-3xl font-bold">
              More than just a Sphere{' '}
              <span className="text-brand block">Find Your Spec</span>
            </h1>
          </div>
          <h2 className="text-md font-secondary my-5 text-center">
            Sign Up to our community
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <BrandInput
                name="email"
                label="Your Email"
                type="email"
                placeholder="you@example.com"
                formRef={form}
              />

              <BrandButton type="submit" className="mx-auto my-3 w-[70%]">
                {isSendingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Register'
                )}
              </BrandButton>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background text-brand-dark px-2">Or</span>
                </div>
              </div>

              <SignProvidersButtons />

              <p className="text-muted-foreground mt-6 text-center text-sm">
                Have an Account?{' '}
                <Link
                  href="/sign-in"
                  className="text-brand-dark font-secondary font-semibold hover:underline"
                >
                  Login
                </Link>
              </p>
            </form>
          </Form>
        </Card>
      </div>
    </AnimatedWrapper>
  );
};
