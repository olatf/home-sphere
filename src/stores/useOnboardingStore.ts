import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Step = 'idle' | 'otp_sent' | 'otp_verified' | 'set_password' | 'completed';

interface OnboardingState {
  step: Step;
  email: string | null;

  setEmail: (email: string) => void;
  setStep: (step: Step) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    set => ({
      step: 'idle',
      email: null,

      setEmail: email => set({ email }),
      setStep: step => set({ step }),

      reset: () => set({ step: 'idle', email: null }),
    }),
    { name: 'onboarding-progress' }
  )
);
