"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Link from "next/link";
import {
  Package,
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

type Product = {
  id: string;
  nameAr: string;
  price: string;
  imageUrl?: string;
  category?: string;
  isAvailable: boolean;
};

export default function VendorProductsClient({
  store,
  initialProducts,
}: {
  store: any;
  initialProducts: Product[];
}) {
  const router = useRouter();

  const [products, setProducts] = useState(initialProducts);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 🔥 Toggle Product
  const toggleProduct = async (id: string) => {
    try {
      setLoadingId(id);

      const res = await fetch("/api/vendor/products/toggle", {
        method: "POST",
        body: JSON.stringify({ productId: id }),
      });

      if (!res.ok) throw new Error("Failed");

      const updated = products.map((p) =>
        p.id === id
          ? { ...p, isAvailable: !p.isAvailable }
          : p
      );

      setProducts(updated);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            المنتجات
          </h1>
          <p className="text-slate-500">
            {products.length} منتج
          </p>
        </div>

        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <Plus className="w-5 h-5" />
          إضافة منتج
        </Link>
      </div>

      {/* PRODUCTS */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {products.map((product) => (
            <Card key={product.id} className="relative">

              {/* IMAGE + INFO */}
              <div className="flex gap-4">

                <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      className="w-full h-full object-cover rounded-xl"
                      alt={product.nameAr}
                    />
                  ) : (
                    <Package className="w-8 h-8 text-slate-300" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">
                    {product.nameAr}
                  </h3>

                  <p className="text-emerald-600 font-bold mt-1">
                    {product.price} ر.ي
                  </p>

                  <div className="flex gap-2 mt-2">

                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {product.isAvailable ? "متاح" : "غير متاح"}
                    </span>

                    {product.category && (
                      <span className="text-xs text-slate-400">
                        {product.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-4 pt-4 border-t">

                <Link
                  href={`/vendor/products/${product.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                  تعديل
                </Link>

                <button
                  onClick={() => toggleProduct(product.id)}
                  disabled={loadingId === product.id}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {loadingId === product.id ? (
                    <span className="text-xs">جاري...</span>
                  ) : product.isAvailable ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-green-600" />
                      متاح
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-red-600" />
                      غير متاح
                    </>
                  )}
                </button>

              </div>
            </Card>
          ))}

        </div>
      ) : (
        <Card className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-700">
            لا توجد منتجات
          </h3>
          <p className="text-slate-500 mb-6">
            أضف منتجات لتبدأ البيع
          </p>

          <Link
            href="/vendor/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl"
          >
            <Plus className="w-5 h-5" />
            إضافة منتج
          </Link>
        </Card>
      )}

    </div>
  );
}