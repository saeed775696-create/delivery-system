"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import Card from "@/components/ui/Card";

import {
  Package,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
} from "lucide-react";

type Product = {
  id: string;
  nameAr: string;
  price: string | number;
  imageUrl?: string | null;
  category?: string | null;
  isAvailable: boolean;
};

type Props = {
  store?: any;
  initialProducts?: Product[];
};

export default function VendorProductsClient({
  store,
  initialProducts = [],
}: Props) {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(
    initialProducts ?? []
  );

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // TOGGLE
  const toggleProduct = async (id: string) => {
    try {
      setLoadingId(id);

      await fetch("/api/vendor/products/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
        )
      );

      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  // DELETE
  const deleteProduct = async (id: string) => {
    const confirmDelete = confirm("هل أنت متأكد من حذف المنتج؟");
    if (!confirmDelete) return;

    try {
      setLoadingId(id);

      await fetch(`/api/vendor/products/${id}`, {
        method: "DELETE",
      });

      setProducts((prev) => prev.filter((p) => p.id !== id));

      router.refresh();
    } catch (err) {
      console.error(err);
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
            إدارة المنتجات
          </h1>
          <p className="text-slate-500">
            {products.length} منتج
          </p>
        </div>

        <Link
          href="/vendor/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
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

              {/* TOP MENU */}
              <div className="absolute top-3 left-3">
                <button
                  onClick={() =>
                    setMenuOpenId(
                      menuOpenId === product.id ? null : product.id
                    )
                  }
                  className="p-2 rounded-lg hover:bg-slate-100"
                >
                  <MoreVertical className="w-5 h-5 text-slate-600" />
                </button>

                {menuOpenId === product.id && (
                  <div className="absolute left-0 mt-2 w-36 bg-white shadow-lg border rounded-xl overflow-hidden z-10">

                    <Link
                      href={`/vendor/products/${product.id}/edit`}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100"
                    >
                      <Edit className="w-4 h-4" />
                      تعديل
                    </Link>

                    <button
                      onClick={() => toggleProduct(product.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100"
                    >
                      {product.isAvailable ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-green-600" />
                          تعطيل
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-red-600" />
                          تفعيل
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </button>
                  </div>
                )}
              </div>

              {/* IMAGE */}
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.nameAr}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-slate-300" />
                  )}
                </div>

                {/* INFO */}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">
                    {product.nameAr}
                  </h3>

                  <p className="text-emerald-600 font-bold mt-1">
                    {product.price} ر.ي
                  </p>

                  <div className="mt-2 flex gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
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

              {/* QUICK ACTION */}
              <div className="mt-4 pt-4 border-t flex gap-2">
                <Link
                  href={`/vendor/products/${product.id}/edit`}
                  className="flex-1 text-center py-2 text-sm rounded-lg hover:bg-slate-100"
                >
                  تعديل
                </Link>

                <button
                  onClick={() => toggleProduct(product.id)}
                  className="flex-1 text-sm rounded-lg hover:bg-slate-100"
                  disabled={loadingId === product.id}
                >
                  {loadingId === product.id
                    ? "..."
                    : product.isAvailable
                    ? "إيقاف"
                    : "تشغيل"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />

          <h3 className="text-lg font-medium">
            لا توجد منتجات
          </h3>

          <p className="text-slate-500 mb-4">
            ابدأ بإضافة منتجاتك الآن
          </p>

          <Link
            href="/vendor/products/new"
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl"
          >
            إضافة منتج
          </Link>
        </Card>
      )}
    </div>
  );
}