"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { ArrowRight, XCircle } from "lucide-react";

const statusActions = [
  { status: "accepted", label: "قبول" },
  { status: "preparing", label: "تحضير" },
  { status: "picked_up", label: "استلام" },
  { status: "on_way", label: "في الطريق" },
  { status: "delivered", label: "تم التوصيل" },
  { status: "cancelled", label: "إلغاء" },
];

export default function AdminOrderDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const params = await paramsPromise;
        const res = await fetch(`/api/orders/${params.id}`);
        if (!res.ok) { router.push("/login"); return; }
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [paramsPromise, router]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const params = await paramsPromise;
      await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      window.location.reload();
    } catch {
      alert("حدث خطأ");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h2 className="text-xl font-semibold text-slate-700">الطلب غير موجود</h2>
      </div>
    );
  }

  const o = order.order;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders" className="p-2 hover:bg-slate-200 rounded-lg transition">
          <ArrowRight className="w-6 h-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            طلب #{o.orderNumber}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <OrderStatusBadge status={o.status || "pending"} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="font-semibold text-slate-800 mb-4">المنتجات</h2>
            <div className="space-y-3">
              {o.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <p className="font-medium text-slate-700">{item.name} × {item.quantity}</p>
                  <p className="font-medium text-slate-700">{(item.price * item.quantity).toLocaleString()} ر.ي</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الجزئي</span>
                <span>{parseFloat(o.subtotal || "0").toLocaleString()} ر.ي</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>رسوم التوصيل</span>
                <span>{parseFloat(o.deliveryFee || "0").toLocaleString()} ر.ي</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t">
                <span>الإجمالي</span>
                <span className="text-emerald-600">{parseFloat(o.total || "0").toLocaleString()} ر.ي</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-slate-800 mb-4">سجل الحالة</h2>
            <div className="space-y-2">
              {order.statusLogs?.map((log: any, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <OrderStatusBadge status={log.status} />
                  <span className="text-slate-500">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString("ar-YE") : ""}
                  </span>
                  {log.note && <span className="text-slate-400">- {log.note}</span>}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold text-slate-800 mb-4">تحديث الحالة</h2>
            <div className="flex flex-wrap gap-2">
              {statusActions.map((action) => (
                <Button
                  key={action.status}
                  size="sm"
                  onClick={() => updateStatus(action.status)}
                  isLoading={updating}
                  disabled={o.status === action.status}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-slate-800 mb-4">المتجر</h2>
            <p className="text-slate-700">{order.store?.nameAr || "-"}</p>
            <p className="text-sm text-slate-500">{order.store?.phone || "-"}</p>
          </Card>

          {order.driver && (
            <Card>
              <h2 className="font-semibold text-slate-800 mb-4">المندوب</h2>
              <p className="text-slate-700">{order.driver.fullName}</p>
              <p className="text-sm text-slate-500">{order.driver.phone}</p>
            </Card>
          )}

          <Card>
            <h2 className="font-semibold text-slate-800 mb-4">التوصيل</h2>
            <p className="text-sm text-slate-600">{o.deliveryAddress?.address || "غير محدد"}</p>
            <p className="text-sm text-slate-500 mt-1">{o.paymentMethod === "cash_on_delivery" ? "نقداً" : "محفظة"}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
