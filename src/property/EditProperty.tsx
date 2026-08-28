'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useReducer } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { getErrorMessage } from '@/helpers/error.helpers';
import { useProperty } from '@/hooks/useProperty';
import type { Property } from '@/types/property';
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
  apiPublishProperty,
  apiUpdateProperty,
  type CreatePropertyFormData,
  createPropertySchema,
  STEPS,
} from './propertyFormShared';

interface UIState {
  step: (typeof STEPS)[number];
  uploading: boolean;
  submitting: boolean;
}

type UIAction =
  | { type: 'SET_STEP'; step: (typeof STEPS)[number] }
  | { type: 'SET_UPLOADING'; uploading: boolean }
  | { type: 'SET_SUBMITTING'; submitting: boolean };

function reducer(s: UIState, a: UIAction): UIState {
  switch (a.type) {
    case 'SET_STEP':
      return { ...s, step: a.step };
    case 'SET_UPLOADING':
      return { ...s, uploading: a.uploading };
    case 'SET_SUBMITTING':
      return { ...s, submitting: a.submitting };
    default:
      return s;
  }
}

const EditForm = ({ property }: { property: Property }) => {
  const router = useRouter();

  const [{ step, uploading, submitting }, dispatch] = useReducer(reducer, {
    step: 'basic',
    uploading: false,
    submitting: false,
  });

  const form = useForm<CreatePropertyFormData, unknown, CreatePropertyFormData>(
    {
      // @ts-expect-error TypeScript issue with zodResolver types
      resolver: zodResolver(createPropertySchema),
      defaultValues: {
        title: property.title,
        description: property.description,
        property_type: property.property_type,
        listing_type: property.listing_type,
        duration_years: property.max_duration_years,
        location: property.location,
        features: property.features,
        pricing: property.pricing,
        feature_image: property.feature_image,
        gallery: property.gallery,
        proof_of_ownership: property.proof_of_ownership,
        video_tour_url: property.video_tour_url,
        // legal_services_available: property.legal_services_available,
        tags: property.tags,
        available_units: property.available_units,
      },
      mode: 'onChange',
    }
  );

  // Save changes only (stays as-is status-wise)
  async function saveChanges(data: CreatePropertyFormData) {
    dispatch({ type: 'SET_SUBMITTING', submitting: true });
    try {
      await apiUpdateProperty(property.id, data);
      toast.success('Changes saved.');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', submitting: false });
    }
  }

  // Save changes then submit draft for review
  async function saveAndPublish(data: CreatePropertyFormData) {
    dispatch({ type: 'SET_SUBMITTING', submitting: true });
    console.log('SUBMIT DATA:', data.location);
    try {
      await apiUpdateProperty(property.id, data);
      if (property.status === 'draft' || property.status === 'rejected') {
        await apiPublishProperty(property.id, property.status);
        toast.success('Property submitted for review!');
      } else {
        toast.success('Changes saved.');
      }
      router.push('/dashboard/listings');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', submitting: false });
    }
  }

  return (
    <Form {...form}>
      <div className="space-y-8 pb-20">
        <StepNavigator
          steps={STEPS}
          current={step}
          onStep={s => dispatch({ type: 'SET_STEP', step: s })}
        />

        {step === 'basic' && <StepBasic form={form} />}
        {step === 'location' && <StepLocation form={form} />}
        {step === 'features' && <StepFeatures form={form} />}
        {step === 'pricing' && <StepPricing form={form} />}
        {step === 'media' && (
          <StepMedia
            form={form}
            uploading={uploading}
            setUploading={v =>
              dispatch({ type: 'SET_UPLOADING', uploading: v })
            }
          />
        )}
        {step === 'review' && (
          <StepReview
            form={form}
            submitting={submitting}
            status={property.status}
            uploading={uploading}
            onDraft={() => form.handleSubmit(d => saveChanges(d))()}
            onPublish={() => form.handleSubmit(d => saveAndPublish(d))()}
          />
        )}

        {step !== 'review' && (
          <>
            <StepNavButtons
              steps={STEPS}
              current={step}
              onStep={s => dispatch({ type: 'SET_STEP', step: s })}
            />
            {/* Quick save on any step */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={submitting}
                onClick={() => form.handleSubmit(d => saveChanges(d))()}
              >
                {submitting && (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </>
        )}
      </div>
    </Form>
  );
};

export function EditProperty({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const { data, isLoading, error } = useProperty(propertyId);
  const property = data?.data as Property | null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-red-300" />
        <p className="font-primary font-semibold text-gray-700 text-lg">
          Property not found
        </p>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/listings')}
        >
          Back to Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-2 py-4 md:px-4 md:py-8">
      <div className="mb-6">
        <h1 className="font-bold font-primary text-2xl text-gray-900">
          Edit Property
        </h1>
        <p className="mt-1 truncate font-secondary text-gray-500 text-sm">
          {property.title}
        </p>
      </div>
      <EditForm property={property} />
    </div>
  );
}
