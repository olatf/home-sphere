'use client';

import { Loader2, Settings } from 'lucide-react';
import { useInspectionFees } from '@/hooks/useProperty';
import { InspectionFeeRow } from './InspectionFeeRow';

export function AdminInspectionFees() {
  const { data: fees, isLoading } = useInspectionFees();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
          <Settings className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h1 className="font-bold font-primary text-2xl text-gray-900">
            Inspection Fees
          </h1>
          <p className="mt-0.5 font-secondary text-gray-500 text-sm">
            Set the inspection fee tenants pay per property type. Landlords
            cannot override these.
          </p>
        </div>
      </div>

      {/* How it works info */}
      <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
        <p className="mb-1 font-primary font-semibold text-brand text-sm">
          How inspection fees work
        </p>
        <ul className="space-y-1 font-secondary text-gray-600 text-xs">
          <li>
            • When a tenant books an inspection, the fee for that property’s
            type is charged from their wallet
          </li>
          <li>
            • The fee goes into the admin wallet — landlords receive nothing
            from inspection fees
          </li>
          <li>
            • Tenants have 14 days after paying to commit to renting/purchasing
            the property
          </li>
          <li>
            • Inspection fees are non-refundable if the tenant does not commit
            within 14 days
          </li>
          <li>
            • The platform fee (5% each from tenant and landlord) only applies
            on the full property payment
          </li>
        </ul>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(fees ?? []).map(
            (f: {
              property_type: string;
              fee: number;
              description?: string;
            }) => (
              <InspectionFeeRow
                key={f.property_type}
                propertyType={f.property_type}
                currentFee={f.fee}
                currentDescription={f.description}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
