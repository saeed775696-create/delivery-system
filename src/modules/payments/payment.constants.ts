export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REJECTED: "REJECTED",
} as const;

export const PAYMENT_METHOD = {
  KURAIMI: "kuraimi",
  CASH_ACCOUNT: "cash_account",
} as const;
