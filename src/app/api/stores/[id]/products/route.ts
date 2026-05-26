import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

// Get products for a store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const storeProducts = await db
      .select()
      .from(products)
      .where(eq(products.storeId, id));

    return NextResponse.json({ products: storeProducts });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب المنتجات" },
      { status: 500 }
    );
  }
}

// Add product to store
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;

    // Check store ownership
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
    const validatedData = productSchema.parse(body);

    const [newProduct] = await db
      .insert(products)
      .values({
        storeId: id,
        nameAr: validatedData.nameAr,
        nameEn: validatedData.nameEn,
        description: validatedData.description,
        price: validatedData.price.toString(),
        discountPrice: validatedData.discountPrice?.toString(),
        category: validatedData.category,
        imageUrl: validatedData.imageUrl,
        isAvailable: validatedData.isAvailable,
        preparationTime: validatedData.preparationTime,
      })
      .returning();

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Add product error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إضافة المنتج" },
      { status: 500 }
    );
  }
}
