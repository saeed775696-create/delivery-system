import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { drivers, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// Get nearby available drivers
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "vendor")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radiusKm = parseFloat(searchParams.get("radius") || "5");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "الإحداثيات مطلوبة" },
        { status: 400 }
      );
    }

    // Simple distance calculation using Haversine approximation
    // For production, use PostGIS ST_DWithin
    const nearbyDrivers = await db
      .select({
        userId: drivers.userId,
        fullName: users.fullName,
        phone: users.phone,
        vehicleType: drivers.vehicleType,
        currentLat: drivers.currentLat,
        currentLng: drivers.currentLng,
        ratingAvg: drivers.ratingAvg,
        totalDeliveries: drivers.totalDeliveries,
      })
      .from(drivers)
      .innerJoin(users, eq(drivers.userId, users.id))
      .where(
        and(
          eq(drivers.isAvailable, true),
          sql`${drivers.currentLat} IS NOT NULL`,
          sql`${drivers.currentLng} IS NOT NULL`,
          // Rough bounding box filter (for better performance)
          sql`ABS(CAST(${drivers.currentLat} AS FLOAT) - ${lat}) < ${radiusKm / 111}`,
          sql`ABS(CAST(${drivers.currentLng} AS FLOAT) - ${lng}) < ${radiusKm / 85}`
        )
      )
      .limit(10);

    // Calculate actual distance and sort
    const driversWithDistance = nearbyDrivers.map((driver) => {
      const driverLat = parseFloat(driver.currentLat || "0");
      const driverLng = parseFloat(driver.currentLng || "0");
      const distance = calculateDistance(lat, lng, driverLat, driverLng);
      return { ...driver, distanceKm: Math.round(distance * 10) / 10 };
    });

    driversWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json({ drivers: driversWithDistance });
  } catch (error) {
    console.error("Get nearby drivers error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب السائقين القريبين" },
      { status: 500 }
    );
  }
}

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
