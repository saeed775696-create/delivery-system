"use client";

import { useDriverLocation } from "@/hooks/useDriverLocation";

export default function DriverLocationTracker({
  driverId,
}: {
  driverId: string;
}) {
  useDriverLocation(driverId);

  return null;
}