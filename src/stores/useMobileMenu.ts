import { create } from 'zustand';

interface MobileMenuStore {
  open: boolean;
  toggle: () => void;
  close: () => void;
  openMenu: () => void;
}

export const useMobileMenu = create<MobileMenuStore>(set => ({
  open: false,
  toggle: () => set(state => ({ open: !state.open })),
  close: () => set({ open: false }),
  openMenu: () => set({ open: true }),
}));
