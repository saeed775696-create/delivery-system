import { db } from "@/db";
import { storeCategories, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import VendorMenuClient from "./vendor-menu-client";

export default async function VendorMenuPage() {
  const storeId = "YOUR_STORE_ID"; // اربطه لاحقاً من session

  const categories = await db
    .select()
    .from(storeCategories)
    .where(eq(storeCategories.storeId, storeId));

  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId));

  return (
    <VendorMenuClient
      initialCategories={categories}
      initialProducts={allProducts}
      storeId={storeId}
    />
  );
}