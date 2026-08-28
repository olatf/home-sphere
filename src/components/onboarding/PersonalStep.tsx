import type { UseFormReturn } from 'react-hook-form';
import { BrandInput } from '@/components/common/BrandInput';
import { BrandMultiTextInput } from '@/components/common/BrandMultiTextInput';
import type { OnboardingValues } from '@/lib/schemas/onboarding';

export default function PersonalStep({
  form,
}: {
  form: UseFormReturn<OnboardingValues>;
}) {
  return (
    <div className="grid gap-2 space-y-4">
      <BrandInput
        formRef={form}
        name="dateOfBirth"
        label="Date of Birth"
        variant="date"
        required
      />
      <BrandInput
        formRef={form}
        name="bio"
        label="Bio"
        placeholder="Type here.."
        variant="textarea"
        required
      />
      <BrandMultiTextInput
        name="interest"
        label="Interests"
        form={form}
        placeholder="Add your interests"
      />
    </div>
  );
}
