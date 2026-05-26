import { db } from "@/db";
import { drivers } from "@/db/schema";
import { eq } from "drizzle-orm";

export class DriverService {
  static async findByUserId(userId: string) {
    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.userId, userId))
      .limit(1);

    return driver || null;
  }

  static async updateLocation(
    userId: string,
    lat: number,
    lng: number
  ) {
    const [updatedDriver] = await db
      .update(drivers)
      .set({
        lastLat: lat != null ? String(lat) : null,
        lastLng: lng != null ? String(lng) : null,
      })
      .where(eq(drivers.userId, userId))
      .returning();

    return updatedDriver || null;
  }
}