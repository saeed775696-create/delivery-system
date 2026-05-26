import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";

export class StoreService {
  static async getStores(
    category?: string | null,
    search?: string | null
  ) {
    const whereConditions = [];

    if (category && category !== "all") {
      whereConditions.push(
        eq(
          stores.category,
          category as
            | "food"
            | "pharmacy"
            | "grocery"
            | "restaurant"
            | "bakery"
            | "other"
        )
      );
    }

    if (search) {
      whereConditions.push(
        sql`${stores.nameAr} ILIKE ${"%" + search + "%"}`
      );
    }

    return db
      .select({
        id: stores.id,
        nameAr: stores.nameAr,
        nameEn: stores.nameEn,
        description: stores.description,
        category: stores.category,
        rating: stores.rating,
        imageUrl: stores.imageUrl,
        isOpen: stores.isOpen,
        totalOrders: stores.totalOrders,
        addressDescription: stores.addressDescription,
      })
      .from(stores)
      .where(
        whereConditions.length > 0
          ? and(eq(stores.isOpen, true), ...whereConditions)
          : eq(stores.isOpen, true)
      );
  }
}