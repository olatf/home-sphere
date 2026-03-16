'use client';

import { useState, useTransition } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, OnboardingValues } from '@/lib/schemas/onboarding';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Form } from '@/components/ui/form';
import { completeOnboarding } from '@/actions/auth';
import { BrandButton } from '@/components/common/BrandButton';
import { If } from '@/components/common/If';

import RoleStep from './RoleStep';
import PersonalStep from './PersonalStep';
import ProfileStep from './ProfileStep';
import KycCapture from './KycCapture';
import { toast } from 'sonner';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { getErrorMessage } from '@/helpers/error.helpers';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type Steps = {
  title: string;
  fields: (keyof OnboardingValues)[];
  component: React.FC<{
    form: UseFormReturn<OnboardingValues>;
  }>;
};

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
      interest: [],
      nationality: '',
      city: '',
      dateOfBirth: undefined,
      idType: undefined,
      idNumber: '',
      meansOfIdentification: undefined,
      selfieImage: undefined,
      consent: false,
    },
    mode: 'onTouched',
    shouldUnregister: false,
  });

  const steps: Steps[] = [
    {
      title: 'Role',
      fields: ['role', 'phone', 'nationality', 'city'],
      component: RoleStep,
    },
    {
      title: 'Personal',
      fields: ['dateOfBirth', 'bio', 'interest'],
      component: PersonalStep,
    },
    {
      title: 'Profile',
      fields: ['idType', 'idNumber', 'meansOfIdentification'],
      component: ProfileStep,
    },
    { title: 'KYC', fields: ['selfieImage', 'consent'], component: KycCapture },
  ];

  const isLastStep = step === steps.length - 1;

  const next = async () => {
    const fields = steps[step].fields;

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

  const handleNext = isLastStep ? form.handleSubmit(onSubmit) : next;

  const buttonText = isLastStep ? (
    onboarding ? (
      <div className="flex items-center gap-3">
        <Loader2 className="size-4 animate-spin" />
        Loading...
      </div>
    ) : (
      'Finish'
    )
  ) : step === 0 ? (
    'Continue'
  ) : (
    'Next'
  );

  const CurrentStep = steps[step].component;

  return (
    <AnimatedWrapper type="slideInRight">
      <Card className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden border-none px-6 py-2 shadow-none">
        <div className="shrink-0">
          <div
            className={`grid gap-2`}
            style={{
              gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
            }}
          >
            {Array.from({ length: steps.length }, (_, index) => {
              const key = `step-${index}`;
              return (
                <div
                  key={key}
                  className={cn(
                    'h-2 rounded-[2px] bg-zinc-200',
                    index <= step && 'bg-brand'
                  )}
                />
              );
            })}
          </div>

          <h1 className="font-primary mt-7 text-center text-2xl font-bold">
            Complete your Onboarding
          </h1>

          <p className="text-muted-foreground mt-5 text-sm">
            Step {step + 1} of {steps.length}
          </p>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto pr-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CurrentStep form={form} />

              <footer className="fixed bottom-7 w-full max-w-xl border-t">
                <div className="mt-4 flex justify-between">
                  <If cond={step > 0}>
                    <BrandButton
                      type="button"
                      brandVariant="tertiary"
                      onClick={back}
                    >
                      Back
                    </BrandButton>
                  </If>
                  <BrandButton
                    type={isLastStep ? 'submit' : 'button'}
                    brandVariant="tertiary"
                    onClick={handleNext}
                  >
                    {buttonText}
                  </BrandButton>
                </div>
              </footer>
            </form>
          </Form>
        </div>
      </Card>
    </AnimatedWrapper>
  );
};
