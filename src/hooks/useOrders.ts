import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export function useOrderTracking(orderId: string) {
  const [status, setStatus] = useState<string>("pending");

  useEffect(() => {
    socket.emit("join:order", orderId);
    socket.on("order:status:updated", (data) => {
      if (data.orderId === orderId) setStatus(data.status);
    });
    return () => {
      socket.off("order:status:updated");
    };
  }, [orderId]);

  return status;
}
