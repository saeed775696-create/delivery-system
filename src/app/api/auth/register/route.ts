import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, customerDetails, drivers, stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.phone, validatedData.phone))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "رقم الهاتف مسجل مسبقاً" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        phone: validatedData.phone,
        password: hashedPassword,
        fullName: validatedData.fullName,
        role: validatedData.role,
      })
      .returning();

    // Create role-specific details
    if (validatedData.role === "customer") {
      await db.insert(customerDetails).values({
        userId: newUser.id,
        savedAddresses: [],
      });
    } else if (validatedData.role === "driver") {
      await db.insert(drivers).values({
        userId: newUser.id,
        vehicleType: "motorcycle",
        isAvailable: false,
      });
    } else if (validatedData.role === "vendor") {
      await db.insert(stores).values({
        ownerId: newUser.id,
        nameAr: `متجر ${validatedData.fullName}`,
        category: "food",
        isOpen: false,
      });
    }

    // Create token
    const token = await createToken({
      userId: newUser.id,
      phone: newUser.phone,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        phone: newUser.phone,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    });

    response.cookies.set(setAuthCookie(token));

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "حدث خطأ في التسجيل" },
      { status: 500 }
    );
  }
}
