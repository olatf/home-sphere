'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Undo2 } from 'lucide-react';
import {
  setPasswordSchema,
  type SetPasswordFormValues,
} from '@/lib/schemas/auth';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { getErrorMessage } from '@/helpers/error.helpers';
import { toast } from 'sonner';
import { completeProfile } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import { BrandButton } from '../common/BrandButton';
import { BrandInput } from '@/components/common/BrandInput';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';

export const CompleteProfileForm = ({ email }: { email: string }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, startLoading] = useTransition();
  const { setStep, reset } = useOnboardingStore();
  const router = useRouter();

  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      full_name: '',
      confirmPassword: '',
      password: '',
    },
  });

  const onSubmit = (values: SetPasswordFormValues) => {
    startLoading(async () => {
      try {
        if (!email) {
          toast.error('Email is missing.');
          reset();
          router.push('/sign-up');
          return;
        }

        await completeProfile({
          full_name: values.full_name,
          password: values.password,
        });

        setStep('completed');
        toast.success('Profile completed successfully!');

        reset();
        router.push('/onboarding');
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
              Set Your Account Password!
            </h1>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-1 space-y-3 md:mt-7 md:space-y-7"
            >
              <BrandInput
                name="full_name"
                label="Your Full Name"
                type="text"
                placeholder="John Doe"
                formRef={form}
              />

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
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </BrandButton>
            </form>
          </Form>
        </Card>
      </div>
    </AnimatedWrapper>
  );
};
