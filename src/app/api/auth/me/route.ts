import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AuthService } from "@/modules/auth/auth.service";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "غير مسجل الدخول" },
        { status: 401 }
      );
    }

    const user = await AuthService.getCurrentUser(session.userId);

    return NextResponse.json({
      user: {
        id: user?.id,
        phone: user?.phone,
        role: user?.role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "حدث خطأ" },
      { status: 500 }
    );
  }
}