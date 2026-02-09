import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';
import type { OnboardingValues } from '@/lib/schemas/onboarding';

type RoleType = OnboardingValues['role'];

type Option = { value: RoleType; label: string };

interface Props {
  options?: Option[];
  value?: RoleType;
  onChange?: (value: RoleType) => void;
  name?: string;
  className?: string;
}

export const BrandRadioSelectors = ({
  options = DEFAULT_OPTIONS,
  value,
  onChange,
  name = 'role',
  className,
}: Props) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('flex items-center gap-6', className)}
      value={value}
      onValueChange={onChange}
      aria-label="Role category"
      name={name}
    >
      {options.map(opt => (
        <label
          key={opt.value}
          className="font-secondary inline-flex cursor-pointer items-center gap-2 text-base"
        >
          <RadioGroupPrimitive.Item
            value={opt.value}
            id={`role-${opt.value}`}
            className="data-[state=checked]:border-brand relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 transition-colors"
          >
            <RadioGroupPrimitive.Indicator className="bg-brand h-3 w-3 rounded-full opacity-0 transition-opacity data-[state=checked]:opacity-100" />
          </RadioGroupPrimitive.Item>

          <span>{opt.label}</span>
        </label>
      ))}
    </RadioGroupPrimitive.Root>
  );
};

const DEFAULT_OPTIONS: Option[] = [
  { value: 'landlord', label: 'Landlord' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'agent', label: 'Agent' },
];
