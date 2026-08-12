'use server';

import consola from 'consola';
import { revalidatePath } from 'next/cache';
import { SMPSRMD } from '@/config/constants';
import type {
  BookInspectionFormData,
  PropertyPaymentFormData,
} from '@/lib/schemas/property';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { calculateFees } from '@/types/property';
import {
  notifyInspectionBooked,
  notifyInspectionDay,
  notifyPaymentReceived,
} from './messages';

export async function bookInspection(data: BookInspectionFormData) {
  const supabase = await createClient();

  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const [propRes, feeRes] = await Promise.all([
    supabase
      .from('properties')
      .select(
        'id,landlord_id,pricing,title,available_units,current_tenants,property_type'
      )
      .eq('id', data.property_id)
      .eq('status', 'approved')
      .single(),
    admin
      .from('inspection_fee_config')
      .select('fee')
      .eq('property_type', data.property_type || '')
      .single(),
  ]);

  if (propRes.error || !propRes.data)
    return { success: false, error: 'Property not found' };

  const property = propRes.data;

  const fee = Number(feeRes.data?.fee ?? 0);

  if (fee <= 0)
    return { success: false, error: 'Invalid inspection fee configuration' };

  if (property.available_units <= 0)
    return { success: false, error: 'No available units' };

  const { data: wallet } = await supabase
    .from('wallets')
    .select('id,balance')
    .eq('user_id', user.id)
    .single();
  if (!wallet) return { success: false, error: 'Wallet not found' };
  if (wallet.balance < fee)
    return { success: false, error: 'Insufficient wallet balance' };

  const { data: adminWallet } = await admin
    .from('wallets')
    .select('id')
    .eq('user_id', SMPSRMD)
    .single();
  if (!adminWallet)
    return { success: false, error: 'Admin wallet not configured' };

  const reference = `INS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const { error: debitErr } = await supabase.rpc('debit_wallet', {
    wallet: wallet.id,
    amount: fee,
  });
  if (debitErr) return { success: false, error: 'Payment failed' };

  await admin.rpc('credit_wallet', { wallet: adminWallet.id, amount: fee });

  const { data: inspection, error: inspErr } = await admin
    .from('inspections')
    .insert({
      property_id: data.property_id,
      tenant_id: user.id,
      landlord_id: property.landlord_id,
      inspection_fee: fee,
      payment_reference: reference,
      notes: data.notes,
    })
    .select()
    .single();
  if (inspErr) return { success: false, error: inspErr.message };

  await admin
    .from('properties')
    .update({
      current_tenants: property.current_tenants + 1,
      available_units: property.available_units - 1,
    })
    .eq('id', data.property_id);

  await supabase.from('wallet_transactions').insert({
    user_id: user.id,
    wallet_id: wallet.id,
    transaction_type: 'inspection_payment',
    type: 'debit',
    amount: fee,
    status: 'completed',
    reference,
    description: `Inspection fee for "${property.title}"`,
  });

  const { data: tP } = await admin
    .from('user_profiles')
    .select('email')
    .eq('user_id', user.id)
    .single();

  await notifyInspectionBooked(user.id, tP?.email ?? '', property.title);

  revalidatePath('/tenant/my-rent');
  return { success: true, data: inspection, reference };
}

export async function payForProperty(data: PropertyPaymentFormData) {
  const supabase = await createClient();

  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', data.property_id)
    .eq('status', 'approved')
    .single();

  if (!property) return { success: false, error: 'Property not found' };

  const maxDuration =
    data.listing_type === 'rent' ? 2 : data.listing_type === 'lease' ? 5 : 100;

  if (data.duration_years > maxDuration)
    return { success: false, error: `Max duration is ${maxDuration} years` };

  const plan = {
    duration_months: property?.pricing?.instalment_plan?.duration_months ?? 0,
    interest_rate_percent:
      property?.pricing?.instalment_plan?.interest_rate_percent ?? 0,
    min_initial_payment_percent:
      property?.pricing?.instalment_plan?.min_initial_payment_percent ?? 0,
  };

  const basePrice = property.pricing.price;

  const cautionFee = property.pricing.caution_fee;

  const isInstalment = data.payment_plan === 'instalment';

  const fullFees = calculateFees(
    basePrice,
    cautionFee,
    data.duration_years,
    data.listing_type,
    data.legal_services_opted,
    isInstalment,
    plan
  );

  const amountDueNow =
    data.payment_plan === 'instalment' && data.initial_payment_percent
      ? (fullFees.tenant_total * data.initial_payment_percent) / 100
      : fullFees.tenant_total;

  const [
    { data: tenantWallet },
    { data: landlordWallet },
    { data: adminWallet },
  ] = await Promise.all([
    supabase
      .from('wallets')
      .select('id,balance')
      .eq('user_id', user.id)
      .single(),
    admin
      .from('wallets')
      .select(
        `
    id,
    user_profiles!user_id (
      full_name
    )
  `
      )
      .eq('user_id', property.landlord_id)
      .single(),
    admin.from('wallets').select('id').eq('user_id', SMPSRMD).single(),
  ]);

  if (!tenantWallet) return { success: false, error: 'Wallet not found' };

  if (tenantWallet.balance < amountDueNow)
    return { success: false, error: 'Insufficient wallet balance' };

  if (!landlordWallet || !adminWallet)
    return { success: false, error: 'Wallet configuration error' };

  const reference = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  let instalmentSchedule = null;
  if (data.payment_plan === 'instalment' && property.pricing.instalment_plan) {
    const remaining = fullFees.tenant_total - amountDueNow;
    const { duration_months, interest_rate_percent } =
      property.pricing.instalment_plan;
    const monthly =
      (remaining * (1 + interest_rate_percent / 100)) / duration_months;
    instalmentSchedule = Array.from({ length: duration_months }, (_, i) => ({
      instalment_number: i + 1,
      amount: Math.round(monthly * 100) / 100,
      due_date: new Date(
        Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: 'pending',
    }));
  }

  const landlordPayoutNow =
    data.payment_plan === 'full'
      ? fullFees.landlord_payout
      : (fullFees.landlord_payout * (data.initial_payment_percent ?? 100)) /
        100;
  const adminFeeNow =
    data.payment_plan === 'full'
      ? fullFees.total_admin_fee
      : (fullFees.total_admin_fee * (data.initial_payment_percent ?? 100)) /
        100;

  await supabase.rpc('process_property_payment', {
    p_tenant_wallet_id: tenantWallet.id,
    p_admin_wallet_id: adminWallet.id,
    p_landlord_wallet_id: landlordWallet.id,
    p_tenant_total: amountDueNow,
    p_landlord_payout: landlordPayoutNow,
    p_total_admin_fee: adminFeeNow,
  });

  const today = new Date();
  const endDate = new Date(today);
  endDate.setFullYear(endDate.getFullYear() + data.duration_years);

  const { data: tenancy, error: tenancyErr } = await admin
    .from('tenancies')
    .insert({
      property_id: data.property_id,
      tenant_id: user.id,
      landlord_id: property.landlord_id,
      listing_type: data.listing_type,
      duration_years: data.duration_years,
      total_amount: fullFees.tenant_total,
      admin_fee_percent: 10,
      legal_fee_percent: fullFees.legal_fee > 0 ? 5 : 0,
      landlord_payout: fullFees.landlord_payout,
      legal_services_opted: data.legal_services_opted,
      payment_plan: data.payment_plan,
      payment_reference: reference,
      instalment_schedule: instalmentSchedule,
      status: 'active',
      start_date: today.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    })
    .select()
    .single();
  if (tenancyErr) return { success: false, error: tenancyErr.message };

  const trnx_type =
    data.listing_type === 'sale' ? 'purchase_payment' : 'rent_payment';

  await Promise.all([
    supabase.from('wallet_transactions').insert({
      user_id: user.id,
      wallet_id: tenantWallet.id,
      transaction_type: trnx_type,
      type: 'debit',
      amount: amountDueNow,
      status: 'completed',
      reference,
      description: `Payment for "${property.title}"`,
    }),
    admin.from('wallet_transactions').insert({
      user_id: property.landlord_id,
      wallet_id: landlordWallet.id,
      transaction_type: 'landlord_payout',
      type: 'credit',
      amount: landlordPayoutNow,
      status: 'completed',
      reference,
      description: `Payout for "${property.title}"`,
    }),
    admin.from('wallet_transactions').insert({
      user_id: SMPSRMD,
      wallet_id: adminWallet.id,
      transaction_type: trnx_type,
      type: 'credit',
      amount: amountDueNow,
      status: 'completed',
      reference,
      description: `Payment for "${property.title}" by ${user?.user_metadata?.full_name || user?.user_metadata?.name}`,
    }),
    admin.from('wallet_transactions').insert({
      user_id: SMPSRMD,
      wallet_id: adminWallet.id,
      transaction_type: 'admin_transfer',
      type: 'debit',
      amount: landlordPayoutNow,
      status: 'completed',
      reference,
      description: `Payout for "${property.title}" to `,
    }),

    await admin
      .from('inspections')
      .update({
        has_committed_to_property: true,
        updated_at: today.toISOString(),
      })
      .eq('id', data.inspection_id),
  ]);

  const [{ data: tP }, { data: lP }] = await Promise.all([
    admin.from('user_profiles').select('email').eq('user_id', user.id).single(),
    admin
      .from('user_profiles')
      .select('email')
      .eq('user_id', property.landlord_id)
      .single(),
  ]);

  await notifyPaymentReceived(
    user.id,
    tP?.email ?? '',
    property.landlord_id,
    lP?.email ?? '',
    property.title,
    amountDueNow,
    landlordPayoutNow,
    reference
  );

  revalidatePath('/dashboard/rent');
  revalidatePath('/dashboard/tenants');
  revalidatePath('/admin/tenants');
  return { success: true, data: tenancy, reference, fullFees };
}

export async function toggleBookmark(propertyId: string) {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: existing } = await supabase
    .from('property_bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('property_id', propertyId)
    .single();
  if (existing) {
    await admin.from('property_bookmarks').delete().eq('id', existing.id);

    return { success: true, bookmarked: false };
  }

  await supabase
    .from('property_bookmarks')
    .insert({ user_id: user.id, property_id: propertyId });

  return { success: true, bookmarked: true };
}

export async function getTenantBookmarks() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, data: null };

  const { data, error } = await supabase
    .from('property_bookmarks')
    .select('*, properties(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { success: false, data: null };

  return { success: true, data };
}

export async function rateProperty(
  propertyId: string,
  rating: number,
  review?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  const { error } = await supabase
    .from('property_ratings')
    .upsert(
      { property_id: propertyId, tenant_id: user.id, rating, review },
      { onConflict: 'tenant_id,property_id' }
    );
  if (error) return { success: false, error: error.message };
  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

export async function getTenantInspections() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, data: null };

  const { data, error } = await supabase
    .from('inspections')
    .select('*, properties(title,feature_image,location)')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { success: false, data: null };

  return { success: true, data };
}

export async function getTenantTenancies() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, data: null };

  const { data, error } = await supabase
    .from('tenancies')
    .select('*, properties(title,feature_image,location)')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { success: false, data: null };

  return { success: true, data };
}

export async function getLandlordTenants(propertyId?: string) {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, data: null };

  let q = admin
    .from('tenancies')
    .select(
      `
      *, 
      properties(title, feature_image), 
      user_profiles:tenant_id(full_name, email, avatar_url, phone),
      inspections:inspection_id(*) 
    `
    )
    .eq('landlord_id', user.id)
    .order('created_at', { ascending: false });

  if (propertyId) {
    q = q.eq('property_id', propertyId);
  }

  const { data, error } = await q;

  if (error) {
    consola.log(error);
    return { success: false, data: null, error: error.message };
  }
  consola.log('tenants: ', data.length);

  return { success: true, data };
}

interface InstalmentItem {
  instalment_number: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_at?: string;
  reference?: string;
}

export async function payInstalment(tenancyId: string) {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: tenancy, error: tenancyErr } = await supabase
    .from('tenancies')
    .select('*, properties(title, landlord_id, pricing)')
    .eq('id', tenancyId)
    .eq('tenant_id', user.id)
    .single();

  if (tenancyErr || !tenancy) {
    return { success: false, error: 'Tenancy not found' };
  }

  if (tenancy.payment_plan !== 'instalment') {
    return {
      success: false,
      error: 'This tenancy is not on an instalment plan',
    };
  }

  const schedule = (tenancy.instalment_schedule ?? []) as InstalmentItem[];

  const nextDue = schedule.find(
    s => s.status === 'pending' || s.status === 'overdue'
  );
  if (!nextDue) {
    return { success: false, error: 'All instalments have been paid' };
  }

  const amountDue = nextDue.amount;

  const [
    { data: tenantWallet },
    { data: landlordWallet },
    { data: adminWallet },
  ] = await Promise.all([
    supabase
      .from('wallets')
      .select('id,balance')
      .eq('user_id', user.id)
      .single(),
    admin
      .from('wallets')
      .select('id')
      .eq('user_id', tenancy.properties.landlord_id)
      .single(),
    admin
      .from('wallets')
      .select('id')
      .eq('user_id', process.env.ADMIN_WALLET_USER_ID!)
      .single(),
  ]);

  if (!tenantWallet) return { success: false, error: 'Wallet not found' };
  if (tenantWallet.balance < amountDue)
    return { success: false, error: 'Insufficient wallet balance' };
  if (!landlordWallet || !adminWallet)
    return { success: false, error: 'Wallet configuration error' };

  const reference = `INST-${tenancyId.slice(0, 8).toUpperCase()}-${nextDue.instalment_number}-${Date.now()}`;

  const adminCut = Math.round(amountDue * 0.1 * 100) / 100;
  const landlordCut = amountDue - adminCut;

  await supabase.rpc('process_property_payment', {
    p_tenant_wallet_id: tenantWallet.id,
    p_admin_wallet_id: adminWallet.id,
    p_landlord_wallet_id: landlordWallet.id,
    p_tenant_total: amountDue,
    p_landlord_payout: landlordCut,
    p_total_admin_fee: adminCut,
  });

  const updatedSchedule = schedule.map(s =>
    s.instalment_number === nextDue.instalment_number
      ? { ...s, status: 'paid', paid_at: new Date().toISOString(), reference }
      : s
  );

  const allPaid = updatedSchedule.every(s => s.status === 'paid');

  const { error: updateErr } = await admin
    .from('tenancies')
    .update({
      instalment_schedule: updatedSchedule,
      ...(allPaid ? { status: 'active' } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', tenancyId);

  if (updateErr) return { success: false, error: updateErr.message };

  await Promise.all([
    supabase.from('wallet_transactions').insert({
      user_id: user.id,
      wallet_id: tenantWallet.id,
      transaction_type: 'rent_payment',
      type: 'debit',
      amount: amountDue,
      status: 'completed',
      reference,
      description: `Instalment ${nextDue.instalment_number} for "${tenancy.properties.title}"`,
    }),
    admin.from('wallet_transactions').insert({
      user_id: tenancy.properties.landlord_id,
      wallet_id: landlordWallet.id,
      transaction_type: 'landlord_payout',
      type: 'credit',
      amount: landlordCut,
      status: 'completed',
      reference,
      description: `Instalment ${nextDue.instalment_number} payout for "${tenancy.properties.title}"`,
    }),
  ]);

  revalidatePath('/dashboard/rent');
  revalidatePath('/dashboard/tenants');

  return {
    success: true,
    instalmentPaid: nextDue.instalment_number,
    remainingCount: updatedSchedule.filter(
      s => s.status === 'pending' || s.status === 'overdue'
    ).length,
    fullyPaid: allPaid,
    reference,
  };
}

export async function updateInspectionStatus(
  inspectionId: string,
  status: 'scheduled' | 'completed' | 'cancelled',
  scheduled_date?: Date | null
) {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: isAdmin } = await supabase.rpc('is_admin');

  if (!isAdmin) {
    // Non-admins may only cancel their own inspection — anything else
    // (marking complete, rescheduling) is an admin-only action.
    if (status !== 'cancelled') {
      return { success: false, error: 'Unauthorized' };
    }

    const { data: owned } = await supabase
      .from('inspections')
      .select('id')
      .eq('id', inspectionId)
      .eq('tenant_id', user.id)
      .maybeSingle();

    if (!owned) return { success: false, error: 'Unauthorized' };
  }

  const today = new Date();

  // Calculate expiry only if completed
  const expiresAt =
    status === 'completed'
      ? new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
      : null;

  const { data, error } = await admin
    .from('inspections')
    .update({
      status,
      updated_at: today.toISOString(),
      ...(status === 'completed' && {
        completed_at: today.toISOString(),
        expires_at: expiresAt,
      }),
      ...(scheduled_date instanceof Date && {
        scheduled_date: scheduled_date.toISOString(),
      }),
    })
    .eq('id', inspectionId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await notifyInspectionDay(
    data.tenant_id,
    status,
    data.tenant_email,
    data.properties.title,
    data.scheduled_date,
    expiresAt ?? ''
  );

  revalidatePath('/admin/tenants');
  revalidatePath('/dashboard/rent');

  return { success: true, data };
}
