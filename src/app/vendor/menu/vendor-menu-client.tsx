"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Plus,
  Package,
  FolderPlus,
} from "lucide-react";

type Category = {
  id: string;
  nameAr: string;
};

type Product = {
  id: string;
  nameAr: string;
  price: string;
  imageUrl?: string | null;
  categoryId?: string | null;
  isAvailable: boolean;
};

export default function VendorMenuClient({
  initialCategories,
  initialProducts,
  storeId,
}: {
  initialCategories: Category[];
  initialProducts: Product[];
  storeId: string;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const products = initialProducts;

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter(
      (p) => p.categoryId === activeCategory
    );
  }, [activeCategory, products]);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المينيو</h1>
          <p className="text-slate-500">
            إدارة الأقسام والمنتجات
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/vendor/menu/categories/new"
            className="px-4 py-2 bg-slate-100 rounded-xl flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            قسم
          </Link>

          <Link
            href="/vendor/products/new"
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            منتج
          </Link>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-xl whitespace-nowrap ${
            activeCategory === "all"
              ? "bg-emerald-600 text-white"
              : "bg-slate-100"
          }`}
        >
          الكل
        </button>

        {initialCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap ${
              activeCategory === cat.id
                ? "bg-emerald-600 text-white"
                : "bg-slate-100"
            }`}
          >
            {cat.nameAr}
          </button>
        ))}
      </div>

      {/* PRODUCTS GRID */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-slate-500 mt-2">لا توجد منتجات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-4 border"
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.nameAr}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 m-auto text-slate-400" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold">{p.nameAr}</h3>
                  <p className="text-emerald-600 font-semibold">
                    {p.price} ر.ي
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}