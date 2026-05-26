import { db } from "@/db";
import { stores, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Store,
  Star,
  Clock,
  ArrowRight,
  MapPin,
  Phone,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react";
import AddToCartButton from "./AddToCartButton";

export const dynamic = "force-dynamic";

async function getStore(id: string) {
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, id))
    .limit(1);

  if (!store) return null;

  const storeProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.storeId, id), eq(products.isAvailable, true)));

  return { store, products: storeProducts };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getStore(id);

  if (!data) {
    notFound();
  }

  const { store, products: storeProducts } = data;

  const categoryLabels: Record<string, string> = {
    restaurant: "مطعم",
    food: "وجبات سريعة",
    pharmacy: "صيدلية",
    grocery: "بقالة",
    bakery: "مخبز",
    other: "أخرى",
  };

  // Group products by category
  const productsByCategory = storeProducts.reduce(
    (acc, product) => {
      const cat = product.category || "أخرى";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    },
    {} as Record<string, typeof storeProducts>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/stores"
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowRight className="w-6 h-6 text-slate-600" />
            </Link>
            <div className="flex-1">
              <h1 className="font-semibold text-slate-800">{store.nameAr}</h1>
              <p className="text-sm text-slate-500">
                {categoryLabels[store.category || "other"]}
              </p>
            </div>
            <Link
              href="/cart"
              className="relative p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ShoppingCart className="w-6 h-6 text-slate-600" />
            </Link>
          </div>
        </div>
      </header>

      {/* Store Info */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              {store.imageUrl ? (
                <img
                  src={store.imageUrl}
                  alt={store.nameAr}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <Store className="w-10 h-10 text-emerald-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-800">
                  {store.nameAr}
                </h2>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    store.isOpen
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {store.isOpen ? "مفتوح" : "مغلق"}
                </span>
              </div>
              {store.description && (
                <p className="text-sm text-slate-500 mb-2">
                  {store.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  {store.rating || "5.0"}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-4 h-4" />
                  30-45 دقيقة
                </span>
              </div>
            </div>
          </div>

          {/* Store details */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-sm">
            {store.addressDescription && (
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-4 h-4" />
                {store.addressDescription}
              </span>
            )}
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
              >
                <Phone className="w-4 h-4" />
                {store.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <main className="container mx-auto px-4 py-6">
        {storeProducts.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(productsByCategory).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl p-4 shadow-sm flex gap-4"
                    >
                      <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.nameAr}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Store className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-800">
                          {product.nameAr}
                        </h4>
                        {product.description && (
                          <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                            {product.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-600">
                              {product.discountPrice || product.price} ر.ي
                            </span>
                            {product.discountPrice && (
                              <span className="text-sm text-slate-400 line-through">
                                {product.price} ر.ي
                              </span>
                            )}
                          </div>
                          <AddToCartButton
                            product={{
                              id: product.id,
                              name: product.nameAr,
                              price: parseFloat(
                                (product.discountPrice || product.price) as string
                              ),
                            }}
                            storeId={store.id}
                            storeName={store.nameAr}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Store className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              لا توجد منتجات
            </h3>
            <p className="text-slate-500">
              لم يتم إضافة منتجات لهذا المتجر بعد
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
