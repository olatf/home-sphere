export type Role =
  | 'admin'
  | 'landlord'
  | 'tenant'
  | 'superAdmin'
  | 'administrator';

type Permission =
  | 'admin:access'
  | 'superAdmin:access'
  | 'administrator:access'
  | 'landlord:access'
  | 'tenant:access'
  | 'manage-properties:access'
  | 'book-inspect:access'
  | 'approve-properties:access'
  | 'manage-users:access'
  | 'verify-accounts:access';

type PermissionCheck = boolean;

const rolePermissions: Record<
  Role,
  Partial<Record<Permission, PermissionCheck>>
> = {
  admin: {
    'admin:access': true,
    'verify-accounts:access': true,
    'approve-properties:access': true,
    'manage-users:access': true,
  },
  superAdmin: {
    'admin:access': true,
    'superAdmin:access': true,
    'administrator:access': true,
    'manage-users:access': true,
    'manage-properties:access': true,
    'book-inspect:access': true,
    'approve-properties:access': true,
    'verify-accounts:access': true,
  },
  landlord: {
    'landlord:access': true,
    'manage-properties:access': true,
  },
  tenant: {
    'tenant:access': true,
    'book-inspect:access': true,
  },
  administrator: {
    'administrator:access': true,
    'verify-accounts:access': true,
  },
};

export function hasPermission(
  role: Role | null | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return rolePermissions[role]?.[permission] ?? false;
}
