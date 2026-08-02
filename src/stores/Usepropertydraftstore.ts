import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CreatePropertyFormData } from '@/property';
import { EMPTY_DEFAULTS, type STEPS } from '@/property';

type Step = (typeof STEPS)[number];

interface PropertyDraftState {
  // Form data — persisted to localStorage
  draft: CreatePropertyFormData;
  currentStep: Step;

  // Actions
  saveDraft: (data: Partial<CreatePropertyFormData>) => void;
  setStep: (step: Step) => void;
  clearDraft: () => void;
}

// Store

export const usePropertyDraftStore = create<PropertyDraftState>()(
  persist(
    set => ({
      draft: EMPTY_DEFAULTS,
      currentStep: 'basic',

      saveDraft: data => set(s => ({ draft: { ...s.draft, ...data } })),

      setStep: step => set({ currentStep: step }),

      clearDraft: () => set({ draft: EMPTY_DEFAULTS, currentStep: 'basic' }),
    }),
    {
      name: 'homesphere-property-draft', // localStorage key
      storage: createJSONStorage(() => localStorage),

      // Only persist form data and step — not transient UI flags
      partialize: s => ({
        draft: s.draft,
        currentStep: s.currentStep,
      }),
    }
  )
);
