'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { UseFormReturn, FieldValues, Path } from 'react-hook-form';

interface BrandMultiTextInputProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  required?: boolean;
  placeholder?: string;
  form: UseFormReturn<T>;
}

export function BrandMultiTextInput<T extends FieldValues>({
  name,
  label,
  required,
  placeholder = 'Add item...',
  form,
}: BrandMultiTextInputProps<T>) {
  const [inputValue, setInputValue] = useState('');

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const values: string[] = field.value || [];

        const addItem = () => {
          if (!inputValue.trim()) return;

          if (!values.includes(inputValue.trim())) {
            field.onChange([...values, inputValue.trim()]);
          }

          setInputValue('');
        };

        const removeItem = (item: string) => {
          field.onChange(values.filter(v => v !== item));
        };

        return (
          <FormItem>
            <FormLabel className="font-secondary text-brand-khaki text-sm">
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>

            <FormControl>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder={placeholder}
                    className="font-tertiary focus:border-brand focus-visible:border-brand rounded-none border-0 border-b-2 border-[#D0D5DD] bg-transparent px-0 text-base font-normal text-[#535A63] italic shadow-none focus:border-b focus:ring-0 focus:outline-none focus-visible:border-b focus-visible:ring-0 focus-visible:outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addItem}
                    className="hover:border-brand hover:border hover:bg-transparent hover:text-zinc-900"
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {values.map(item => (
                    <div
                      key={item}
                      className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeItem(item)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </FormControl>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
