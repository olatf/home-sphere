'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, OnboardingValues } from '@/lib/schemas/onboarding';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Form } from '@/components/ui/form';
import { completeOnboarding } from '@/actions/auth';
import { BrandButton } from '@/components/common/BrandButton';
import { If } from '@/components/common/If';

import RoleStep from './RoleStep';
import PersonalStep from './PersonalStep';
import ProfileStep from './ProfileStep';
import { toast } from 'sonner';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { getErrorMessage } from '@/helpers/error.helpers';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const steps = ['Role', 'Personal', 'Profile'] as const;

export const OnboardingForm = () => {
  const [step, setStep] = useState(0);
  const [onboarding, StartOnboarding] = useTransition();
  const router = useRouter();

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: undefined,
      phone: '',
      bio: '',
      interests: '',
      nationality: '',
      city: '',
      dateOfBirth: undefined,
      meansOfIdentification: undefined,
      consent: false,
    },
    mode: 'onTouched',
    shouldUnregister: false,
  });

  const stepFields: Record<number, (keyof OnboardingValues)[]> = {
    0: ['role', 'phone', 'nationality', 'city'],
    1: ['dateOfBirth', 'bio', 'interests'],
    2: ['meansOfIdentification', 'consent'],
  };

  const next = async () => {
    const fields = stepFields[step];

    const valid = await form.trigger(fields, {
      shouldFocus: true,
    });

    if (!valid) return;

    setStep(s => s + 1);
  };

  const back = () => setStep(s => s - 1);

  const onSubmit = (data: OnboardingValues) => {
    StartOnboarding(async () => {
      try {
        await completeOnboarding({ data });
        toast.success(
          'Welcome on-board, Your account verification is underway!'
        );
        form.reset();
        router.push('/dashboard');
      } catch (e) {
        const errorMessage = getErrorMessage(e);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <AnimatedWrapper type="slideInRight">
      <Card className="h-[90%] w-full max-w-xl border-none px-6 py-2 shadow-none">
        <Progress value={((step + 1) / steps.length) * 100} className="" />

        <h1 className="font-primary mt-4 text-center text-2xl font-bold">
          {' '}
          Complete your Onboarding
        </h1>
        <p className="text-muted-foreground text-sm">
          Step {step + 1} of {steps.length}
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-2 space-y-6"
          >
            <If cond={step === 0}>
              <RoleStep form={form} />
            </If>
            <If cond={step === 1}>
              <PersonalStep form={form} />
            </If>
            <If cond={step === 2}>
              <ProfileStep form={form} />
            </If>

            <div className="mt-10 flex justify-between">
              <If cond={step > 0}>
                <BrandButton
                  type="button"
                  brandVariant="tertiary"
                  onClick={back}
                >
                  Back
                </BrandButton>
              </If>
              {step < steps.length - 1 ? (
                <BrandButton
                  type="button"
                  brandVariant="tertiary"
                  onClick={next}
                >
                  Continue
                </BrandButton>
              ) : (
                <BrandButton type="submit" className="min-h-10 px-7 py-4">
                  {onboarding ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="size-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    'Finish'
                  )}
                </BrandButton>
              )}
            </div>
          </form>
        </Form>
      </Card>
    </AnimatedWrapper>
  );
};
