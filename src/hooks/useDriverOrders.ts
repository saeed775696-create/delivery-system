"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export function useDriverOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    socket.on("order:new", (order) => {
      setOrders((prev) => [order, ...prev]);
    });

    return () => {
      socket.off("order:new");
    };
  }, []);

  return orders;
}