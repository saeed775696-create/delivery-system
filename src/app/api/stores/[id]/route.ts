import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { storeSchema } from "@/lib/validations";

// Get single store with products
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, id))
      .limit(1);

    if (!store) {
      return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });
    }

    const storeProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.storeId, id), eq(products.isAvailable, true)));

    return NextResponse.json({
      store,
      products: storeProducts,
    });
  } catch (error) {
    console.error("Get store error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب المتجر" },
      { status: 500 }
    );
  }
}

// Update store
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, id))
      .limit(1);

    if (!store) {
      return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });
    }

    if (store.ownerId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = storeSchema.partial().parse(body);

    const [updatedStore] = await db
      .update(stores)
      .set({
        ...validatedData,
        lat: validatedData.lat?.toString(),
        lng: validatedData.lng?.toString(),
      })
      .where(eq(stores.id, id))
      .returning();

    return NextResponse.json({ store: updatedStore });
  } catch (error) {
    console.error("Update store error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحديث المتجر" },
      { status: 500 }
    );
  }
}

// Toggle store status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isOpen } = body;

    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, id))
      .limit(1);

    if (!store) {
      return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });
    }

    if (store.ownerId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const [updatedStore] = await db
      .update(stores)
      .set({ isOpen })
      .where(eq(stores.id, id))
      .returning();

    return NextResponse.json({ store: updatedStore });
  } catch (error) {
    console.error("Toggle store status error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحديث حالة المتجر" },
      { status: 500 }
    );
  }
}
