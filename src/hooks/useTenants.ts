'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bookInspection,
  getLandlordTenants,
  getTenantBookmarks,
  getTenantInspections,
  getTenantTenancies,
  payForProperty,
  rateProperty,
  toggleBookmark,
  updateInspectionStatus,
} from '@/actions/tenancy';
import { QUERY_KEYS } from '@/config/property';
import type {
  BookInspectionFormData,
  PropertyPaymentFormData,
} from '@/lib/schemas/property';

export function useTenantInspections() {
  return useQuery({
    queryKey: QUERY_KEYS.tenantInspections(),
    queryFn: () => getTenantInspections(),
    staleTime: 30_000,
  });
}

// Tenant: tenancies

export function useTenantTenancies() {
  return useQuery({
    queryKey: QUERY_KEYS.tenantTenancies(),
    queryFn: () => getTenantTenancies(),
    staleTime: 30_000,
  });
}

//  Tenant: bookmarks / wishlist

export function useTenantBookmarks() {
  return useQuery({
    queryKey: QUERY_KEYS.tenantBookmarks(),
    queryFn: () => getTenantBookmarks(),
    staleTime: 30_000,
  });
}

//  Landlord: tenants

export function useLandlordTenants(propertyId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.landlordTenants(propertyId),
    queryFn: () => getLandlordTenants(propertyId),
    staleTime: 30_000,
  });
}

// Book inspection mutation

export function useBookInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BookInspectionFormData) => bookInspection(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-inspections'] });
      qc.invalidateQueries({ queryKey: ['approved-properties'] });
      // Also invalidate wallet since fee was deducted
      qc.invalidateQueries({ queryKey: ['user-wallet'] });
      qc.invalidateQueries({ queryKey: ['wallet-chart-data'] });
    },
  });
}

type UpdateInspectionStatusData = {
  inspectionId: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduled_date?: Date;
};

export function useUpdateInspectionStatusMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      inspectionId,
      status,
      scheduled_date,
    }: UpdateInspectionStatusData) =>
      updateInspectionStatus(inspectionId, status, scheduled_date),

    onSuccess: response => {
      if (response.success) {
        qc.invalidateQueries({ queryKey: ['tenant-inspections'] });
        qc.invalidateQueries({ queryKey: ['approved-properties'] });
      }
    },
    onError: error => {
      console.error('Update failed:', error);
    },
  });
}

// Pay for property mutation

export function usePayForProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PropertyPaymentFormData) => payForProperty(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-tenancies'] });
      qc.invalidateQueries({ queryKey: ['tenant-inspections'] });
      qc.invalidateQueries({ queryKey: ['approved-properties'] });
      qc.invalidateQueries({ queryKey: ['user-wallet'] });
      qc.invalidateQueries({ queryKey: ['wallet-chart-data'] });
    },
  });
}

// Toggle bookmark mutation

export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) => toggleBookmark(propertyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant-bookmarks'] });
      // Optimistic update for approved properties list (bookmark count)
      qc.invalidateQueries({ queryKey: ['approved-properties'] });
    },
  });
}

// Rate property mutation

export function useRateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId,
      rating,
      review,
    }: {
      propertyId: string;
      rating: number;
      review?: string;
    }) => rateProperty(propertyId, rating, review),
    onSuccess: (_data, { propertyId }) => {
      qc.invalidateQueries({ queryKey: ['property', propertyId] });
    },
  });
}
