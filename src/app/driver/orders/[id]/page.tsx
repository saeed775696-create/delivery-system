import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import UpdateOrderStatusButton from "@/components/driver/UpdateOrderStatusButton";
import Button from "@/components/ui/Button";
interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function DriverOrderDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/driver/orders"
        className="text-emerald-600 hover:underline"
      >
        ← الرجوع للطلبات
      </Link>

      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            طلب #{order.orderNumber}
          </h1>

          <span className="px-3 py-1 rounded-full bg-slate-100 text-sm">
            {order.status}
          </span>
        </div>

        <div>
          <h2 className="font-semibold mb-2">عنوان التوصيل</h2>

          <p className="text-gray-600">
            {(order.deliveryAddress as any)?.address}
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">المنتجات</h2>

          <div className="space-y-2">
            {(order.items as any[])?.map((item, index) => (
              <div
                key={index}
                className="flex justify-between bg-slate-50 p-3 rounded-xl"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>

                <span>
                  {item.price} ر.ي
                </span>
              </div>
            ))}
          </div>
        </div>

               <div className="pt-4 border-t flex justify-between text-lg font-bold">
          <span>الإجمالي</span>
          <span>{order.total} ر.ي</span>
        </div>

        <div className="pt-4 border-t">
          <h2 className="font-semibold mb-4">
            تحديث حالة الطلب
          </h2>
          <div className="flex gap-3">
  {order.status === "accepted" && (
    <UpdateOrderStatusButton
      orderId={order.id}
      status="picked_up"
      label="تم الاستلام"
    />
  )}

  {order.status === "picked_up" && (
    <UpdateOrderStatusButton
      orderId={order.id}
      status="on_way"
      label="جاري التوصيل"
    />
  )}

  {order.status === "on_way" && (
    <UpdateOrderStatusButton
      orderId={order.id}
      status="delivered"
      label="تم التوصيل"
    />
  )}
</div>

          <div className="flex flex-wrap gap-3">
            <form
              action={async () => {
                "use server";

                await db
                  .update(orders)
                  .set({
                    status: "picked_up",
                  })
                  .where(eq(orders.id, order.id));
              }}
            >
              <Button type="submit">
                تم الاستلام
              </Button>
            </form>

            <form
              action={async () => {
                "use server";

                await db
                  .update(orders)
                  .set({
                    status: "on_way",
                  })
                  .where(eq(orders.id, order.id));
              }}
            >
              <Button type="submit">
                في الطريق
              </Button>
            </form>

            <form
              action={async () => {
                "use server";

                await db
                  .update(orders)
                  .set({
                    status: "delivered",
                  })
                  .where(eq(orders.id, order.id));
              }}
            >
              <Button type="submit">
                تم التوصيل
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
