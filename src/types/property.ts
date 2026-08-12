import type { Role } from '@/lib/accessPolice';

export const isSuperAdmin = (role: Role | null | undefined) =>
  role === 'superAdmin';

// Property types

export type PropertyStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'revised'
  | 'rejected'
  | 'suspended';
export type PropertyType =
  | 'apartment'
  | 'house'
  | 'commercial'
  | 'land'
  | 'shortlet';
export type ListingType = 'rent' | 'lease' | 'sale';
export type PaymentPlan = 'full' | 'instalment';
export type InspectionStatus =
  | 'pending'
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'expired';
export type TenancyStatus =
  | 'inspection_paid'
  | 'committed'
  | 'active'
  | 'expired'
  | 'terminated';
export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'forwarded'
  | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  parking_spaces: number;
  floor_area_sqm: number;
  floors?: number;
  year_built?: number;
  furnishing: 'furnished' | 'semi_furnished' | 'unfurnished';
  amenities: string[];
  utilities_included: string[];
}

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  lga: string;
  country: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
}

export interface InstalmentPlan {
  min_initial_payment_percent: number;
  duration_months: number;
  interest_rate_percent: number;
}

export interface PropertyPricing {
  price: number;
  caution_fee?: number;
  // agency_fee?: number;
  inspection_fee: number;
  allows_instalment: boolean;
  instalment_plan?: InstalmentPlan;
}

export interface Property {
  id: string;
  landlord_id: string;
  title: string;
  description: string;
  property_type: PropertyType;
  listing_type: ListingType;
  status: PropertyStatus;
  location: PropertyLocation;
  features: PropertyFeatures;
  pricing: PropertyPricing;
  feature_image: string;
  gallery: string[];
  proof_of_ownership: string;
  video_tour_url?: string;
  available_units: number;
  current_tenants: number;
  max_duration_years: number;
  legal_services_available: boolean;
  tags: string[];
  views_count: number;
  bookmarks_count: number;
  rating_average: number;
  rating_count: number;
  published_at?: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Inspection {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  status: InspectionStatus;
  inspection_fee: number;
  payment_reference: string;
  scheduled_date?: string;
  completed_date?: string;
  notes?: string;
  expires_at: string;
  created_at: string;
}

export interface InstalmentScheduleItem {
  instalment_number: number;
  amount: number;
  due_date: string;
  paid_at?: string;
  payment_reference?: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Tenancy {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  inspection_id?: string;
  status: TenancyStatus;
  listing_type: ListingType;
  duration_years: number;
  start_date?: string;
  end_date?: string;
  total_amount: number;
  admin_fee_percent: number;
  legal_fee_percent: number;
  landlord_payout: number;
  legal_services_opted: boolean;
  payment_plan: PaymentPlan;
  payment_reference: string;
  instalment_schedule?: InstalmentScheduleItem[];
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  property_id?: string;
  assigned_by: string;
  assigned_to: string;
  forwarded_from?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  attachments?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  subject: string;
  body: string;
  author_name?: string;
  author_email?: string;
  type?: string;
  is_read: boolean;
  created_at: string;
}

// Fee calculator

export interface FeeBreakdown {
  base_amount: number;
  tenant_fee: number; // 5% of base
  landlord_fee: number; // 5% of base
  legal_fee: number; // 5% of base if opted
  total_admin_fee: number; // tenant_fee + landlord_fee + legal_fee
  tenant_total: number; // base + tenant_fee + legal_fee (what tenant pays)
  landlord_payout: number; // base - landlord_fee (what landlord receives)
  initial_deposit?: number; // Add the initial_deposit property
  interest_amount?: number;
  monthly_payment?: number;
  total_with_interest?: number;
}

export function calculateFees(
  baseAmount: number,
  cautionFee: number,
  durationYears: number,
  listingType: string,
  legalServicesOpted: boolean,
  isInstalment: boolean,
  plan?: {
    duration_months: number;
    interest_rate_percent: number;
    min_initial_payment_percent: number;
  }
): FeeBreakdown {
  const tenantFee = (baseAmount * 5) / 100;
  const landlordFee = (baseAmount * 5) / 100;
  const legalFee = legalServicesOpted ? (baseAmount * 5) / 100 : 0;

  const totalPrincipal =
    listingType === 'sale' ? baseAmount : baseAmount * durationYears;

  // Total basic costs before interest
  const baseTotalWithFees = totalPrincipal + tenantFee + legalFee + cautionFee;

  let instalmentDetails = {};

  if (isInstalment && plan) {
    // 1. Calculate Initial Deposit (e.g., 30% of the base price)
    const initialDeposit =
      (totalPrincipal * plan.min_initial_payment_percent) / 100;

    // 2. Calculate Interest on the total principal
    const interestAmount = (totalPrincipal * plan.interest_rate_percent) / 100;

    // 3. Remaining balance + Interest + Admin Fees + Caution
    const balanceToPay =
      totalPrincipal -
      initialDeposit +
      interestAmount +
      tenantFee +
      legalFee +
      cautionFee;

    // 4. Monthly breakdown
    const monthlyPayment = balanceToPay / plan.duration_months;

    instalmentDetails = {
      initial_deposit: initialDeposit,
      interest_amount: interestAmount,
      monthly_payment: monthlyPayment,
      total_with_interest: baseTotalWithFees + interestAmount,
    };
  }

  return {
    base_amount: baseAmount,
    tenant_fee: tenantFee,
    landlord_fee: landlordFee,
    legal_fee: legalFee,
    total_admin_fee: tenantFee + landlordFee + legalFee,
    tenant_total:
      isInstalment && plan
        ? baseTotalWithFees +
          (totalPrincipal * plan.interest_rate_percent) / 100
        : baseTotalWithFees,
    landlord_payout: totalPrincipal + cautionFee - landlordFee,
    ...instalmentDetails, // Spreads the extra info if it's an instalment
  };
}
