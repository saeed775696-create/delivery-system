import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/modules/orders/order.service";

const ALLOWED_STATUS = [
  "pending",
  "accepted",
  "picked_up",
  "on_way",
  "delivered",
  "cancelled",
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await OrderService.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "حدث خطأ في جلب الطلب" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const status = body?.status;

    if (!status) {
      return NextResponse.json(
        { error: "الحالة مطلوبة" },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUS.includes(status)) {
      return NextResponse.json(
        { error: "حالة غير صالحة" },
        { status: 400 }
      );
    }

    const updatedOrder =
      await OrderService.updateStatus(
        id,
        status
      );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "حدث خطأ في تحديث الطلب" },
      { status: 500 }
    );
  }
}