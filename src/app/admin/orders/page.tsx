import { db } from "@/db";
import { orders, users, stores } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import Card from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import Link from "next/link";
import { Eye, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

async function getOrders(status?: string | null) {
  try {
    if (status && status !== "all") {
      return await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          total: orders.total,
          paymentMethod: orders.paymentMethod,
          createdAt: orders.createdAt,
          customerId: orders.customerId,
          storeId: orders.storeId,
          driverId: orders.driverId,
        })
        .from(orders)
        .where(
          eq(
            orders.status,
            status as
              | "pending"
              | "accepted"
              | "preparing"
              | "picked_up"
              | "on_way"
              | "delivered"
              | "cancelled"
          )
        )
        .orderBy(desc(orders.createdAt));
    }

    return await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        customerId: orders.customerId,
        storeId: orders.storeId,
        driverId: orders.driverId,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt));
  } catch {
    return [];
  }
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

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const allOrders = await getOrders(params.status);
  const currentStatus = params.status || "all";

  const paymentLabels: Record<string, string> = {
    cash_on_delivery: "نقداً",
    wallet: "محفظة",
    bank_transfer: "تحويل بنكي",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إدارة الطلبات</h1>
          <p className="text-slate-500">{allOrders.length} طلب</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFilters.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/orders?status=${filter.value}`}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
              currentStatus === filter.value
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {/* Orders Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-right">
                <th className="px-6 py-4 text-sm font-medium text-slate-500">
                  رقم الطلب
                </th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">
                  الحالة
                </th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">
                  الإجمالي
                </th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">
                  الدفع
                </th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">
                  التاريخ
                </th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {allOrders.length > 0 ? (
                allOrders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800">
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={order.status || "pending"} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {parseFloat(order.total).toLocaleString()} ر.ي
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {paymentLabels[order.paymentMethod || "cash_on_delivery"]}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("ar-YE")
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Eye className="w-4 h-4" />
                        عرض
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    لا توجد طلبات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
