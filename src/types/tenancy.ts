import type { InstalmentItem } from '@/tenants/InstalmentScheduleCard';

export interface InspectionRow {
  id: string;
  property_id: string;
  status: string;
  inspection_fee: number;
  completed_date?: Date | null;
  scheduled_date?: Date | null;
  notes?: string;
  payment_reference: string;
  has_committed_to_property: boolean;
  expires_at: Date | null;
  created_at: Date | null;
  properties?: {
    title: string;
    feature_image: string;
    location: { city: string; state: string };
  };
}

export interface TenancyRow {
  id: string;
  status: string;
  listing_type: string;
  duration_years: number;
  start_date?: string;
  end_date?: string;
  total_amount: number;
  instalment_schedule?: InstalmentItem[];
  landlord_payout: number;
  legal_services_opted: boolean;
  payment_plan: string;
  payment_reference: string;
  created_at: string;
  properties?: {
    title: string;
    feature_image: string;
    location: { city: string; state: string };
  };
}

export const TENANCY_STATUS: Record<
  string,
  { label: string; className: string }
> = {
  inspection_paid: {
    label: 'Inspected',
    className: 'bg-amber-100 text-amber-700',
  },
  committed: { label: 'Committed', className: 'bg-blue-100 text-blue-700' },
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
  expired: { label: 'Expired', className: 'bg-gray-100 text-gray-500' },
  terminated: { label: 'Terminated', className: 'bg-red-100 text-red-600' },
};

export const INSPECTION_STATUS: Record<
  string,
  { label: string; className: string }
> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-700',
  },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500' },
  expired: { label: 'Expired', className: 'bg-red-100 text-red-500' },
};
