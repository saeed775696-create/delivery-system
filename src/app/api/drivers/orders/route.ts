import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/modules/orders/order.service";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const orders =
      await OrderService.getAvailableOrders();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء جلب الطلبات",
      },
      { status: 500 }
    );
  }
}

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
      { error: "حدث خطأ أثناء قبول الطلب" },
      { status: 500 }
    );
  }
}