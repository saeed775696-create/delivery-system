import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/modules/orders/order.service";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId مطلوب" },
        { status: 400 }
      );
    }

    const order = await OrderService.assignDriver(
      orderId,
      session.userId
    );

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء قبول الطلب",
      },
      { status: 500 }
    );
  }
}