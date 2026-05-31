import { db } from "@/db";
import { payments, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PAYMENT_STATUS } from "./payment.constants";

export const handleLocalWalletWebhook = async (req: any, res: any) => {
  try {
    const { transaction_id, status_from_bank } = req.body;

    if (status_from_bank !== "SUCCESS") {
      return res.status(400).send("FAILED");
    }

    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.referenceNumber, transaction_id))
      .limit(1);

    if (!payment[0]) {
      return res.status(404).send("Payment not found");
    }

    await db
      .update(payments)
      .set({ status: PAYMENT_STATUS.COMPLETED })
      .where(eq(payments.id, payment[0].id));

    await db
      .update(orders)
      .set({ status: "PAID" })
      .where(eq(orders.id, payment[0].orderId));

    return res.status(200).send("OK");
  } catch (err) {
    return res.status(500).send("ERROR");
  }
};
