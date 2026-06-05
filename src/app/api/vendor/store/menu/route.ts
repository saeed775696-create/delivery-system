import { db } from "@/db";
import { storeSections, products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");

  if (!storeId) {
    return Response.json({ error: "Missing storeId" }, { status: 400 });
  }

  const cats = await db
    .select()
    .from(storeSections)
    .where(eq(storeSections.storeId, storeId));

  const prods = await db.select().from(products);

  const menu = cats.map((cat) => ({
    ...cat,
    products: prods.filter((p) => p.categoryId === cat.id),
  }));

  return Response.json(menu);
}
