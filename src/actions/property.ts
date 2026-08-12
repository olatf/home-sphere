'use server';

import { revalidatePath } from 'next/cache';
import { getErrorMessage } from '@/helpers/error.helpers';
import { sanitizeRichText } from '@/helpers/sanitize.helpers';
import {
  type CreatePropertyFormData,
  createPropertySchema,
} from '@/lib/schemas/property';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/supabase/guards';
import { createClient } from '@/lib/supabase/server';
import type { Property, PropertyStatus } from '@/types/property';
import { notifyPropertyApproved, notifyPropertyRejected } from './messages';

export async function createProperty(
  data: CreatePropertyFormData,
  publish = false
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const parsed = createPropertySchema.safeParse(data);

  if (!parsed.success) {
    const errorMEssage = getErrorMessage(parsed.error.message);
    return { success: false, error: errorMEssage };
  }

  const maxDuration =
    parsed.data.listing_type === 'rent'
      ? 2
      : parsed.data.listing_type === 'lease'
        ? 5
        : 100;

  const { data: property, error } = await supabase
    .from('properties')
    .insert({
      landlord_id: user.id,
      ...parsed.data,
      description: sanitizeRichText(parsed.data.description),
      status: publish ? 'pending_review' : 'draft',
      max_duration_years: maxDuration,
      published_at: publish ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/listings');
  return { success: true, data: property as Property };
}

export async function updateProperty(
  propertyId: string,
  data: Partial<CreatePropertyFormData>
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const parsed = createPropertySchema.partial().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: getErrorMessage(parsed.error.message) };
  }

  const update = {
    ...parsed.data,
    ...(parsed.data.description !== undefined && {
      description: sanitizeRichText(parsed.data.description),
    }),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('properties')
    .update(update)
    .eq('id', propertyId)
    .eq('landlord_id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/properties/${propertyId}`);

  return { success: true };
}

export async function publishProperty(propertyId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('properties')
    .update({
      status: 'pending_review',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', propertyId)
    .eq('landlord_id', user.id)
    .eq('status', 'draft');

  if (error) return { success: false, error: error.message };

  revalidatePath(`/properties/${propertyId}`);

  return { success: true };
}

export async function deleteProperty(propertyId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId)
    .eq('landlord_id', user.id)
    .eq('status', 'draft');

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/listings');

  return { success: true };
}

export async function getLandlordProperties(filters?: {
  status?: PropertyStatus;
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized', data: null };

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 12;
  const from = (page - 1) * limit;

  let q = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('landlord_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (filters?.status) q = q.eq('status', filters.status);

  const { data, error, count } = await q;

  if (error) return { success: false, error: error.message, data: null };

  return {
    success: true,
    data: data as Property[],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getProperty(propertyId: string) {
  const admin = await createAdminClient();

  const { data, error } = await admin
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      error: error?.message || 'Property not found',
      data: null,
    };
  }

  const { data: owner, error: ownerError } = await admin
    .from('user_profiles')
    .select('full_name, avatar_url, phone, email')
    .eq('id', data.landlord_id)
    .maybeSingle();

  if (ownerError) {
    return {
      success: false,
      error: ownerError.message,
      data: null,
    };
  }

  const revisedData = {
    ...data,
    ...owner,
  };

  await admin.rpc('increment_property_views', {
    p_property_id: propertyId,
  });

  return { success: true, data: revisedData };
}

export async function reviewProperty(
  propertyId: string,
  action: 'approve' | 'reject',
  providing_legal_ads?: boolean,
  rejectionReason?: string
) {
  try {
    await requireAdmin();
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }

  const supabase = await createClient();

  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const update =
    action === 'approve'
      ? {
          status: 'approved',
          approved_by: user.id,
          legal_services_available: providing_legal_ads,
          approved_at: new Date().toISOString(),
        }
      : { status: 'rejected', rejection_reason: rejectionReason };

  const { data: property, error } = await admin
    .from('properties')
    .update(update)
    .eq('id', propertyId)
    .select('landlord_id, title')
    .single();
  if (error) return { success: false, error: error.message };

  const { data: landlord } = await admin
    .from('user_profiles')
    .select('email')
    .eq('id', property.landlord_id)
    .single();
  if (landlord) {
    if (action === 'approve')
      await notifyPropertyApproved(
        property.landlord_id,
        landlord.email,
        property.title,
        propertyId
      );
    else
      await notifyPropertyRejected(
        property.landlord_id,
        landlord.email,
        property.title,
        rejectionReason ?? ''
      );
  }

  revalidatePath('/admin/properties');
  return { success: true };
}

export async function getApprovedProperties(filters?: {
  listing_type?: string;
  property_type?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const admin = await createAdminClient();

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 12;
  const from = (page - 1) * limit;

  let q = admin
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('status', 'approved')
    .gt('available_units', 0)
    .order('published_at', { ascending: false })
    .range(from, from + limit - 1);

  if (filters?.listing_type) q = q.eq('listing_type', filters.listing_type);
  if (filters?.property_type) q = q.eq('property_type', filters.property_type);
  if (filters?.search) q = q.ilike('title', `%${filters.search}%`);

  const { data, error, count } = await q;

  if (error) return { success: false, error: error.message, data: null };

  return {
    success: true,
    data: data as Property[],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function adminGetAllProperties(filters?: {
  status?: PropertyStatus;
  page?: number;
}) {
  try {
    await requireAdmin();
  } catch (err) {
    return { success: false, error: getErrorMessage(err), data: null };
  }

  const admin = await createAdminClient();

  const page = filters?.page ?? 1;
  const limit = 15;
  const from = (page - 1) * limit;

  let q = admin
    .from('properties')
    .select(
      `
      *,
      user_profiles (
        full_name,
        email
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (filters?.status) q = q.eq('status', filters.status);

  const { data, error, count } = await q;

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  const refinedData = data?.map(property => {
    const landlordProfile = property.user_profiles;

    return {
      ...property,
      landlord_name: landlordProfile?.full_name,
      landlord_email: landlordProfile?.email,
    };
  });

  return {
    success: true,
    data: refinedData,
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}
