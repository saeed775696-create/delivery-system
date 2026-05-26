import { db } from "@/db";
import { drivers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Card from "@/components/ui/Card";
import { Truck, Star } from "lucide-react";

export const dynamic = "force-dynamic";

async function getAllDrivers() {
  try {
    return await db
      .select({
        userId: drivers.userId,
        fullName: users.fullName,
        phone: users.phone,
        vehicleType: drivers.vehicleType,
        isAvailable: drivers.isAvailable,
        ratingAvg: drivers.ratingAvg,
        totalDeliveries: drivers.totalDeliveries,
        totalBalance: drivers.totalBalance,
        lastActive: drivers.lastActive,
      })
      .from(drivers)
      .innerJoin(users, eq(drivers.userId, users.id));
  } catch {
    return [];
  }
}

export default async function AdminDriversPage() {
  const allDrivers = await getAllDrivers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">المندوبين</h1>
        <p className="text-slate-500">{allDrivers.length} مندوب</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allDrivers.length > 0 ? (
          allDrivers.map((driver) => (
            <Card key={driver.userId}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <Truck className="w-7 h-7 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">
                    {driver.fullName}
                  </h3>
                  <p className="text-sm text-slate-500">{driver.phone}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    driver.isAvailable
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {driver.isAvailable ? "متاح" : "مشغول"}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <p className="font-bold text-slate-700">{driver.totalDeliveries}</p>
                  <p className="text-slate-500">توصيل</p>
                </div>
                <div>
                  <p className="font-bold text-amber-500 flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {driver.ratingAvg || "5.0"}
                  </p>
                  <p className="text-slate-500">تقييم</p>
                </div>
                <div>
                  <p className="font-bold text-slate-700">
                    {parseFloat(driver.totalBalance || "0").toLocaleString()}
                  </p>
                  <p className="text-slate-500">رصيد</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                {driver.vehicleType === "car" ? "سيارة" : "دراجة نارية"}
                {driver.lastActive && ` · آخر نشاط: ${new Date(driver.lastActive).toLocaleString("ar-YE")}`}
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500">
            <Truck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            لا يوجد مندوبين
          </div>
        )}
      </div>
    </div>
  );
}
