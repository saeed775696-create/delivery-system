// src/app/api/orders/accept/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { orderId, driverId } = await req.json();

  const updated = await db
    .update(orders)
    .set({
      driverId,
      status: "accepted",
      acceptedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  return NextResponse.json({
    success: true,
    order: updated[0],
  });
}