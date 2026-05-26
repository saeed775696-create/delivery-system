import { db } from "@/db";
import { orders, stores, products } from "@/db/schema";
import { eq, sql, gte, desc, and } from "drizzle-orm";
import Card, { CardHeader } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  ShoppingBag,
  DollarSign,
  Package,
  Clock,
  Store,
} from "lucide-react";
import { requireVendor } from "@/lib/permissions";

export const dynamic = "force-dynamic";

async function getVendorData(userId: string) {
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.ownerId, userId))
    .limit(1);

  if (!store) return null;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [stats] = await db
    .select({
      totalOrders: sql<number>`count(*)`,
      totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
      deliveredOrders: sql<number>`count(*) FILTER (WHERE ${orders.status} = 'delivered')`,
      pendingOrders: sql<number>`count(*) FILTER (WHERE ${orders.status} = 'pending')`,
    })
    .from(orders)
    .where(eq(orders.storeId, store.id));

  const [todayStats] = await db
    .select({
      ordersToday: sql<number>`count(*)`,
      revenueToday: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.storeId, store.id),
        gte(orders.createdAt, todayStart)
      )
    );

  const [productStats] = await db
    .select({
      totalProducts: sql<number>`count(*)`,
      availableProducts: sql<number>`count(*) FILTER (WHERE ${products.isAvailable} = true)`,
    })
    .from(products)
    .where(eq(products.storeId, store.id));

  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      items: orders.items,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.storeId, store.id))
    .orderBy(desc(orders.createdAt))
    .limit(5);

  return {
    store,
    stats: {
      totalOrders: Number(stats?.totalOrders || 0),
      totalRevenue: Number(stats?.totalRevenue || 0),
      deliveredOrders: Number(stats?.deliveredOrders || 0),
      pendingOrders: Number(stats?.pendingOrders || 0),
      ordersToday: Number(todayStats?.ordersToday || 0),
      revenueToday: Number(todayStats?.revenueToday || 0),
      totalProducts: Number(productStats?.totalProducts || 0),
      availableProducts: Number(productStats?.availableProducts || 0),
    },
    recentOrders,
  };
}

export default async function VendorDashboard() {
  const session = await requireVendor();

  const data = await getVendorData(String(session.userId));

  if (!data) {
    return (
      <div className="text-center py-16">
        <Store className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold">لم يتم إعداد المتجر بعد</h2>
        <p className="text-slate-500">قم بإعداد متجرك للبدء</p>
      </div>
    );
  }

  const { store, stats, recentOrders } = data;

  const statCards = [
    {
      title: "طلبات اليوم",
      value: stats.ordersToday,
      icon: ShoppingBag,
      color: "bg-blue-500",
    },
    {
      title: "إيرادات اليوم",
      value: `${stats.revenueToday.toLocaleString()} ر.ي`,
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      title: "طلبات معلقة",
      value: stats.pendingOrders,
      icon: Clock,
      color: "bg-amber-500",
    },
    {
      title: "المنتجات",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">

      {/* STORE HEADER */}
      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Store className="w-7 h-7 text-emerald-600" />
          </div>

          <div>
            <h1 className="text-xl font-bold">{store.nameAr}</h1>
            <p className="text-slate-500">
              {store.isOpen ? "🟢 مفتوح" : "🔴 مغلق"}
            </p>
          </div>
        </div>
      </Card>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>

              <div>
                <p className="text-sm text-slate-500">{stat.title}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* RECENT ORDERS */}
      <Card>
        <CardHeader title="آخر الطلبات" />

        {recentOrders.length === 0 ? (
          <p className="text-center py-6 text-slate-500">
            لا توجد طلبات
          </p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/vendor/orders/${order.id}`}
                className="flex justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100"
              >
                <div>
                  <p className="font-bold">طلب #{order.orderNumber}</p>
                  <p className="text-sm text-slate-500">
                    {Array.isArray(order.items) ? order.items.length : 0} منتجات
                  </p>
                </div>

                <div className="text-left">
                  <OrderStatusBadge status={order.status || "pending"} />
                  <p className="text-sm text-slate-500">
                    {Number(order.total || 0).toLocaleString()} ر.ي
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}