import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignFollowUpTask,
  changeAdminPassword,
  getAdminInspections,
  getAdminOverviewStats,
  getAdminTenants,
  getAdminUsers,
  getUserDetail,
  suspendUser,
  unsuspendUser,
  updateAdminProfile,
  updateUserRole,
} from '@/actions/admin';

// Query keys
export const ADMIN_KEYS = {
  overview: () => ['admin-overview'] as const,
  users: (f?: object) => ['admin-users', f] as const,
  userDetail: (id: string) => ['admin-user-detail', id] as const,
  tenants: (f?: object) => ['admin-tenants', f] as const,
  inspections: (f?: object) => ['admin-inspections', f] as const,
};

// Overview
export function useAdminOverview() {
  return useQuery({
    queryKey: ADMIN_KEYS.overview(),
    queryFn: getAdminOverviewStats,
    staleTime: 60_000,
  });
}

// Users
export function useAdminUsers(filters?: {
  search?: string;
  role?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ADMIN_KEYS.users(filters),
    queryFn: () => getAdminUsers(filters),
    staleTime: 30_000,
  });
}

export function useUserDetail(userId: string) {
  return useQuery({
    queryKey: ADMIN_KEYS.userDetail(userId),
    queryFn: () => getUserDetail(userId),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useSuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      reason,
      hours,
    }: {
      userId: string;
      reason: string;
      hours?: number;
    }) => suspendUser(userId, reason, hours),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useUnsuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => unsuspendUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

// Tenants + Inspections
export function useAdminTenants(filters?: {
  search?: string;
  status?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ADMIN_KEYS.tenants(filters),
    queryFn: () => getAdminTenants(filters),
    staleTime: 30_000,
  });
}

export function useAdminInspections(filters?: {
  search?: string;
  status?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ADMIN_KEYS.inspections(filters),
    queryFn: () => getAdminInspections(filters),
    staleTime: 30_000,
  });
}

export function useAssignFollowUpTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assignFollowUpTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tenants'] });
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
    },
  });
}

//  Settings
export function useUpdateAdminProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-overview'] }),
  });
}

export function useChangeAdminPassword() {
  return useMutation({
    mutationFn: (password: string) => changeAdminPassword(password),
  });
}
