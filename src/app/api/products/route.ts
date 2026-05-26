import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";  
import { productSchema } from "@/lib/validations";

// GET all products (vendor store)
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, session.userId))
      .limit(1);

    if (!store) {
      return NextResponse.json([]);
    }

    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.storeId, store.id));

    return NextResponse.json({ products: allProducts });
  } catch (error) {
    return NextResponse.json(
      { error: "خطأ في جلب المنتجات" },
      { status: 500 }
    );
  }
}

// CREATE product
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const data = productSchema.parse(body);

    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, session.userId))
      .limit(1);

    if (!store) {
      return NextResponse.json(
        { error: "لا يوجد متجر" },
        { status: 400 }
      );
    }

    const [product] = await db
      .insert(products)
      .values({
        storeId: store.id,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        description: data.description,
        price: data.price.toString(),
        discountPrice: data.discountPrice?.toString(),
        category: data.category,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable ?? true,
        preparationTime: data.preparationTime ?? 15,
      })
      .returning();

    return NextResponse.json({ product });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء المنتج" },
      { status: 500 }
    );
  }
}