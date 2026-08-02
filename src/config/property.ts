export const QUERY_KEYS = {
  // Properties
  landlordProperties: (filters?: object) =>
    ['landlord-properties', filters] as const,
  approvedProperties: (filters?: object) =>
    ['approved-properties', filters] as const,
  property: (id: string) => ['property', id] as const,
  adminProperties: (filters?: object) => ['admin-properties', filters] as const,

  // Tenancy
  tenantInspections: () => ['tenant-inspections'] as const,
  tenantTenancies: () => ['tenant-tenancies'] as const,
  tenantBookmarks: () => ['tenant-bookmarks'] as const,
  landlordTenants: (propertyId?: string) =>
    ['landlord-tenants', propertyId] as const,

  // Messages
  messages: (filters?: object) => ['messages', filters] as const,
  unreadCount: () => ['messages-unread-count'] as const,

  // Tasks
  myTasks: (filters?: object) => ['my-tasks', filters] as const,

  // Fees
  inspectionFees: () => ['inspection-fees'] as const,
} as const;
