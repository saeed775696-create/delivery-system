import { db } from "@/db";
import { products } from "@/db/schema";

export async function POST(req: Request) {
  const body = await req.json();

  const product = await db
    .insert(products)
    .values({
      storeId: body.storeId,
      categoryId: body.categoryId,
      nameAr: body.nameAr,
      price: body.price,
      imageUrl: body.imageUrl,
    })
    .returning();

  return Response.json(product[0]);
}
