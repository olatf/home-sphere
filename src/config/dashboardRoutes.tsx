import {
  FileText,
  HandCoins,
  Handshake,
  Heart,
  Landmark,
  ListChecks,
  MessageSquareMore as Messages,
  Telescope,
  UserCog,
  UsersRound,
  Wallet,
} from 'lucide-react';
export type DashboardRoute = {
  path: string;
  label: string;
  icon: React.ReactNode;
};

export const LandlordRoutes: DashboardRoute[] = [
  {
    path: '/dashboard',
    label: 'Overview',
    icon: <Telescope size={20} />,
  },
  {
    path: '/dashboard/listings',
    label: 'Listings',
    icon: <Landmark size={20} />,
  },
  {
    path: '/dashboard/tenants',
    label: 'Tenants',
    icon: <Handshake size={20} />,
  },
  {
    path: '/dashboard/tasks',
    label: 'Tasks',
    icon: <ListChecks size={20} />,
  },
];

export const TenantRoutes: DashboardRoute[] = [
  {
    path: '/dashboard',
    label: 'Overview',
    icon: <Telescope size={20} />,
  },

  {
    path: '/dashboard/rent',
    label: 'My Rents',
    icon: <Landmark size={20} />,
  },
  {
    path: '/dashboard/wishlists',
    label: 'Wishlists',
    icon: <Heart size={20} />,
  },
  {
    path: '/dashboard/tasks',
    label: 'Tasks',
    icon: <ListChecks size={20} />,
  },
];

export const CommonRoutes: DashboardRoute[] = [
  {
    path: '/dashboard/wallet',
    label: 'Wallet',
    icon: <Wallet size={20} />,
  },
  {
    path: '/dashboard/reports',
    label: 'Reports',
    icon: <FileText size={20} />,
  },

  {
    path: '/dashboard/messages',
    label: 'Messages',
    icon: <Messages size={20} />,
  },
  {
    path: '/dashboard/settings',
    label: 'Settings',
    icon: <UserCog size={20} />,
  },
];

export const AdminRoutes: DashboardRoute[] = [
  {
    path: '/admin',
    label: 'Overview',
    icon: <Telescope size={20} />,
  },
  {
    path: '/admin/properties',
    label: 'properties',
    icon: <Landmark size={20} />,
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: <UsersRound size={20} />,
  },
  {
    path: '/admin/tenants',
    label: 'Tenants',
    icon: <Handshake size={20} />,
  },
  {
    path: '/admin/tasks',
    label: 'Tasks',
    icon: <ListChecks size={20} />,
  },
  {
    path: '/admin/inspections-fees',
    label: 'Inspection Fees',
    icon: <HandCoins size={20} />,
  },
  {
    path: '/admin/wallet',
    label: 'Wallet',
    icon: <Wallet size={20} />,
  },
  {
    path: '/admin/messages',
    label: 'Messages',
    icon: <Messages size={20} />,
  },
  {
    path: '/admin/settings',
    label: 'Settings',
    icon: <UserCog size={20} />,
  },
];
