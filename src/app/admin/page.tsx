import { db } from "@/db";
import { orders, users, stores, drivers } from "@/db/schema";
import { sql, eq, gte, desc } from "drizzle-orm";
import Card, { CardHeader } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import {
  ShoppingBag,
  DollarSign,
  Users as UsersIcon,
  Truck,
  Store,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  try {
    // Total stats
    const [totalStats] = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        deliveredOrders: sql<number>`count(*) FILTER (WHERE ${orders.status} = 'delivered')`,
      })
      .from(orders);

    // Today's stats
    const [todayStats] = await db
      .select({
        ordersToday: sql<number>`count(*)`,
        revenueToday: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
      })
      .from(orders)
      .where(gte(orders.createdAt, todayStart));

    // User counts
    const [userCounts] = await db
      .select({
        totalCustomers: sql<number>`count(*) FILTER (WHERE ${users.role} = 'customer')`,
        totalDrivers: sql<number>`count(*) FILTER (WHERE ${users.role} = 'driver')`,
        totalVendors: sql<number>`count(*) FILTER (WHERE ${users.role} = 'vendor')`,
      })
      .from(users);

    // Active drivers
    const [driverStats] = await db
      .select({
        activeDrivers: sql<number>`count(*) FILTER (WHERE ${drivers.isAvailable} = true)`,
      })
      .from(drivers);

    // Store counts
    const [storeStats] = await db
      .select({
        totalStores: sql<number>`count(*)`,
        openStores: sql<number>`count(*) FILTER (WHERE ${stores.isOpen} = true)`,
      })
      .from(stores);

    // Pending orders
    const [pendingStats] = await db
      .select({
        pendingOrders: sql<number>`count(*)`,
      })
      .from(orders)
      .where(eq(orders.status, "pending"));

    return {
      totalOrders: totalStats?.totalOrders || 0,
      totalRevenue: totalStats?.totalRevenue || 0,
      deliveredOrders: totalStats?.deliveredOrders || 0,
      ordersToday: todayStats?.ordersToday || 0,
      revenueToday: todayStats?.revenueToday || 0,
      totalCustomers: userCounts?.totalCustomers || 0,
      totalDrivers: userCounts?.totalDrivers || 0,
      totalVendors: userCounts?.totalVendors || 0,
      activeDrivers: driverStats?.activeDrivers || 0,
      totalStores: storeStats?.totalStores || 0,
      openStores: storeStats?.openStores || 0,
      pendingOrders: pendingStats?.pendingOrders || 0,
    };
  } catch (error) {
    console.error("Failed to get stats:", error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      deliveredOrders: 0,
      ordersToday: 0,
      revenueToday: 0,
      totalCustomers: 0,
      totalDrivers: 0,
      totalVendors: 0,
      activeDrivers: 0,
      totalStores: 0,
      openStores: 0,
      pendingOrders: 0,
    };
  }
}

async function getRecentOrders() {
  try {
    const recentOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
        storeId: orders.storeId,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);

    return recentOrders;
  } catch {
    return [];
  }
}

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([
    getStats(),
    getRecentOrders(),
  ]);

  const statCards = [
    {
      title: "طلبات اليوم",
      value: stats.ordersToday,
      icon: ShoppingBag,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "إيرادات اليوم",
      value: `${stats.revenueToday.toLocaleString()} ر.ي`,
      icon: DollarSign,
      color: "bg-emerald-500",
      change: "+8%",
    },
    {
      title: "طلبات معلقة",
      value: stats.pendingOrders,
      icon: Clock,
      color: "bg-amber-500",
    },
    {
      title: "تم التوصيل",
      value: stats.deliveredOrders,
      icon: CheckCircle,
      color: "bg-green-500",
    },
  ];

  const overviewCards = [
    {
      title: "إجمالي العملاء",
      value: stats.totalCustomers,
      icon: UsersIcon,
    },
    {
      title: "المندوبين النشطين",
      value: `${stats.activeDrivers} / ${stats.totalDrivers}`,
      icon: Truck,
    },
    {
      title: "المتاجر المفتوحة",
      value: `${stats.openStores} / ${stats.totalStores}`,
      icon: Store,
    },
    {
      title: "إجمالي الإيرادات",
      value: `${stats.totalRevenue.toLocaleString()} ر.ي`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم</h1>
          <p className="text-slate-500">مرحباً بك في لوحة إدارة توصيل تعز</p>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {stat.value}
                </p>
                {stat.change && (
                  <p className="text-sm text-emerald-600 mt-1">{stat.change}</p>
                )}
              </div>
              <div
                className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewCards.map((card, i) => (
          <Card key={i} className="text-center">
            <card.icon className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            <p className="text-sm text-slate-500">{card.title}</p>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader
          title="آخر الطلبات"
          action={
            <Link
              href="/admin/orders"
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              عرض الكل
            </Link>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-right">
                <th className="pb-3 text-sm font-medium text-slate-500">
                  رقم الطلب
                </th>
                <th className="pb-3 text-sm font-medium text-slate-500">
                  الحالة
                </th>
                <th className="pb-3 text-sm font-medium text-slate-500">
                  الإجمالي
                </th>
                <th className="pb-3 text-sm font-medium text-slate-500">
                  التاريخ
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-slate-800 hover:text-emerald-600"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3">
                      <OrderStatusBadge status={order.status || "pending"} />
                    </td>
                    <td className="py-3 text-slate-600">
                      {parseFloat(order.total).toLocaleString()} ر.ي
                    </td>
                    <td className="py-3 text-slate-500 text-sm">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("ar-YE")
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    لا توجد طلبات حتى الآن
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
