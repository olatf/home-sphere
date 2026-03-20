import { create } from 'zustand';

export type TransactionType =
  | 'deposit'
  | 'inspection_payment'
  | 'rent_payment'
  | 'purchase_payment'
  | 'admin_transfer'
  | 'landlord_payout'
  | 'withdrawal';

export interface PaymentConfig {
  /** Amount in NGN */
  amount: number;
  /** Short label shown in the modal (e.g. "Inspection Fee") */
  label: string;
  /** Longer description stored in wallet_transactions */
  description: string;
  transactionType: TransactionType;
  /** Supabase wallet UUID of the receiver (for property payments) */
  receiverWalletId?: string;
  /** Arbitrary metadata forwarded to Paystack and stored in the transaction */
  metadata?: Record<string, unknown>;
  /** Called after a successful payment — use to refresh UI state */
  onSuccess?: (reference: string) => void | Promise<void>;
  /** Called if the user cancels or an error occurs */
  onCancel?: () => void;
}

interface PaymentStore {
  isOpen: boolean;
  config: PaymentConfig | null;
  openPayment: (config: PaymentConfig) => void;
  closePayment: () => void;
}

export const usePaymentStore = create<PaymentStore>(set => ({
  isOpen: false,
  config: null,

  openPayment: config => set({ isOpen: true, config }),

  closePayment: () => set({ isOpen: false, config: null }),
}));
