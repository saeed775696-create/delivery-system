import { db } from "@/db";
import { storeSections, products, stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import VendorMenuClient from "./vendor-menu-client";
import { requireVendor } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function VendorMenuPage() {
  // الحصول على جلسة البائع
  const session = await requireVendor();

  // جلب متجر البائع الحالي
  const [vendorStore] = await db
    .select({ id: stores.id })
    .from(stores)
    .where(eq(stores.ownerId, session.userId))
    .limit(1);

  if (!vendorStore) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-lg font-semibold">لا يوجد متجر مرتبط بحسابك</p>
        <p className="text-sm">يرجى إنشاء متجر أولاً</p>
      </div>
    );
  }

  const storeId = vendorStore.id;

  // جلب الأقسام
  const categories = await db
    .select()
    .from(storeSections)
    .where(eq(storeSections.storeId, storeId));

  // جلب المنتجات
  const allProductsRaw = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId));

  const allProducts = allProductsRaw.map((p) => ({
    ...p,
    isAvailable: p.isAvailable ?? false,
  }));

  return (
    <VendorMenuClient
      initialCategories={categories}
      initialProducts={allProducts}
      storeId={storeId}
    />
  );
}