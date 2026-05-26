import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireVendor } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await requireVendor();

    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, String(session.userId)))
      .limit(1);

    if (!store) {
      return NextResponse.json({ products: [] });
    }

    const data = await db
      .select()
      .from(products)
      .where(eq(products.storeId, store.id));

    return NextResponse.json({ products: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
export async function POST(req: Request) {
  try {
    const session = await requireVendor();
    const body = await req.json();

    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, String(session.userId)))
      .limit(1);

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const [product] = await db
      .insert(products)
      .values({
        storeId: store.id,
        nameAr: body.nameAr,
        price: body.price,
        description: body.description,
        isAvailable: true,
      })
      .returning();

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}