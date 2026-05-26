"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/ui/Badge";
import {
  ArrowRight,
  ShoppingBag,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";

const statusActions = [
  { status: "accepted", label: "قبول الطلب", color: "bg-emerald-600 hover:bg-emerald-700" },
  { status: "preparing", label: "بدء التحضير", color: "bg-blue-600 hover:bg-blue-700" },
  { status: "cancelled", label: "إلغاء الطلب", color: "bg-red-600 hover:bg-red-700" },
];

export default function VendorOrderDetailPage({
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
      const res = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          note: status === "cancelled" ? "تم الإلغاء من قبل المتجر" : undefined,
          cancellationReason: status === "cancelled" ? "تم الإلغاء من قبل المتجر" : undefined,
        }),
      });
      if (!res.ok) throw new Error("فشل التحديث");
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
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
  const availableActions = statusActions.filter(
    (a) =>
      (a.status === "accepted" && o.status === "pending") ||
      (a.status === "preparing" && o.status === "accepted") ||
      (a.status === "cancelled" &&
        (o.status === "pending" || o.status === "accepted"))
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/vendor/orders"
          className="p-2 hover:bg-slate-200 rounded-lg transition"
        >
          <ArrowRight className="w-6 h-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            طلب #{o.orderNumber}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <OrderStatusBadge status={o.status || "pending"} />
            <span className="text-sm text-slate-500">
              {o.createdAt
                ? new Date(o.createdAt).toLocaleString("ar-YE")
                : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="font-semibold text-slate-800 mb-4">المنتجات</h2>
            <div className="space-y-3">
              {o.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate-700">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      {item.notes ? `ملاحظات: ${item.notes}` : ""}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-700">
                      {item.price} ر.ي
                    </p>
                    <p className="text-sm text-slate-500">× {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {o.customerNotes && (
            <Card>
              <h2 className="font-semibold text-slate-800 mb-2">
                ملاحظات العميل
              </h2>
              <p className="text-slate-600">{o.customerNotes}</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {availableActions.length > 0 && (
            <Card>
              <h2 className="font-semibold text-slate-800 mb-4">إجراءات</h2>
              <div className="space-y-2">
                {availableActions.map((action) => (
                  <Button
                    key={action.status}
                    onClick={() => updateStatus(action.status)}
                    isLoading={updating}
                    className={`w-full ${action.color} text-white`}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h2 className="font-semibold text-slate-800 mb-4">
              معلومات التوصيل
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <span className="text-slate-600">
                  {o.deliveryAddress?.address || "غير محدد"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">طريقة الدفع</span>
                <span className="font-medium text-slate-700">
                  {o.paymentMethod === "cash_on_delivery"
                    ? "نقداً"
                    : o.paymentMethod === "wallet"
                    ? "محفظة"
                    : "تحويل بنكي"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المجموع</span>
                <span className="font-bold text-slate-800">
                  {parseFloat(o.total).toLocaleString()} ر.ي
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">رسوم التوصيل</span>
                <span className="text-slate-600">
                  {parseFloat(o.deliveryFee).toLocaleString()} ر.ي
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
