"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";

export function useDriverLocation(driverId: string) {
  useEffect(() => {
    const watch = navigator.geolocation.watchPosition((pos) => {
      socket.emit("driver:location", {
        driverId,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });

    return () => navigator.geolocation.clearWatch(watch);
  }, [driverId]);
}