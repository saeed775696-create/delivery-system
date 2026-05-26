import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

   const [store] = await db
  .select()
  .from(stores)
  .where(eq(stores.ownerId, session.userId))
  .limit(1);

    if (!store) {
      return NextResponse.json(
        { error: "المتجر غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({ store });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "حدث خطأ" },
      { status: 500 }
    );
  }
}