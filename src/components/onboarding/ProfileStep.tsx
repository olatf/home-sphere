import { UseFormReturn } from 'react-hook-form';
import { OnboardingValues } from '@/lib/schemas/onboarding';
import { BrandInput } from '@/components/common/BrandInput';

export default function ProfileStep({
  form,
}: {
  form: UseFormReturn<OnboardingValues>;
}) {
  return (
    <div className="grid gap-4 space-y-7">
      <BrandInput
        formRef={form}
        name="meansOfIdentification"
        label="Means of Identification"
        variant="file"
        maxFileSizeMB={10}
        required
      />
      <BrandInput
        formRef={form}
        name="consent"
        label="Consent to data processing"
        placeholder="I consent to my data been checked and proceed"
        variant="checkbox"
        required
      />
    </div>
  );
}
