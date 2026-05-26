import { NextResponse } from "next/server";
import { OrderService } from "@/modules/orders/order.service";

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