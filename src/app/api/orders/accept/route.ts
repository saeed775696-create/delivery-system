// src/app/api/orders/accept/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { orderId, driverId } = await req.json();

  const updated = await db
    .update(orders)
    // cast to any because the generated orders type may not include the timestamp field
    .set({
      driverId,
      status: "accepted",
      acceptedAt: new Date(),
    } as any)
    .where(eq(orders.id, orderId))
    .returning();

  return NextResponse.json({
    success: true,
    order: updated[0],
  });
}