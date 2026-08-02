'use client';

import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { baseClass } from '@/config/constants';
import { cn } from '@/lib/utils';
import { DateTimePicker } from './BrandDatePicker';
import { BrandImageEditor } from './BrandImageEditor';
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

export type FormValue = string | number | boolean | Date | undefined;

interface BrandInputProps<T extends FieldValues>
  extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  variant?: InputVariant;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
  options?: { value: string; label: string }[];
  maxFileSizeMB?: number;
  formRef?: UseFormReturn<T>;
  value?: FormValue;
  onChange?: (value: FormValue) => void;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

interface InputRendererProps<T extends FieldValues> {
  variant: InputVariant;
  type: React.HTMLInputTypeAttribute;
  placeholder?: string;
  value: FormValue;
  onChange: (value: FormValue) => void;
  name: Path<T>;
  options?: { value: string; label: string }[];
  maxFileSizeMB: number;
  formRef?: UseFormReturn<T>;
  fieldProps?: Record<string, unknown>;
  hasLeftElement?: boolean;
  hasRightElement?: boolean;
}

function InputRenderer<T extends FieldValues>({
  variant,
  type,
  placeholder,
  value,
  onChange,
  name,
  options,
  maxFileSizeMB,
  formRef,
  fieldProps,
  hasLeftElement,
  hasRightElement,
}: InputRendererProps<T>) {
  // Country/state variants need the nationality watch value
  const selectedCountryName = formRef?.watch('nationality' as Path<T>);
  const { countries, states, isCountriesLoading, isStatesLoading } =
    useCountriesAndStates(selectedCountryName);

  switch (variant) {
    case 'phone':
      return (
        <div className="border-[#D0D5DD] border-b focus-within:border-brand">
          <PhoneInput
            international
            defaultCountry="NG"
            value={typeof value === 'string' ? value : undefined}
            limitMaxLength
            onChange={onChange}
            className="h-11 w-full bg-transparent text-sm"
          />
        </div>
      );

    case 'textarea':
      return (
        <Textarea
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn('min-h-28 resize-none', baseClass)}
        />
      );

    case 'country':
    case 'state':
    case 'select': {
      const currentOptions =
        variant === 'country'
          ? countries
          : variant === 'state'
            ? states
            : options;
      const isLoading =
        variant === 'country'
          ? isCountriesLoading
          : variant === 'state'
            ? isStatesLoading
            : false;

      return (
        <Select
          value={typeof value === 'string' ? value : value?.toString() || ''}
          onValueChange={onChange}
          disabled={isLoading || (variant === 'state' && !selectedCountryName)}
        >
          <SelectTrigger className={cn('px-7', baseClass)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {currentOptions?.map(
              (o: {
                id?: string | number;
                value?: string;
                name?: string;
                label?: string;
              }) => (
                <SelectItem
                  key={o.id || o.value}
                  value={(o.name || o.value || '').toString()}
                >
                  {o.name || o.label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      );
    }
    case 'date':
      return (
        <div className="w-[35%] text-brand">
          <DateTimePicker
            value={value instanceof Date ? value : undefined}
            showTimePicker={false}
            onChange={onChange}
            minAge={18}
          />
        </div>
      );

    case 'file':
      return (
        <div className="space-y-2">
          <BrandImageEditor
            control={formRef?.control}
            accept_types="JPG, WEBP"
            name={name}
            existingImageUrl={typeof value === 'string' ? value : undefined}
            maxFileSizeMB={maxFileSizeMB}
          />
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={!!value}
            onCheckedChange={checked => onChange(checked)}
          />
          {placeholder && (
            <p className="text-[#535A63] text-sm">{placeholder}</p>
          )}
        </div>
      );

    default:
      return (
        <Input
          {...(fieldProps ?? {})}
          type={type}
          value={(value as string | number) ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            baseClass,
            hasLeftElement && 'pl-9',
            hasRightElement && 'pr-9'
          )}
        />
      );
  }
}

export function BrandInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  variant = 'input',
  type = 'text',
  formRef,
  value: standaloneValue,
  onChange: standaloneOnChange,
  error: standaloneError,
  options,
  required,
  maxFileSizeMB = 5,
  leftElement,
  rightElement,
  ...rest
}: BrandInputProps<T>) {
  if (formRef) {
    return (
      <div className="flex flex-col gap-1">
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
                <div className="relative flex items-center">
                  {leftElement && (
                    <div className="pointer-events-none absolute left-3 flex items-center text-gray-400">
                      {leftElement}
                    </div>
                  )}
                  <InputRenderer
                    variant={variant}
                    type={type}
                    placeholder={placeholder}
                    value={field.value}
                    onChange={field.onChange}
                    name={name}
                    options={options}
                    maxFileSizeMB={maxFileSizeMB}
                    formRef={formRef}
                    fieldProps={field}
                    hasLeftElement={!!leftElement}
                    hasRightElement={!!rightElement}
                  />
                  {rightElement && (
                    <div className="absolute right-3 flex items-center text-gray-400">
                      {rightElement}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="block font-secondary text-brand text-sm">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </div>
      )}
      <div className="relative flex items-center">
        {leftElement && (
          <div className="pointer-events-none absolute left-3 flex items-center text-gray-400">
            {leftElement}
          </div>
        )}
        <InputRenderer
          variant={variant}
          type={type}
          placeholder={placeholder}
          value={standaloneValue}
          onChange={standaloneOnChange ?? (() => {})}
          name={name}
          options={options}
          maxFileSizeMB={maxFileSizeMB}
          fieldProps={rest as Record<string, unknown>}
          hasLeftElement={!!leftElement}
          hasRightElement={!!rightElement}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center text-gray-400">
            {rightElement}
          </div>
        )}
      </div>
      {standaloneError && (
        <p className="font-secondary text-red-500 text-xs">{standaloneError}</p>
      )}
    </div>
  );
}
