import { UseFormReturn } from 'react-hook-form';
import { OnboardingValues } from '@/lib/schemas/onboarding';
import { BrandInput } from '@/components/common/BrandInput';
import { BrandRadioSelectors } from '@/components/common/BrandRadioSelectors';

export default function RoleStep({
  form,
}: {
  form: UseFormReturn<OnboardingValues>;
}) {
  return (
    <div className="space-y-7">
      <p className="font-secondary text-base font-semibold">
        What is your role?
      </p>
      <BrandRadioSelectors
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
            label="Nationality"
            variant="country"
            required
          />

          <BrandInput
            formRef={form}
            name="city"
            label="City"
            variant="state"
            required
          />
        </div>
      </div>
    </div>
  );
}
