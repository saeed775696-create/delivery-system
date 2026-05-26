import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await db
      .update(products)
      .set({
        isAvailable: !product.isAvailable,
      })
      .where(eq(products.id, productId));

    return NextResponse.json({
      success: true,
      newStatus: !product.isAvailable,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to toggle product" },
      { status: 500 },
    );
  }
}
