"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  Phone,
} from "lucide-react";

import Card from "@/components/ui/Card";

const statusSteps = [
  {
    key: "pending",
    label: "قيد الانتظار",
    icon: Clock,
  },
  {
    key: "accepted",
    label: "تم قبول الطلب",
    icon: CheckCircle,
  },
  {
    key: "preparing",
    label: "جاري التحضير",
    icon: Package,
  },
  {
    key: "picked_up",
    label: "تم الاستلام",
    icon: Truck,
  },
  {
    key: "on_way",
    label: "في الطريق",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "تم التوصيل",
    icon: CheckCircle,
  },
];

export default function OrderTrackingPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function fetchOrder() {
      try {
        const params = await paramsPromise;

        const res = await fetch(`/api/orders/${params.id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
          }

          return;
        }

        const data = await res.json();

        setOrderData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();

    // Live Tracking
    interval = setInterval(fetchOrder, 5000);

    return () => clearInterval(interval);
  }, [paramsPromise, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!orderData?.order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <XCircle className="w-16 h-16 text-red-400 mb-4" />

        <h2 className="text-xl font-bold text-slate-700 mb-2">
          الطلب غير موجود
        </h2>

        <Link
          href="/stores"
          className="text-emerald-600 hover:text-emerald-700"
        >
          العودة للمتاجر
        </Link>
      </div>
    );
  }

  const order = orderData.order;
  const driver = orderData.driver;
  const store = orderData.store;

  const currentStatusIndex = statusSteps.findIndex(
    (step) => step.key === order.status
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/stores"
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowRight className="w-6 h-6 text-slate-600" />
            </Link>

            <div>
              <h1 className="font-bold text-slate-800">
                تتبع الطلب #{order.orderNumber}
              </h1>

              <p className="text-sm text-slate-500">
                {store?.nameAr || "المتجر"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Status */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-800">
              حالة الطلب
            </h2>

            <span className="text-sm text-emerald-600 font-medium">
              تحديث مباشر
            </span>
          </div>

          <div className="space-y-5">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div
                  key={step.key}
                  className="flex items-start gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-11 h-11 rounded-full flex items-center justify-center
                        ${
                          isCompleted
                            ? "bg-emerald-600"
                            : "bg-slate-200"
                        }
                      `}
                    >
                      <step.icon
                        className={`
                          w-5 h-5
                          ${
                            isCompleted
                              ? "text-white"
                              : "text-slate-400"
                          }
                        `}
                      />
                    </div>

                    {index < statusSteps.length - 1 && (
                      <div
                        className={`
                          w-1 h-10
                          ${
                            isCompleted
                              ? "bg-emerald-600"
                              : "bg-slate-200"
                          }
                        `}
                      />
                    )}
                  </div>

                  <div className="pt-2">
                    <p
                      className={`
                        font-medium
                        ${
                          isCurrent
                            ? "text-emerald-700"
                            : isCompleted
                            ? "text-slate-800"
                            : "text-slate-400"
                        }
                      `}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Driver */}
        {driver && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-amber-600" />

              <h2 className="font-bold text-slate-800">
                معلومات المندوب
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">
                  الاسم
                </p>

                <p className="font-medium text-slate-800">
                  {driver.fullName}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  الهاتف
                </p>

                <a
                  href={`tel:${driver.phone}`}
                  className="font-medium text-emerald-600 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {driver.phone}
                </a>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  نوع المركبة
                </p>

                <p className="font-medium text-slate-800">
                  {driver.vehicleType === "car"
                    ? "سيارة"
                    : "دراجة نارية"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Address */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-emerald-600" />

            <h2 className="font-bold text-slate-800">
              عنوان التوصيل
            </h2>
          </div>

          <p className="text-slate-600">
            {order.deliveryAddress?.address ||
              "العنوان غير محدد"}
          </p>
        </Card>

        {/* Items */}
        <Card>
          <h2 className="font-bold text-slate-800 mb-4">
            المنتجات
          </h2>

          <div className="space-y-4">
            {order.items?.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {item.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    الكمية × {item.quantity}
                  </p>
                </div>

                <p className="font-semibold text-slate-800">
                  {(
                    item.price * item.quantity
                  ).toLocaleString()}{" "}
                  ر.ي
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>المجموع</span>

              <span>
                {parseFloat(
                  order.subtotal || "0"
                ).toLocaleString()}{" "}
                ر.ي
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>رسوم التوصيل</span>

              <span>
                {parseFloat(
                  order.deliveryFee || "0"
                ).toLocaleString()}{" "}
                ر.ي
              </span>
            </div>

            <div className="flex justify-between pt-3 border-t text-lg font-bold">
              <span>الإجمالي</span>

              <span className="text-emerald-600">
                {parseFloat(
                  order.total || "0"
                ).toLocaleString()}{" "}
                ر.ي
              </span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}