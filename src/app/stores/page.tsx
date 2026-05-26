import { StoreService } from "@/modules/stores/store.service";
import Link from "next/link";
import {
  Store,
  Star,
  Clock,
  Search,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const categories = [
  { id: "all", name: "الكل", icon: "📦" },
  { id: "restaurant", name: "مطاعم", icon: "🍽️" },
  { id: "food", name: "وجبات سريعة", icon: "🍔" },
  { id: "pharmacy", name: "صيدليات", icon: "💊" },
  { id: "grocery", name: "بقالة", icon: "🛒" },
  { id: "bakery", name: "مخابز", icon: "🥖" },
  { id: "other", name: "أخرى", icon: "📦" },
];

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;

  const allStores = await StoreService.getStores(
    params.category,
    params.search
  );

  const categoryLabels: Record<string, string> = {
    restaurant: "مطعم",
    food: "وجبات سريعة",
    pharmacy: "صيدلية",
    grocery: "بقالة",
    bakery: "مخبز",
    other: "أخرى",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowRight className="w-6 h-6 text-slate-600" />
            </Link>

            <div className="flex-1">
              <form className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="ابحث عن متجر..."
                  defaultValue={params.search}
                  className="w-full pl-4 pr-12 py-3 bg-slate-100 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />

                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/stores?category=${cat.id}${
                  params.search
                    ? `&search=${params.search}`
                    : ""
                }`}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                  (params.category || "all") === cat.id
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{cat.icon}</span>

                <span className="text-sm font-medium">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800">
            {params.category &&
            params.category !== "all"
              ? categoryLabels[params.category] ||
                "المتاجر"
              : "جميع المتاجر"}
          </h1>

          <span className="text-sm text-slate-500">
            {allStores.length} متجر
          </span>
        </div>

        {allStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allStores.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition group"
              >
                <div className="h-40 bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center relative">
                  {store.imageUrl ? (
                    <img
                      src={store.imageUrl}
                      alt={store.nameAr}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-16 h-16 text-emerald-300" />
                  )}

                  <span
                    className={`absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full ${
                      store.isOpen
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {store.isOpen ? "مفتوح" : "مغلق"}
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg group-hover:text-emerald-600 transition">
                        {store.nameAr}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {
                          categoryLabels[
                            store.category || "other"
                          ]
                        }
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />

                      <span className="text-sm font-medium">
                        {store.rating || "5.0"}
                      </span>
                    </div>
                  </div>

                  {store.description && (
                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                      {store.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      30-45 دقيقة
                    </span>

                    <span>
                      رسوم التوصيل: 500 ر.ي
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Store className="w-16 h-16 mx-auto mb-4 text-slate-300" />

            <h3 className="text-lg font-medium text-slate-700 mb-2">
              لا توجد متاجر
            </h3>

            <p className="text-slate-500">
              {params.search
                ? `لم نجد متاجر تطابق "${params.search}"`
                : "لا توجد متاجر متاحة في هذا التصنيف حالياً"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}