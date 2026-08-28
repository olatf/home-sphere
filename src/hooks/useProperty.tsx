'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  adminGetAllProperties,
  deleteProperty,
  getApprovedProperties,
  getLandlordProperties,
  getProperty,
  publishProperty,
  reviewProperty,
} from '@/actions/property';
import { QUERY_KEYS } from '@/config/property';
import type { PropertyStatus } from '@/types/property';

interface LandlordPropertiesFilters {
  status?: PropertyStatus;
  page?: number;
  limit?: number;
}

export function useLandlordProperties(filters?: LandlordPropertiesFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.landlordProperties(filters),
    queryFn: () => getLandlordProperties(filters),
    staleTime: 30_000,
  });
}

// Public: approved property listing

interface ApprovedPropertiesFilters {
  listing_type?: string;
  property_type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useApprovedProperties(filters?: ApprovedPropertiesFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.approvedProperties(filters),
    queryFn: () => getApprovedProperties(filters),
    staleTime: 30_000,
  });
}

// Single property

export function useProperty(propertyId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.property(propertyId),
    queryFn: () => getProperty(propertyId),
    staleTime: 60_000,
    enabled: !!propertyId,
  });
}

// Admin: all properties

interface AdminPropertiesFilters {
  status?: PropertyStatus;
  page?: number;
}

export function useAdminProperties(filters?: AdminPropertiesFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.adminProperties(filters),
    queryFn: () => adminGetAllProperties(filters),
    staleTime: 20_000,
  });
}

// Publish property mutation

export function usePublishProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) => publishProperty(propertyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['landlord-properties'] });
    },
  });
}

// Delete property mutation

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) => deleteProperty(propertyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['landlord-properties'] });
    },
  });
}

// Admin review mutation

export function useReviewProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId,
      action,
      providing_legal_ads,
      rejectionReason,
    }: {
      propertyId: string;
      action: 'approve' | 'reject';
      providing_legal_ads?: boolean;
      rejectionReason?: string;
    }) =>
      reviewProperty(propertyId, action, providing_legal_ads, rejectionReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-properties'] });
    },
  });
}

// Inspection fee config

async function fetchInspectionFees() {
  const res = await fetch('/api/inspection-fees');
  if (!res.ok) throw new Error('Failed to fetch inspection fees');
  return res.json() as Promise<
    { property_type: string; fee: number; description?: string }[]
  >;
}

export function useInspectionFees() {
  return useQuery({
    queryKey: QUERY_KEYS.inspectionFees(),
    queryFn: fetchInspectionFees,
    staleTime: 5 * 60_000, // fees change rarely
  });
}
