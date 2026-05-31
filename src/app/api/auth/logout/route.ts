import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({
    success: true,
    message: "Logged out",
  });

  // إذا تستخدم cookie للجلسة
  res.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return res;
}

// (اختياري) لو المتصفح يطلب GET بالغلط
export async function GET() {
  return NextResponse.json({ message: "Use POST to logout" }, { status: 405 });
}
