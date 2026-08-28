'use client';

import { Eye, Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { deleteFileByUrl, uploadFile } from '@/actions/uploadFile';
import { BrandAddressAutofill } from '@/components/common/BrandAddressAutofill';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandInput } from '@/components/common/BrandInput';
import { RichTextEditor } from '@/components/common/TextEditor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { baseClass } from '@/config/constants';
import { formatCurrency } from '@/helpers/currency.helpers';
import type { CreatePropertyFormData } from './propertyFormShared';
import {
  AMENITIES,
  FURNISHING_TYPES,
  LISTING_TYPES,
  PROPERTY_TYPES,
  STEP_LABELS,
  type Step,
  UTILITIES,
} from './propertyFormShared';

type F = UseFormReturn<CreatePropertyFormData, unknown, CreatePropertyFormData>;

async function uploadAndSet(
  file: File,
  bucket: string,
  folder: string,
  onSuccess: (url: string) => void,
  onError: (msg: string) => void
) {
  const r = await uploadFile(file, bucket, folder);
  if (r.success && r.url) onSuccess(r.url);
  else onError(r.error ?? 'Upload failed');
}

export function StepBasic({ form }: { form: F }) {
  const listingType = useWatch({ control: form.control, name: 'listing_type' });

  return (
    <div className="space-y-6 rounded-2xl border bg-white p-3 md:p-6">
      <h2 className="font-primary font-semibold text-gray-900 text-lg">
        Basic Information
      </h2>

      <BrandInput<CreatePropertyFormData>
        formRef={form}
        name="title"
        label="Property Title"
        placeholder="e.g. Modern 3-Bedroom Apartment in Lekki"
        required
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description *</FormLabel>
            <FormControl>
              <RichTextEditor
                initialContent={field.value}
                onChange={field.onChange}
                placeholder="Describe the property in detail — condition, surroundings, access, etc."
                maxChars={5000}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <BrandInput<CreatePropertyFormData>
          formRef={form}
          name="property_type"
          label="Property Type"
          variant="select"
          required
          options={PROPERTY_TYPES.map(t => ({
            value: t,
            label: t.charAt(0).toUpperCase() + t.slice(1),
          }))}
        />

        <BrandInput<CreatePropertyFormData>
          formRef={form}
          name="listing_type"
          label="Listing Type"
          variant="select"
          required
          options={LISTING_TYPES.map(t => ({
            value: t,
            label: t.charAt(0).toUpperCase() + t.slice(1),
          }))}
        />
      </div>

      {listingType !== 'sale' && (
        <FormField
          control={form.control}
          name="duration_years"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Max Duration —{' '}
                {listingType === 'rent' ? 'max 2 years' : 'max 5 years'}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className={baseClass}
                  min={1}
                  max={listingType === 'rent' ? 2 : 5}
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="available_units"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Units *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className={baseClass}
                  min={1}
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// Step: Location

export const StepLocation = ({ form }: { form: F }) => {
  return (
    <div className="space-y-6 rounded-2xl border bg-white p-3 md:p-6">
      <h2 className="font-primary font-semibold text-gray-900 text-lg">
        Location
      </h2>

      <BrandAddressAutofill
        value={form.watch('location.address') || ''}
        onValueChange={next => {
          form.setValue('location.address', next, {
            shouldValidate: true,
          });
          form.setValue('location.latitude', undefined);
          form.setValue('location.longitude', undefined);
        }}
        onSelectAddress={selection => {
          form.setValue('location.address', selection.address, {
            shouldValidate: true,
          });

          form.setValue(
            'location.city',
            selection.city || form.getValues('location.city'),
            { shouldValidate: true }
          );

          form.setValue('location.latitude', selection.lat, {
            shouldValidate: true,
          });

          form.setValue('location.longitude', selection.lng, {
            shouldValidate: true,
          });
          form.setValue('location.state', selection.state, {
            shouldValidate: true,
          });
          form.setValue('location.lga', selection.lga, {
            shouldValidate: true,
          });
        }}
        placeholder="Start typing or enter an address manually"
      />

      <div className="grid grid-cols-2 gap-4">
        <BrandInput<CreatePropertyFormData>
          formRef={form}
          name="location.city"
          label="City"
          placeholder="Enter city"
          required
        />
        <BrandInput<CreatePropertyFormData>
          formRef={form}
          name="location.state"
          label="State"
          placeholder="Enter state"
          required
        />
        <BrandInput<CreatePropertyFormData>
          formRef={form}
          name="location.lga"
          label="LGA"
          placeholder="Local Government Area"
          required
        />
      </div>
    </div>
  );
};

// Step: Features

export const StepFeatures = ({ form }: { form: F }) => {
  return (
    <div className="space-y-6 rounded-2xl border bg-white p-3 md:p-6">
      <h2 className="font-primary font-semibold text-gray-900 text-lg">
        Property Features
      </h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[
          { name: 'features.bedrooms' as const, label: 'Bedrooms' },
          { name: 'features.bathrooms' as const, label: 'Bathrooms' },
          { name: 'features.toilets' as const, label: 'Toilets' },
          { name: 'features.parking_spaces' as const, label: 'Parking' },
          {
            name: 'features.floor_area_sqm' as const,
            label: 'Floor Area (sqm)',
          },
        ].map(({ name, label }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className={baseClass}
                    min={0}
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>

      <BrandInput<CreatePropertyFormData>
        formRef={form}
        name="features.furnishing"
        label="Furnishing"
        variant="select"
        required
        options={FURNISHING_TYPES}
      />

      <FormField
        control={form.control}
        name="features.amenities"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amenities</FormLabel>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {AMENITIES.map(a => (
                <div key={a} className="flex items-center gap-2">
                  <Checkbox
                    checked={field.value?.includes(a)}
                    onCheckedChange={checked => {
                      const c = field.value ?? [];
                      field.onChange(
                        checked ? [...c, a] : c.filter(x => x !== a)
                      );
                    }}
                  />
                  <span className="font-secondary text-gray-600 text-sm capitalize">
                    {a.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="features.utilities_included"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Utilities Included</FormLabel>
            <div className="flex flex-wrap gap-3">
              {UTILITIES.map(u => (
                <div key={u} className="flex items-center gap-2">
                  <Checkbox
                    checked={field.value?.includes(u)}
                    onCheckedChange={checked => {
                      const c = field.value ?? [];
                      field.onChange(
                        checked ? [...c, u] : c.filter(x => x !== u)
                      );
                    }}
                  />
                  <span className="font-secondary text-gray-600 text-sm capitalize">
                    {u}
                  </span>
                </div>
              ))}
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

// Step: Pricing

export function StepPricing({ form }: { form: F }) {
  const listingType = useWatch({ control: form.control, name: 'listing_type' });
  const allowsInstalment = useWatch({
    control: form.control,
    name: 'pricing.allows_instalment',
  });

  return (
    <div className="space-y-6 rounded-2xl border bg-white p-3 md:p-6">
      <h2 className="font-primary font-semibold text-gray-900 text-lg">
        Pricing
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="pricing.price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {listingType === 'sale' ? 'Sale Price (₦)' : 'Annual Rent (₦)'}{' '}
                *
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  value={formatCurrency(field.value ?? 0)}
                  className={baseClass}
                  inputMode="numeric"
                  placeholder="₦0"
                  onChange={e => {
                    const raw = e.target.value.replace(/[^\d]/g, '');
                    field.onChange(raw ? parseInt(raw, 10) : 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pricing.caution_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Caution Fee (₦)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  value={formatCurrency(field.value ?? 0)}
                  className={baseClass}
                  inputMode="numeric"
                  placeholder="₦0"
                  onChange={e => {
                    const raw = e.target.value.replace(/[^\d]/g, '');
                    field.onChange(raw ? parseInt(raw, 10) : 0);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="pricing.agency_fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agency Fee (₦)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className={baseClass}
                  min={0}
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        /> */}
      </div>

      <FormField
        control={form.control}
        name="pricing.allows_instalment"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <FormLabel>Allow Instalment Payments</FormLabel>
              <p className="font-secondary text-gray-400 text-xs">
                Let tenants pay in instalments
              </p>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {allowsInstalment && (
        <div className="space-y-4 rounded-xl bg-gray-50 p-4">
          <h3 className="font-primary font-semibold text-gray-700 text-sm">
            Instalment Plan
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="pricing.instalment_plan.min_initial_payment_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Initial (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className={baseClass}
                      min={10}
                      max={90}
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricing.instalment_plan.duration_months"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Months</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className={baseClass}
                      min={1}
                      max={60}
                      {...field}
                      onChange={e =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricing.instalment_plan.interest_rate_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className={baseClass}
                      min={0}
                      max={30}
                      step={0.5}
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Step: Media

async function deleteUserFile(url: string) {
  const r = await deleteFileByUrl(url);
  return r.success;
}

interface StepMediaProps {
  form: F;
  uploading: boolean;
  setUploading: (v: boolean) => void;
}

export function StepMedia({ form, setUploading }: StepMediaProps) {
  const [uploadingSection, setUploadingSection] = useState<
    'feature-image' | 'gallery' | 'proof-of-ownership' | null
  >(null);

  const [deletingSection, setDeletingSection] = useState<
    'feature-image' | 'gallery' | 'proof-of-ownership' | null
  >(null);

  const featureImage =
    useWatch({ control: form.control, name: 'feature_image' }) ??
    form.getValues('feature_image') ??
    '';

  const gallery =
    useWatch({ control: form.control, name: 'gallery' }) ??
    form.getValues('gallery') ??
    [];

  const proofUrl =
    useWatch({ control: form.control, name: 'proof_of_ownership' }) ??
    form.getValues('proof_of_ownership') ??
    '';

  async function handleFeatureImage(file: File) {
    setUploading(true);
    setUploadingSection('feature-image');
    await uploadAndSet(
      file,
      'properties',
      'feature-images',
      url => {
        form.setValue('feature_image', url, { shouldDirty: true });
        toast.success('Feature image uploaded');
      },
      msg => toast.error(msg)
    );
    setUploading(false);
    setUploadingSection(null);
  }

  async function handleDeleteImage(url: string) {
    if (!url) return;
    setDeletingSection('feature-image');
    await deleteUserFile(url);
    form.setValue('feature_image', '', { shouldDirty: true });
    toast.success('Image deleted');
    setDeletingSection(null);
  }

  async function handleGallery(files: FileList) {
    setUploading(true);
    setUploadingSection('gallery');
    const results = await Promise.all(
      Array.from(files).map(f => uploadFile(f, 'properties', 'gallery'))
    );
    const urls = results.filter(r => r.success && r.url).map(r => r.url!);
    form.setValue('gallery', [...gallery, ...urls], { shouldDirty: true });
    setUploading(false);
    setUploadingSection(null);
    toast.success(`${urls.length} image(s) uploaded`);
  }

  async function handleDeleteGalleryImage(url: string, i: number) {
    if (!url) return;
    setDeletingSection('gallery');
    await deleteUserFile(url);
    form.setValue(
      'gallery',
      gallery.filter((_, idx) => idx !== i),
      { shouldDirty: true }
    );
    toast.success('Image deleted');
    setDeletingSection(null);
  }

  async function handleProof(file: File) {
    setUploading(true);
    setUploadingSection('proof-of-ownership');
    await uploadAndSet(
      file,
      'properties',
      'proof-of-ownership',
      url => {
        form.setValue('proof_of_ownership', url, { shouldDirty: true });
        toast.success('Document uploaded');
      },
      msg => toast.error(msg)
    );
    setUploading(false);
    setUploadingSection(null);
  }

  async function handleDeleteProof() {
    if (!proofUrl) return;
    setDeletingSection('proof-of-ownership');
    await deleteUserFile(proofUrl);
    form.setValue('proof_of_ownership', '', { shouldDirty: true });
    toast.success('Document deleted');
    setDeletingSection(null);
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-white p-3 md:p-6">
      <h2 className="font-primary font-semibold text-gray-900 text-lg">
        Media & Documents
      </h2>

      <div>
        <p className="mb-2 font-medium text-gray-700 text-sm">
          Feature Image *
        </p>

        {featureImage ? (
          <div className="relative">
            <div className="relative mt-3 h-56 w-full overflow-hidden rounded-xl">
              <Image
                src={featureImage}
                alt="Feature"
                fill
                unoptimized={featureImage.includes('127.0.0.1')}
                className="object-cover"
              />
            </div>
            <button
              type="button"
              disabled={deletingSection === 'feature-image'}
              onClick={() => handleDeleteImage(featureImage)}
              className="absolute top-5 right-2 flex items-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-rose-600 text-xs transition hover:bg-rose-500 hover:text-white disabled:opacity-50"
            >
              {deletingSection === 'feature-image' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </>
              )}
            </button>
          </div>
        ) : uploadingSection === 'feature-image' ? (
          <div className="flex h-56 items-center justify-center rounded-xl border border-gray-200 border-dashed">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-gray-400 text-sm">
              Uploading {uploadingSection}...
            </span>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-gray-200 border-dashed p-6 transition hover:border-brand">
            <Upload className="h-6 w-6 text-gray-400" />
            <span className="font-secondary text-gray-400 text-sm">
              Click to upload
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e =>
                e.target.files?.[0] && handleFeatureImage(e.target.files[0])
              }
            />
          </label>
        )}

        {form.formState.errors.feature_image && (
          <p className="mt-1 text-red-500 text-xs">
            {form.formState.errors.feature_image.message}
          </p>
        )}
      </div>

      {/* ── Gallery */}
      <div>
        <p className="mb-2 font-medium text-gray-700 text-sm">
          Gallery *{' '}
          <span className="font-secondary text-gray-400 text-xs">
            (min 1, max 20)
          </span>
        </p>

        {gallery.length > 0 ? (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {gallery.map((url, i) => (
              <div key={url} className="relative">
                <div className="relative h-20 w-full overflow-hidden rounded-lg">
                  <Image
                    src={url}
                    alt=""
                    fill
                    unoptimized={url.includes('127.0.0.1')}
                    className="object-cover"
                  />
                </div>
                <BrandButton
                  type="button"
                  disabled={deletingSection === 'gallery'}
                  onClick={() => handleDeleteGalleryImage(url, i)}
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white disabled:opacity-50"
                  leftIcon={<X className="size-3" />}
                />
              </div>
            ))}

            {/* Add more button */}
            {gallery.length < 20 && (
              <label className="flex h-20 cursor-pointer items-center justify-center rounded-lg border-2 border-gray-200 border-dashed transition hover:border-brand">
                <Plus className="h-5 w-5 text-gray-400" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e =>
                    e.target.files && handleGallery(e.target.files)
                  }
                />
              </label>
            )}
          </div>
        ) : uploadingSection === 'gallery' ? (
          <div className="flex h-20 items-center justify-center rounded-lg border border-gray-200 border-dashed">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-gray-400 text-sm">
              Uploading {uploadingSection}...
            </span>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-gray-200 border-dashed p-6 transition hover:border-brand">
            <Plus className="h-6 w-6 text-gray-400" />
            <span className="font-secondary text-gray-400 text-sm">
              Upload multiple images
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && handleGallery(e.target.files)}
            />
          </label>
        )}
      </div>

      {/* Proof of ownership  */}
      <div>
        <p className="mb-1 font-medium text-gray-700 text-sm">
          Proof of Ownership *
        </p>
        <p className="mb-2 font-secondary text-gray-400 text-xs">
          C of O, deed of assignment, survey plan, or other document
        </p>

        {proofUrl ? (
          <div className="flex items-center justify-between rounded-xl border bg-gray-50 px-4 py-3">
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-brand text-xs hover:underline"
            >
              <Eye className="h-3.5 w-3.5" /> View uploaded document
            </a>
            <button
              type="button"
              disabled={deletingSection === 'proof-of-ownership'}
              onClick={handleDeleteProof}
              className="flex items-center gap-1 text-red-500 text-xs transition hover:text-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        ) : uploadingSection === 'proof-of-ownership' ? (
          <div className="flex h-12 items-center justify-center rounded-lg border border-gray-200 border-dashed">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-gray-400 text-sm">
              Uploading proof of ownership...
            </span>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-gray-200 border-dashed p-6 transition hover:border-brand">
            <Upload className="h-6 w-6 text-gray-400" />
            <span className="font-secondary text-gray-400 text-sm">
              Upload PDF or image
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={e =>
                e.target.files?.[0] && handleProof(e.target.files[0])
              }
            />
          </label>
        )}
      </div>

      {/* ── Video tour  */}
      <BrandInput<CreatePropertyFormData>
        formRef={form}
        name="video_tour_url"
        label="Video Tour URL (optional)"
        placeholder="https://youtube.com/..."
      />
    </div>
  );
}

// Step: Review

interface StepReviewProps {
  form: F;
  submitting: boolean;
  uploading: boolean;
  status?: string;
  onDraft: () => void;
  onPublish: () => void;
}

export const StepReview = ({
  form,
  submitting,
  uploading,
  status,
  onDraft,
  onPublish,
}: StepReviewProps) => {
  const title = useWatch({ control: form.control, name: 'title' });
  const propertyType = useWatch({
    control: form.control,
    name: 'property_type',
  });
  const listingType = useWatch({ control: form.control, name: 'listing_type' });
  const address = useWatch({ control: form.control, name: 'location.address' });
  const city = useWatch({ control: form.control, name: 'location.city' });
  const price = useWatch({ control: form.control, name: 'pricing.price' });
  const availableUnits = useWatch({
    control: form.control,
    name: 'available_units',
  });
  const gallery = useWatch({ control: form.control, name: 'gallery' }) ?? [];

  return (
    <div className="space-y-4 rounded-2xl border bg-white p-6">
      <h2 className="font-primary font-semibold text-gray-900 text-lg">
        Review & Submit
      </h2>
      <div className="space-y-2 font-secondary text-gray-600 text-sm">
        <p>
          <span className="font-medium">Title:</span> {title}
        </p>
        <p>
          <span className="font-medium">Type:</span> {propertyType} ·{' '}
          {listingType}
        </p>
        <p>
          <span className="font-medium">Location:</span> {address}, {city}
        </p>
        <p>
          <span className="font-medium">Price:</span> ₦{price?.toLocaleString()}
        </p>
        <p>
          <span className="font-medium">Units:</span> {availableUnits}
        </p>
        <p>
          <span className="font-medium">Gallery:</span> {gallery.length}{' '}
          image(s)
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={submitting}
          onClick={onDraft}
        >
          {submitting ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button
          type="button"
          className="flex-1 bg-brand hover:bg-brand-dark"
          disabled={submitting || uploading}
          onClick={onPublish}
        >
          {status === 'rejected' ? `Re-submit` : 'Submit for Review'}
        </Button>
      </div>
    </div>
  );
};

export function StepNavigator({
  steps,
  current,
  onStep,
}: {
  steps: readonly Step[];
  current: Step;
  onStep: (s: Step) => void;
}) {
  const currentIndex = steps.indexOf(current);
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {steps.map((s, i) => (
        <button
          key={s}
          type="button"
          onClick={() => onStep(s)}
          className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 font-medium text-xs transition ${
            s === current
              ? 'bg-brand text-white'
              : i < currentIndex
                ? 'bg-brand/20 text-brand'
                : 'bg-gray-100 text-gray-400'
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
            {i + 1}
          </span>
          {STEP_LABELS[s]}
        </button>
      ))}
    </div>
  );
}

export function StepNavButtons({
  steps,
  current,
  onStep,
}: {
  steps: readonly Step[];
  current: Step;
  onStep: (s: Step) => void;
}) {
  const i = steps.indexOf(current);
  return (
    <div className="flex justify-between">
      <Button
        type="button"
        variant="outline"
        disabled={i === 0}
        onClick={() => onStep(steps[i - 1])}
      >
        Back
      </Button>
      <Button
        type="button"
        className="bg-brand hover:bg-brand-dark"
        onClick={() => onStep(steps[i + 1])}
      >
        Next
      </Button>
    </div>
  );
}
