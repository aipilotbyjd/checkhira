export const PAYMENT_SOURCES = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'UPI', value: 'upi' },
  { label: 'Check', value: 'check' },
  { label: 'Card', value: 'card' },
] as const;

export type PaymentSource = (typeof PAYMENT_SOURCES)[number]['value'];
