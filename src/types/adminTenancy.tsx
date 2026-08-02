import { AlertCircle, Calendar, CheckCircle2, Clock } from 'lucide-react';

export const TENANCY_TABS = ['all', 'committed', 'expired', 'terminated'];

export const INSPECTION_TABS = [
  'all',
  'pending',
  'completed',
  'cancelled',
  'expired',
];

export const TENANCY_STATUS_CFG: Record<
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

export const INSPECTION_STATUS_CFG: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700',
    icon: Clock,
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-blue-100 text-blue-700',
    icon: Calendar,
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-500',
    icon: AlertCircle,
  },
  expired: {
    label: 'Expired',
    className: 'bg-red-100 text-red-500',
    icon: AlertCircle,
  },
};

export type AdminTenant = {
  id: string;
  status: string;
  listing_type: string;
  duration_years: number;
  start_date?: Date | null;
  end_date?: Date | null;
  total_amount: number;
  created_at: Date | null;
  properties?: {
    title?: string;
    location?: string;
    feature_image?: string;
    property_type?: string;
  };
  user_profiles?: {
    full_name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    avatar?: string;
  };
};

export type AdminInspection = {
  id: string;
  status: string;
  inspection_fee: number;
  scheduled_date?: Date | null;
  completed_date?: Date | null;
  has_committed_to_property: boolean;
  expires_at: Date | null;
  created_at: Date | null;
  notes?: string;
  properties?: { title?: string; location?: string; property_type?: string };
  user_profiles?: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
};
