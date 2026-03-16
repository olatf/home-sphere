'use client';

import { useState, useRef } from 'react';
import { FormField, FormItem, FormControl } from '@/components/ui/form';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';
import type { Control, FieldValues, Path } from 'react-hook-form';

interface FeaturedImageFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  existingImageUrl?: string;
  accept_types?: string;
  maxFileSizeMB?: number;
}

export function BrandImageEditor<T extends FieldValues>({
  control,
  name,
  accept_types = 'PNG, JPG, WEBP',
  existingImageUrl,
  maxFileSizeMB,
}: FeaturedImageFieldProps<T>) {
  const [preview, setPreview] = useState<string | null>(
    existingImageUrl || null
  );
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (
    file: File,
    fieldOnChange: (value: File | string | null) => void
  ) => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    fieldOnChange(file);
  };

  const handleRemove = (
    fieldOnChange: (value: File | string | null) => void
  ) => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    fieldOnChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="mt-2">
          <FormControl>
            <div
              className="hover:border-brand-primary relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-gray-300 transition-colors hover:bg-gray-50"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {preview ? (
                <>
                  <Image
                    src={preview}
                    alt={`Image- ${field.name}`}
                    fill
                    className="object-cover"
                  />
                  {isHovered && (
                    <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 transition-opacity">
                      <label className="flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100">
                        <ImagePlus className="h-4 w-4" />
                        Change
                        <input
                          ref={inputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file, field.onChange);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleRemove(field.onChange);
                        }}
                        className="flex cursor-pointer items-center gap-2 rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
                  <ImagePlus className="mb-2 h-10 w-10 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">
                    Click to upload image
                  </span>
                  <span className="mt-1 text-xs text-gray-400">
                    {` ${accept_types} up to ${maxFileSizeMB}MB`}
                  </span>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, field.onChange);
                    }}
                  />
                </label>
              )}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
