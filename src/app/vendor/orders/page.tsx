import { db } from "@/db";
import { orders, stores } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import Card from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

async function getVendorOrders(userId: string) {
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.ownerId, userId))
    .limit(1);

  if (!store) return [];

  return await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      items: orders.items,
      paymentMethod: orders.paymentMethod,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.storeId, store.id))
    .orderBy(desc(orders.createdAt));
}

const statusFilters = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "معلق" },
  { value: "accepted", label: "مقبول" },
  { value: "preparing", label: "جاري التحضير" },
  { value: "picked_up", label: "تم الاستلام" },
  { value: "on_way", label: "في الطريق" },
  { value: "delivered", label: "تم التوصيل" },
  { value: "cancelled", label: "ملغي" },
];

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const allOrders = await getVendorOrders(session.userId);
  const filteredOrders =
    params.status && params.status !== "all"
      ? allOrders.filter((o) => o.status === params.status)
      : allOrders;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الطلبات</h1>
          <p className="text-slate-500">{filteredOrders.length} طلب</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((filter) => (
          <Link
            key={filter.value}
            href={`/vendor/orders?status=${filter.value}`}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
              (params.status || "all") === filter.value
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Link
              key={order.id}
              href={`/vendor/orders/${order.id}`}
              className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-800">
                  طلب #{order.orderNumber}
                </span>
                <OrderStatusBadge status={order.status || "pending"} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {Array.isArray(order.items) ? order.items.length : 0} منتجات
                </span>
                <span className="font-medium text-slate-700">
                  {parseFloat(order.total).toLocaleString()} ر.ي
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                <span>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString("ar-YE")
                    : "-"}
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <Eye className="w-3 h-3" />
                  عرض التفاصيل
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">
            لا توجد طلبات
          </h3>
          <p className="text-slate-500">
            {params.status
              ? "لا توجد طلبات بهذه الحالة"
              : "لم يتم استقبال أي طلبات بعد"}
          </p>
        </Card>
      )}
    </div>
  );
}
