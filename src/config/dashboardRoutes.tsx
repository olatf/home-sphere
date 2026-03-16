import {
  Telescope,
  Handshake,
  Landmark,
  ListChecks,
  Wallet,
  FileText,
  MessageSquareMore as Messages,
  UserCog,
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
