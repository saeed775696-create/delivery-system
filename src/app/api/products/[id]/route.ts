import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

// Update product
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

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    // Check store ownership
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, product.storeId))
      .limit(1);

    if (store?.ownerId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = productSchema.partial().parse(body);

    const updateData: Record<string, unknown> = {};
    if (validatedData.nameAr !== undefined) updateData.nameAr = validatedData.nameAr;
    if (validatedData.nameEn !== undefined) updateData.nameEn = validatedData.nameEn;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.price !== undefined) updateData.price = validatedData.price.toString();
    if (validatedData.discountPrice !== undefined) updateData.discountPrice = validatedData.discountPrice.toString();
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.imageUrl !== undefined) updateData.imageUrl = validatedData.imageUrl;
    if (validatedData.isAvailable !== undefined) updateData.isAvailable = validatedData.isAvailable;
    if (validatedData.preparationTime !== undefined) updateData.preparationTime = validatedData.preparationTime;

    const [updatedProduct] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحديث المنتج" },
      { status: 500 }
    );
  }
}

// Toggle product availability
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

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, product.storeId))
      .limit(1);

    if (store?.ownerId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const [updatedProduct] = await db
      .update(products)
      .set({ isAvailable: body.isAvailable })
      .where(eq(products.id, id))
      .returning();

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error("Toggle product error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحديث المنتج" },
      { status: 500 }
    );
  }
}

// Delete product
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, product.storeId))
      .limit(1);

    if (store?.ownerId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في حذف المنتج" },
      { status: 500 }
    );
  }
}
