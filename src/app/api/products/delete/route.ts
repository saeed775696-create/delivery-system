import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { productId } = await req.json();

  await db.delete(products).where(eq(products.id, productId));

  return Response.json({ success: true });
}
