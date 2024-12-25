export const PAYMENT_SOURCES = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'UPI', value: 'upi' },
  { label: 'Check', value: 'check' },
] as const;

export type PaymentSource = (typeof PAYMENT_SOURCES)[number]['value'];
