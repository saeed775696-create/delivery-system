import { db } from "@/db";
import { storeSections } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { id } = await req.json();

  await db.delete(storeSections).where(eq(storeSections.id, id));

  return Response.json({ success: true });
}
