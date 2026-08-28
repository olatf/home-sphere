import { type PaymentConfig, usePaymentStore } from '@/stores/paymentStore';

/**
 * usePayment — trigger the global payment modal from any component.
 *
 * @example
 * const { openPayment } = usePayment();
 *
 * openPayment({
 *   amount: 15000,
 *   label: 'Inspection Fee',
 *   description: 'Inspection payment for 5 Lekki Close',
 *   transactionType: 'inspection_payment',
 *   onSuccess: (ref) => router.push(`/bookings?ref=${ref}`),
 * });
 */
export function usePayment() {
  const { openPayment, closePayment } = usePaymentStore();

  return {
    openPayment: (config: PaymentConfig) => openPayment(config),
    closePayment,
  };
}
