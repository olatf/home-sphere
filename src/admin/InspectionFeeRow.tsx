'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { QUERY_KEYS } from '@/config/property';
import { formatCurrency } from '@/helpers/currency.helpers';
import { cn } from '@/lib/utils';

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  house: 'House',
  commercial: 'Commercial',
  land: 'Land',
  shortlet: 'Shortlet',
};

const feeSchema = z.object({
  fee: z.number().min(100, 'Minimum fee is ₦100'),
  description: z.string().optional(),
});

type FeeFormData = z.infer<typeof feeSchema>;

export const InspectionFeeRow = ({
  propertyType,
  currentFee,
  currentDescription,
}: {
  propertyType: string;
  currentFee: number;
  currentDescription?: string;
}) => {
  const qc = useQueryClient();

  const form = useForm<FeeFormData>({
    resolver: zodResolver(feeSchema),
    defaultValues: { fee: currentFee, description: currentDescription ?? '' },
  });

  const baseClass = [
    'w-full py-2 px-6 text-sm',
    'placeholder:text-gray-400',
    'outline-none',
    'focus:outline-none',
    'focus-visible:outline-none',
    'ring-0',
    'focus:ring-0',
    'focus-visible:!ring-0',
    'focus-visible:!ring-offset-0',
    'focus-visible:!ring-transparent',
    'shadow-none',
    'focus:shadow-none',
    'focus-visible:shadow-none',
    'focus:border-slate-500',
    'focus-visible:border-brand',
  ].join(' ');

  async function handleSave(data: FeeFormData) {
    const res = await fetch(`/api/inspection-fees/${propertyType}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? 'Failed to update fee');
      return;
    }

    toast.success(`${PROPERTY_TYPE_LABELS[propertyType]} fee updated`);
    qc.invalidateQueries({ queryKey: QUERY_KEYS.inspectionFees() });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSave)}
        className="rounded-2xl border bg-white p-5 transition hover:shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
              <span className="font-bold font-primary text-brand text-xs">
                {PROPERTY_TYPE_LABELS[propertyType][0]}
              </span>
            </div>
            <div>
              <p className="font-primary font-semibold text-gray-800 capitalize">
                {PROPERTY_TYPE_LABELS[propertyType]}
              </p>
              <p className="font-secondary text-gray-400 text-xs">
                Current: {formatCurrency(currentFee)}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium font-secondary text-emerald-700 text-xs">
            {formatCurrency(currentFee)}
          </span>
        </div>

        <div className="space-y-3">
          <FormField
            control={form.control}
            name="fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-secondary text-gray-500 text-xs">
                  Inspection Fee (₦)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 text-sm">
                      ₦
                    </span>
                    <Input
                      type="number"
                      min={100}
                      className={cn('font-secondary', baseClass)}
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-secondary text-gray-500 text-xs">
                  Note (optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Standard inspection fee for houses"
                    className={cn(baseClass)}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-brand hover:bg-brand-dark"
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Save Fee
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
