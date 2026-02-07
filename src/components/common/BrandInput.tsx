'use client';

import { useEffect, useState } from 'react';
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
import Image from 'next/image';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DatePicker } from './BrandDatePicker';
import { cn } from '@/lib/utils';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useCountriesAndStates } from '@/hooks/useCountriesAndStates';

export type InputVariant =
  | 'input'
  | 'textarea'
  | 'phone'
  | 'country'
  | 'state'
  | 'date'
  | 'checkbox'
  | 'file';

interface BrandInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  variant?: InputVariant;
  type?: React.HTMLInputTypeAttribute;
  formRef: UseFormReturn<T>;
  required?: boolean;
  maxFileSizeMB?: number;
}

export function BrandInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  variant = 'input',
  type = 'text',
  formRef,
  required,
  maxFileSizeMB = 5,
}: BrandInputProps<T>) {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const selectedCountryName = formRef.watch('nationality' as Path<T>);

  const { countries, states, isCountriesLoading, isStatesLoading } =
    useCountriesAndStates(selectedCountryName);

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

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
                        value={field.value}
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
                      className={cn(baseClass)}
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

                case 'date':
                  return (
                    <div className="text-brand w-[30%]">
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        fromYear={1940}
                      />
                    </div>
                  );

                case 'file':
                  return (
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          if (file.size > maxFileSizeMB * 1024 * 1024) {
                            formRef.setError(name, {
                              message: `File must be under ${maxFileSizeMB}MB`,
                            });
                            return;
                          }

                          const preview = URL.createObjectURL(file);
                          setFilePreview(preview);
                          field.onChange(file);
                        }}
                      />

                      {filePreview && (
                        <div className="relative h-18 w-34">
                          <Image
                            src={filePreview}
                            alt="Preview"
                            fill
                            className="rounded-xl object-cover"
                          />
                        </div>
                      )}
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
