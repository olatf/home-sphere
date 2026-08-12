'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

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
                    className="rounded-none border-0 border-[#D0D5DD] border-b-2 bg-transparent px-0 font-normal font-tertiary text-[#535A63] text-base italic shadow-none focus:border-brand focus:border-b focus:outline-none focus:ring-0 focus-visible:border-brand focus-visible:border-b focus-visible:outline-none focus-visible:ring-0"
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
                    className="hover:border hover:border-brand hover:bg-transparent hover:text-zinc-900"
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
