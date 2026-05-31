import { db } from "@/db";
import { payments, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PAYMENT_STATUS, PAYMENT_METHOD } from "./payment.constants";
import { CreatePaymentDTO } from "./payment.types";
import { socket } from "@/socket/server";

export const paymentService = {
  // إنشاء عملية دفع
  async createPayment(data: CreatePaymentDTO) {
    const payment = await db
      .insert(payments)
      .values({
        orderId: data.orderId,
        userId: data.userId,
        amount: data.amount,
        method: data.method,
        status: PAYMENT_STATUS.PENDING,
        referenceNumber: data.referenceNumber || null,
      })
      .returning();

    return payment[0];
  },

  // تأكيد الدفع اليدوي (الكريمي)
  async confirmManualPayment(paymentId: string) {
    const payment = await db
      .update(payments)
      .set({ status: PAYMENT_STATUS.COMPLETED })
      .where(eq(payments.id, paymentId))
      .returning();

    if (!payment[0]) throw new Error("Payment not found");

    await db
      .update(orders)
      .set({ status: "PAID" })
      .where(eq(orders.id, payment[0].orderId));

    socket.emit("ORDER_PAID", {
      orderId: payment[0].orderId,
    });

    return payment[0];
  },

  // نظام "حاسب" (Credit)
  async applyCashAccount(orderId: string, userId: string, amount: number) {
    const payment = await db
      .insert(payments)
      .values({
        orderId,
        userId,
        amount,
        method: PAYMENT_METHOD.CASH_ACCOUNT,
        status: PAYMENT_STATUS.COMPLETED,
      })
      .returning();

    await db
      .update(orders)
      .set({ status: "PAID" })
      .where(eq(orders.id, orderId));

    return payment[0];
  },
};
