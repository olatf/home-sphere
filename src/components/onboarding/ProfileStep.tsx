import type { UseFormReturn } from 'react-hook-form';
import { BrandInput } from '@/components/common/BrandInput';
import { BrandRadioSelectors } from '@/components/common/BrandRadioSelectors';
import type { OnboardingValues } from '@/lib/schemas/onboarding';

export default function ProfileStep({
  form,
}: {
  form: UseFormReturn<OnboardingValues>;
}) {
  return (
    <div className="grid gap-2 space-y-3">
      <div className="space-y-4">
        <p className="font-secondary font-semibold text-base">
          Document Type <span className="text-red-900">*</span>
        </p>
        <BrandRadioSelectors<OnboardingValues['idType']>
          ariaLabel="ID type"
          value={form.getValues('idType')}
          options={[
            { value: 'NIN', label: 'National ID' },
            { value: 'PASSPORT', label: 'Passport' },
            { value: 'DRIVERS_LICENSE', label: "Driver's License" },
          ]}
          onChange={value => form.setValue('idType', value)}
        />
      </div>

      <BrandInput
        formRef={form}
        name="idNumber"
        label="Identification Number"
        placeholder="Enter your ID number"
        required
      />

      <BrandInput
        formRef={form}
        name="meansOfIdentification"
        label="ID Document"
        variant="file"
        maxFileSizeMB={5}
        placeholder="Upload clear image of your ID"
        required
      />
    </div>
  );
}
