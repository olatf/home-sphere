'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { signUp } from '@/actions/auth';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandInput } from '@/components/common/BrandInput';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { getErrorMessage } from '@/helpers/error.helpers';
import { type RegisterFormValues, registerSchema } from '@/lib/schemas/auth';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { SignProvidersButtons } from './SignProviderButtons';

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
          toast.error(errorMessage);
          return;
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
      <div className="relative flex w-full items-center justify-center rounded-lg border px-1 shadow md:mx-auto md:w-[89%] md:max-w-md md:px-6 lg:w-[90%] lg:border-none lg:shadow-none">
        <Card className="w-full border-none px-3 shadow-none md:px-0">
          <div className="mx-auto flex justify-center">
            <Link
              href="/"
              className="absolute top-5 left-3 flex cursor-pointer items-center rounded-full bg-white/90 px-4 py-2 text-center font-primary font-semibold text-sm italic shadow hover:text-brand lg:hidden"
            >
              <Undo2 className="mr-2 size-4" />
              HomeSphere
            </Link>
            <h1 className="mt-10 mb-1 text-center font-bold font-secondary text-3xl">
              More than just a Sphere{' '}
              <span className="block text-brand">Find Your Spec</span>
            </h1>
          </div>
          <h2 className="my-5 text-center font-secondary text-md">
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
                required
                leftElement={<Mail className="size-4" />}
              />

              <div className="flex justify-center">
                <BrandButton
                  type="submit"
                  className="mx-auto my-3 w-[70%]"
                  disabled={isSendingOtp}
                  leftIcon={
                    isSendingOtp ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null
                  }
                >
                  {isSendingOtp ? <>Loading...</> : 'Register'}
                </BrandButton>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-brand-dark">Or</span>
                </div>
              </div>

              <SignProvidersButtons />

              <p className="mt-6 text-center text-muted-foreground text-sm">
                Have an Account?{' '}
                <Link
                  href="/sign-in"
                  className="font-secondary font-semibold text-brand-dark hover:underline"
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
