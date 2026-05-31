import { PAYMENT_STATUS, PAYMENT_METHOD } from "./payment.constants";

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export interface CreatePaymentDTO {
  orderId: string;
  userId: string;
  amount: number;
  method: PaymentMethod;

  referenceNumber?: string; // رقم حوالة الكريمي
}
