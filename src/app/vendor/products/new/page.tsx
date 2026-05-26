"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    imageUrl: "",
    isAvailable: true,
    preparationTime: "15",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // First get the store ID
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();

      if (!meRes.ok) {
        throw new Error("يرجى تسجيل الدخول");
      }

      // Get store
      const storeRes = await fetch("/api/vendor/store");
      const storeData = await storeRes.json();

      if (!storeRes.ok || !storeData.store) {
        throw new Error("لم يتم العثور على المتجر");
      }

      const res = await fetch(`/api/stores/${storeData.store.id}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameAr: formData.nameAr,
          nameEn: formData.nameEn || undefined,
          description: formData.description || undefined,
          price: parseFloat(formData.price),
          discountPrice: formData.discountPrice
            ? parseFloat(formData.discountPrice)
            : undefined,
          category: formData.category || undefined,
          imageUrl: formData.imageUrl || undefined,
          isAvailable: formData.isAvailable,
          preparationTime: parseInt(formData.preparationTime),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ في إضافة المنتج");
      }

      router.push("/vendor/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/vendor/products"
          className="p-2 hover:bg-slate-200 rounded-lg transition"
        >
          <ArrowRight className="w-6 h-6 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">إضافة منتج جديد</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="اسم المنتج (عربي) *"
            type="text"
            value={formData.nameAr}
            onChange={(e) =>
              setFormData({ ...formData, nameAr: e.target.value })
            }
            placeholder="مثال: برجر لحم"
            required
          />

          <Input
            label="اسم المنتج (إنجليزي)"
            type="text"
            value={formData.nameEn}
            onChange={(e) =>
              setFormData({ ...formData, nameEn: e.target.value })
            }
            placeholder="Example: Beef Burger"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="وصف قصير للمنتج..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="السعر (ر.ي) *"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="1500"
              required
            />

            <Input
              label="سعر الخصم (اختياري)"
              type="number"
              value={formData.discountPrice}
              onChange={(e) =>
                setFormData({ ...formData, discountPrice: e.target.value })
              }
              placeholder="1200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="التصنيف"
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="مثال: وجبات رئيسية"
            />

            <Input
              label="وقت التحضير (دقائق)"
              type="number"
              value={formData.preparationTime}
              onChange={(e) =>
                setFormData({ ...formData, preparationTime: e.target.value })
              }
              placeholder="15"
            />
          </div>

          <Input
            label="رابط الصورة"
            type="url"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            placeholder="https://example.com/image.jpg"
          />

          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) =>
                setFormData({ ...formData, isAvailable: e.target.checked })
              }
              className="w-5 h-5 text-emerald-600 rounded"
            />
            <span className="font-medium text-slate-700">المنتج متاح للطلب</span>
          </label>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" isLoading={isLoading}>
              إضافة المنتج
            </Button>
            <Link
              href="/vendor/products"
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            >
              إلغاء
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
