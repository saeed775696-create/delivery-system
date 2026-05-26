import ToggleAvailabilityButton from "@/components/driver/ToggleAvailabilityButton";
import DriverLocationTracker from "@/components/driver/DriverLocationTracker";
import { db } from "@/db";
import { orders, drivers } from "@/db/schema";
import { eq, sql, and, desc, or } from "drizzle-orm";
import { requireDriver } from "@/lib/permissions";
import Card, { CardHeader } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import DriverLiveMap from "@/components/maps/DriverLiveMap";
import Link from "next/link";
import {
  ShoppingBag,
  DollarSign,
  MapPin,
  CheckCircle,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getDriverData(userId: string) {
  const [driver] = await db
    .select()
    .from(drivers)
    .where(eq(drivers.userId, userId))
    .limit(1);

  if (!driver) return null;

  const activeOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      deliveryAddress: orders.deliveryAddress,
      deliveryFee: orders.deliveryFee,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(
      and(
        eq(orders.driverId, userId),
        or(
          eq(orders.status, "accepted"),
          eq(orders.status, "picked_up"),
          eq(orders.status, "on_way")
        )
      )
    )
    .orderBy(desc(orders.createdAt))
    .limit(10);

  const [stats] = await db
    .select({
      totalDeliveries: sql<number>`count(*)`,
      totalEarned: sql<number>`COALESCE(SUM(CAST(${orders.deliveryFee} AS DECIMAL)), 0)`,
    })
    .from(orders)
    .where(
      and(eq(orders.driverId, userId), eq(orders.status, "delivered"))
    );

  return {
    driver,
    activeOrders,
    stats: {
      totalDeliveries: stats?.totalDeliveries || 0,
      totalEarned: stats?.totalEarned || 0,
    },
  };
}

export default async function DriverDashboard() {
 const session = await requireDriver();
  const data = await getDriverData(session.userId);

  if (!data) {
    return (
      <div className="text-center py-16">
        <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">
          مرحباً بك في تطبيق المندوب
        </h2>
        <p className="text-slate-500">انتظر حتى يتم قبول حسابك</p>
      </div>
    );
  }

  const { driver, activeOrders, stats } = data;

  return (
    <div className="space-y-6">
      <DriverLiveMap />
      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
            <MapPin className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              مرحباً بك في لوحة المندوب
            </h1>
            <p className="text-slate-500">
              {driver.isAvailable ? "متاح لاستقبال الطلبات" : "غير متاح حالياً"}
            </p>
          </div>
        </div>
        <ToggleAvailabilityButton
  isAvailable={driver.isAvailable || false}
       />
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">طلبات نشطة</p>
              <p className="text-xl font-bold text-slate-800">
                {activeOrders.length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">تم التوصيل</p>
              <p className="text-xl font-bold text-slate-800">
                {stats.totalDeliveries}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">الأرباح</p>
              <p className="text-xl font-bold text-slate-800">
                {Number(stats.totalEarned).toLocaleString()} ر.ي
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">التقييم</p>
              <p className="text-xl font-bold text-slate-800">
                {driver.ratingAvg || "5.0"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="الطلبات النشطة"
          action={
            <Link
              href="/driver/orders"
              className="text-sm text-amber-600 hover:text-amber-700"
            >
              عرض الكل
            </Link>
          }
        />
        {activeOrders.length > 0 ? (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <Link
                key={order.id}
                href={`/driver/orders/${order.id}`}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    طلب #{order.orderNumber}
                  </p>
                  <p className="text-sm text-slate-500">
                    {order.deliveryAddress
                      ? order.deliveryAddress.address?.slice(0, 30)
                      : "عنوان غير محدد"}
                  </p>
                </div>
                <div className="text-left">
                  <OrderStatusBadge status={order.status || "pending"} />
                  <p className="text-sm text-slate-500 mt-1">
                    رسوم: {parseFloat(order.deliveryFee).toLocaleString()} ر.ي
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>لا توجد طلبات نشطة</p>
          </div>
        )}
      </Card>
    </div>
  );
}
