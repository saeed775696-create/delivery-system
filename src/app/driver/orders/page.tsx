"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  orderNumber: number;
  status: string;
  total: string;
};

export default function DriverOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        "/api/drivers/orders/available"
      );

      const data = await res.json();

      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // 🔥 live polling
    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const acceptOrder = async (
    orderId: string
  ) => {
    try {
      const res = await fetch(
        "/api/drivers/orders/accept",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            orderId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      // 🔥 إزالة الطلب مباشرة
      setOrders((prev) =>
        prev.filter(
          (o) => o.id !== orderId
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        جاري تحميل الطلبات...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          الطلبات المتاحة
        </h1>

        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-slate-200 rounded-xl"
        >
          تحديث
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow">
          <p className="text-slate-500">
            لا توجد طلبات متاحة حالياً
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-5 shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">
                    طلب #{order.orderNumber}
                  </p>

                  <p className="text-slate-500 text-sm">
                    الإجمالي:
                    {" "}
                    {Number(
                      order.total
                    ).toLocaleString()}
                    {" "}
                    ر.ي
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/driver/orders/${order.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-100"
                  >
                    التفاصيل
                  </Link>

                  <button
                    onClick={() =>
                      acceptOrder(order.id)
                    }
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white"
                  >
                    قبول الطلب
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}