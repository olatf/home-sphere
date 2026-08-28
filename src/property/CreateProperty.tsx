'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useReducer } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { BrandButton } from '@/components/common/BrandButton';
import { Form } from '@/components/ui/form';
import { usePropertyDraftStore } from '@/stores/Usepropertydraftstore';
import {
  StepBasic,
  StepFeatures,
  StepLocation,
  StepMedia,
  StepNavButtons,
  StepNavigator,
  StepPricing,
  StepReview,
} from './PropertyFormSteps';
import {
  apiCreateProperty,
  type CreatePropertyFormData,
  createPropertySchema,
  STEPS,
} from './propertyFormShared';

interface UIState {
  uploading: boolean;
  submitting: boolean;
}

type UIAction =
  | { type: 'SET_UPLOADING'; uploading: boolean }
  | { type: 'SET_SUBMITTING'; submitting: boolean };

function reducer(s: UIState, a: UIAction): UIState {
  switch (a.type) {
    case 'SET_UPLOADING':
      return { ...s, uploading: a.uploading };
    case 'SET_SUBMITTING':
      return { ...s, submitting: a.submitting };
    default:
      return s;
  }
}

export function CreateProperty() {
  const router = useRouter();

  const { draft, currentStep, saveDraft, setStep, clearDraft } =
    usePropertyDraftStore();

  const [{ uploading, submitting }, dispatch] = useReducer(reducer, {
    uploading: false,
    submitting: false,
  });

  // Initialise form with whatever is in the draft store

  const form = useForm<CreatePropertyFormData, unknown, CreatePropertyFormData>(
    {
      // @ts-expect-error TypeScript issue with zodResolver types
      resolver: zodResolver(createPropertySchema),
      defaultValues: draft,
      mode: 'onChange',
    }
  );

  // Auto-save draft to store on every field change

  useEffect(() => {
    const { unsubscribe } = form.watch(values => {
      saveDraft(values as Partial<CreatePropertyFormData>);
    });
    return () => unsubscribe();
  }, [form, saveDraft]);

  //  Submit

  async function submit(data: CreatePropertyFormData, publish: boolean) {
    dispatch({ type: 'SET_SUBMITTING', submitting: true });
    try {
      await apiCreateProperty(data, publish);
      clearDraft(); // wipe the draft from localStorage on success
      toast.success(
        publish ? 'Property submitted for review!' : 'Draft saved.'
      );
      router.push('/dashboard/listings');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      dispatch({ type: 'SET_SUBMITTING', submitting: false });
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-3 md:p-5">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold font-primary text-2xl text-gray-900">
            Add New Property
          </h1>
          <p className="mt-1 font-secondary text-gray-500 text-sm">
            Fill in the details below. Your progress is saved automatically.
          </p>
        </div>

        {form.formState.isDirty && (
          <BrandButton
            type="button"
            onClick={() => {
              clearDraft();
              form.reset();
              toast.success('Draft cleared');
            }}
            className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 font-secondary text-white text-xs transition hover:bg-rose-500 hover:text-white"
          >
            Clear draft
          </BrandButton>
        )}
      </div>

      <Form {...form}>
        <div className="space-y-8 pb-20">
          <StepNavigator
            steps={STEPS}
            current={currentStep}
            onStep={s => setStep(s)}
          />

          {currentStep === 'basic' && <StepBasic form={form} />}
          {currentStep === 'location' && <StepLocation form={form} />}
          {currentStep === 'features' && <StepFeatures form={form} />}
          {currentStep === 'pricing' && <StepPricing form={form} />}
          {currentStep === 'media' && (
            <StepMedia
              form={form}
              uploading={uploading}
              setUploading={v =>
                dispatch({ type: 'SET_UPLOADING', uploading: v })
              }
            />
          )}
          {currentStep === 'review' && (
            <StepReview
              form={form}
              submitting={submitting}
              uploading={uploading}
              onDraft={() =>
                form.handleSubmit(
                  d => submit(d, false),
                  () =>
                    toast.error(
                      'Please fill in all required fields before saving.'
                    )
                )()
              }
              onPublish={() =>
                form.handleSubmit(
                  d => submit(d, true),
                  () =>
                    toast.error(
                      'Please fill in all required fields before submitting.'
                    )
                )()
              }
            />
          )}

          {currentStep !== 'review' && (
            <StepNavButtons
              steps={STEPS}
              current={currentStep}
              onStep={s => setStep(s)}
            />
          )}
        </div>
      </Form>
    </div>
  );
}
