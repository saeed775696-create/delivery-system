import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, fullName, phone, role } = await req.json();

    await db
      .update(users)
      .set({
        fullName,
        phone,
        role,
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: "User updated",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
