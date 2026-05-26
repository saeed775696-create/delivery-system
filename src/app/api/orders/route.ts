import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/modules/orders/order.service";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "غير مسجل الدخول" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 🔒 validation أساسي
    if (!body.storeId || !body.items) {
      return NextResponse.json(
        { error: "بيانات الطلب غير مكتملة" },
        { status: 400 }
      );
    }

    const order = await OrderService.create({
      customerId: session.userId,
      storeId: body.storeId,
      items: body.items,
      deliveryAddress: body.deliveryAddress,
      paymentMethod: body.paymentMethod || "cash_on_delivery",
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("ORDER ERROR:", error);

    return NextResponse.json(
      { error: "فشل إنشاء الطلب" },
      { status: 500 }
    );
  }
}