import type { UseFormReturn } from 'react-hook-form';
import { BrandInput } from '@/components/common/BrandInput';
import { BrandRadioSelectors } from '@/components/common/BrandRadioSelectors';
import type { OnboardingValues } from '@/lib/schemas/onboarding';

export default function RoleStep({
  form,
}: {
  form: UseFormReturn<OnboardingValues>;
}) {
  return (
    <div className="space-y-7">
      <p className="font-secondary font-semibold text-base">
        What is your role?
      </p>
      <BrandRadioSelectors<OnboardingValues['role']>
        ariaLabel="Role category"
        value={form.getValues('role')}
        onChange={value => form.setValue('role', value)}
      />

      <div className="grid gap-4 space-y-4">
        <BrandInput
          formRef={form}
          name="phone"
          label="Phone number"
          variant="phone"
          required
        />
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <BrandInput
            formRef={form}
            name="nationality"
            placeholder="Select Nationality"
            label="Nationality"
            variant="country"
            required
          />

          <BrandInput
            formRef={form}
            name="city"
            placeholder="Select City"
            label="City"
            variant="state"
            required
          />
        </div>
      </div>
    </div>
  );
}
