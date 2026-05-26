"use client";

import ToggleAvailabilityButton from "@/components/driver/ToggleAvailabilityButton";
import { MapPin, ShoppingBag, DollarSign, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/ui/Badge";
import Card, { CardHeader } from "@/components/ui/Card";

export default function DriverDashboard({
  driver,
  activeOrders,
  stats,
}: any) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
            <MapPin className="w-8 h-8 text-amber-600" />
          </div>

          <div>
            <h1 className="text-xl font-bold">لوحة المندوب</h1>
            <p className="text-slate-500">
              {driver?.isAvailable ? "متاح" : "غير متاح"}
            </p>
          </div>
        </div>

        <ToggleAvailabilityButton isAvailable={driver?.isAvailable || false} />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex gap-3">
            <ShoppingBag />
            <div>
              <p>طلبات نشطة</p>
              <p className="font-bold">{activeOrders?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex gap-3">
            <CheckCircle />
            <div>
              <p>تم التوصيل</p>
              <p className="font-bold">{stats?.totalDeliveries || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex gap-3">
            <DollarSign />
            <div>
              <p>الأرباح</p>
              <p className="font-bold">
                {Number(stats?.totalEarned || 0).toLocaleString()} ر.ي
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex gap-3">
            <Clock />
            <div>
              <p>التقييم</p>
              <p className="font-bold">{driver?.ratingAvg || "5.0"}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders */}
      <Card>
        <CardHeader title="الطلبات النشطة" />

        <div className="space-y-3">
          {activeOrders?.map((order: any) => (
            <Link
              key={order.id}
              href={`/driver/orders/${order.id}`}
              className="block p-3 bg-slate-50 rounded-lg"
            >
              <p className="font-bold">طلب #{order.orderNumber}</p>
              <OrderStatusBadge status={order.status} />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}