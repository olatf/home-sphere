'use client';

import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { BrandImageEditor } from './BrandImageEditor';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DateTimePicker } from './BrandDatePicker';
import { cn } from '@/lib/utils';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useCountriesAndStates } from '@/hooks/useCountriesAndStates';

export type InputVariant =
  | 'input'
  | 'textarea'
  | 'phone'
  | 'country'
  | 'select'
  | 'state'
  | 'date'
  | 'checkbox'
  | 'file';

interface BrandInputProps<T extends FieldValues> extends React.ComponentProps<
  typeof Input
> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  variant?: InputVariant;
  type?: React.HTMLInputTypeAttribute;
  formRef: UseFormReturn<T>;
  required?: boolean;
  options?: { value: string; label: string }[];
  maxFileSizeMB?: number;
}

export function BrandInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  variant = 'input',
  type = 'text',
  formRef,
  options,
  required,
  maxFileSizeMB = 5,
}: BrandInputProps<T>) {
  const selectedCountryName = formRef.watch('nationality' as Path<T>);

  const { countries, states, isCountriesLoading, isStatesLoading } =
    useCountriesAndStates(selectedCountryName);

  const baseClass = `font-tertiary italic text-base font-normal text-[#535A63] border-0 border-b-2 border-[#D0D5DD] rounded-none bg-transparent px-0 shadow-none focus:border-b focus:border-brand focus:ring-0 focus:outline-none focus-visible:border-b focus-visible:border-brand focus-visible:ring-0 focus-visible:outline-none`;

  return (
    <FormField
      control={formRef.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-secondary text-brand-khaki text-sm">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </FormLabel>

          <FormControl>
            {(() => {
              switch (variant) {
                case 'phone':
                  return (
                    <div className="focus-within:border-brand border-b border-[#D0D5DD]">
                      <PhoneInput
                        international
                        defaultCountry="NG"
                        value={field.value ?? undefined}
                        limitMaxLength={true}
                        onChange={field.onChange}
                        className="h-11 w-full bg-transparent text-sm"
                      />
                    </div>
                  );

                case 'textarea':
                  return (
                    <Textarea
                      {...field}
                      placeholder={placeholder}
                      className={cn(`min-h-10`, baseClass)}
                    />
                  );

                case 'country':
                  return (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isCountriesLoading}
                    >
                      <SelectTrigger className={cn(`px-7`, baseClass)}>
                        <SelectValue
                          placeholder={
                            isCountriesLoading
                              ? 'Loading countries…'
                              : 'Select country'
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country.id} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );

                case 'state':
                  return (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedCountryName || isStatesLoading}
                    >
                      <SelectTrigger className={cn(`px-7`, baseClass)}>
                        <SelectValue
                          placeholder={
                            !selectedCountryName
                              ? 'Select country first'
                              : isStatesLoading
                                ? 'Loading states…'
                                : 'Select state'
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state.id} value={state.name}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );

                case 'select':
                  if (!options || options.length === 0) return null;
                  return (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={cn(`px-7`, baseClass)}>
                        <SelectValue placeholder={placeholder} />
                      </SelectTrigger>

                      <SelectContent>
                        {options?.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );

                case 'date':
                  return (
                    <div className="text-brand w-[35%]">
                      <DateTimePicker
                        value={field.value}
                        showTimePicker={false}
                        onChange={field.onChange}
                        minAge={18}
                      />
                    </div>
                  );

                case 'file':
                  return (
                    <div className="space-y-2">
                      <BrandImageEditor
                        control={formRef.control}
                        accept_types="JPG, WEBP"
                        name={name}
                        existingImageUrl={
                          typeof field.value === 'string'
                            ? field.value
                            : undefined
                        }
                        maxFileSizeMB={maxFileSizeMB}
                      />
                    </div>
                  );

                case 'checkbox':
                  return (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <p className="text-sm text-[#535A63]">{placeholder}</p>
                    </div>
                  );

                default:
                  return (
                    <Input
                      {...field}
                      type={type}
                      placeholder={placeholder}
                      className={cn(baseClass)}
                    />
                  );
              }
            })()}
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
