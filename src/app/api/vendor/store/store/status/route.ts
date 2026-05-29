import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

const allowedStatus = ["open", "busy", "closed", "offline"];

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();

    if (!allowedStatus.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await db
      .update(stores)
      .set({
        isOpen: status,
      })
      .where(eq(stores.ownerId, session.userId));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 },
    );
  }
}
