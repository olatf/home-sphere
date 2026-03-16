import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';

type Option<T extends string> = { value: T; label: string };

interface Props<T extends string> {
  options?: Option<T>[];
  value?: T;
  onChange?: (value: T) => void;
  name?: string;
  className?: string;
  ariaLabel?: string;
}

export const BrandRadioSelectors = <T extends string>({
  options = DEFAULT_OPTIONS as Option<T>[],
  value,
  onChange,
  name,
  className,
  ariaLabel = 'Selection',
}: Props<T>) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('flex items-center gap-6', className)}
      value={value}
      onValueChange={onChange}
      aria-label={ariaLabel}
      name={name}
    >
      {options.map(opt => (
        <label
          key={opt.value}
          className="font-secondary inline-flex cursor-pointer items-center gap-2 text-base"
        >
          <RadioGroupPrimitive.Item
            value={opt.value}
            id={`${name}-${opt.value}`}
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

// default to the three onboarding roles; callers that specify a generic
// type will have the constant cast to `Option<T>` above.  We deliberately keep
// this wide because the component doesn’t know which union the caller will
// request – it simply provides reasonable defaults.
const DEFAULT_OPTIONS: Option<string>[] = [
  { value: 'landlord', label: 'Landlord' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'agent', label: 'Agent' },
];
