import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest
) {
  try {
    const session = await getSession();

    if (
      !session ||
      session.role !== "driver"
    ) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 403 }
      );
    }

    const { orderId, status } =
      await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "بيانات ناقصة" },
        { status: 400 }
      );
    }

    const updateData: Record<
      string,
      unknown
    > = {
      status,
    };

    if (status === "picked_up") {
      updateData.pickedUpAt =
        new Date();
    }

    if (status === "delivered") {
      updateData.deliveredAt =
        new Date();
    }

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "فشل تحديث الطلب",
      },
      {
        status: 500,
      }
    );
  }
}