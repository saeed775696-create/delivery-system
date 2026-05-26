import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores, products } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { storeSchema } from "@/lib/validations";

// Get all stores (public) or filter by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query = db
      .select({
        id: stores.id,
        nameAr: stores.nameAr,
        nameEn: stores.nameEn,
        description: stores.description,
        category: stores.category,
        lat: stores.lat,
        lng: stores.lng,
        addressDescription: stores.addressDescription,
        isOpen: stores.isOpen,
        imageUrl: stores.imageUrl,
        phone: stores.phone,
        rating: stores.rating,
        totalOrders: stores.totalOrders,
        workingHours: stores.workingHours,
      })
      .from(stores)
      .where(eq(stores.isOpen, true))
      .$dynamic();

    if (category && category !== "all") {
      query = query.where(
        and(
          eq(stores.isOpen, true),
          eq(stores.category, category as "food" | "pharmacy" | "grocery" | "restaurant" | "bakery" | "other")
        )
      );
    }

    if (search) {
      query = query.where(
        and(
          eq(stores.isOpen, true),
          sql`${stores.nameAr} ILIKE ${"%" + search + "%"}`
        )
      );
    }

    const allStores = await query;

    return NextResponse.json({ stores: allStores });
  } catch (error) {
    console.error("Get stores error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب المتاجر" },
      { status: 500 }
    );
  }
}

// Create store (vendor only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "vendor" && session.role !== "admin")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = storeSchema.parse(body);

    // Check if vendor already has a store
    const existingStore = await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, session.userId))
      .limit(1);

    if (existingStore.length > 0 && session.role !== "admin") {
      return NextResponse.json(
        { error: "لديك متجر مسجل مسبقاً" },
        { status: 400 }
      );
    }

    const [newStore] = await db
      .insert(stores)
      .values({
        ownerId: session.userId,
        nameAr: validatedData.nameAr,
        nameEn: validatedData.nameEn,
        description: validatedData.description,
        category: validatedData.category,
        lat: validatedData.lat?.toString(),
        lng: validatedData.lng?.toString(),
        addressDescription: validatedData.addressDescription,
        phone: validatedData.phone,
        isOpen: false,
      })
      .returning();

    return NextResponse.json({ store: newStore }, { status: 201 });
  } catch (error) {
    console.error("Create store error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء المتجر" },
      { status: 500 }
    );
  }
}
