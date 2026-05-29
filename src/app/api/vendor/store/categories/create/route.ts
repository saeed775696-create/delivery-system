import { db } from "@/db";
import { storeCategories } from "@/db/schema";

export async function POST(req: Request) {
  const body = await req.json();

  const { storeId, nameAr } = body;

  const category = await db
    .insert(storeCategories)
    .values({
      storeId,
      nameAr,
    })
    .returning();

  return Response.json(category[0]);
}
