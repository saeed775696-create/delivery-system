import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, users, stores, drivers } from "@/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    // Get date ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total counts
    const [totalStats] = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
        deliveredOrders: sql<number>`count(*) FILTER (WHERE ${orders.status} = 'delivered')`,
        cancelledOrders: sql<number>`count(*) FILTER (WHERE ${orders.status} = 'cancelled')`,
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

    // Monthly stats
    const [monthStats] = await db
      .select({
        ordersMonth: sql<number>`count(*)`,
        revenueMonth: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
      })
      .from(orders)
      .where(gte(orders.createdAt, monthStart));

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

    // Orders by status
    const ordersByStatus = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .groupBy(orders.status);

    // Daily orders for last 7 days
    const dailyOrders = await db
      .select({
        date: sql<string>`DATE(${orders.createdAt})`,
        count: sql<number>`count(*)`,
        revenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
      })
      .from(orders)
      .where(gte(orders.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`);

    return NextResponse.json({
      overview: {
        totalOrders: totalStats?.totalOrders || 0,
        totalRevenue: totalStats?.totalRevenue || 0,
        deliveredOrders: totalStats?.deliveredOrders || 0,
        cancelledOrders: totalStats?.cancelledOrders || 0,
        ordersToday: todayStats?.ordersToday || 0,
        revenueToday: todayStats?.revenueToday || 0,
        ordersMonth: monthStats?.ordersMonth || 0,
        revenueMonth: monthStats?.revenueMonth || 0,
        pendingOrders: pendingStats?.pendingOrders || 0,
      },
      users: {
        totalCustomers: userCounts?.totalCustomers || 0,
        totalDrivers: userCounts?.totalDrivers || 0,
        totalVendors: userCounts?.totalVendors || 0,
        activeDrivers: driverStats?.activeDrivers || 0,
      },
      stores: {
        totalStores: storeStats?.totalStores || 0,
        openStores: storeStats?.openStores || 0,
      },
      drivers: {
        totalBalance: 0,
      },
      ordersByStatus,
      dailyOrders,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب الإحصائيات" },
      { status: 500 }
    );
  }
}
