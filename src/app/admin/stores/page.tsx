import { db } from "@/db";
import { stores, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { Store, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

async function getAllStores() {
  try {
    return await db
      .select({
        id: stores.id,
        nameAr: stores.nameAr,
        category: stores.category,
        isOpen: stores.isOpen,
        rating: stores.rating,
        totalOrders: stores.totalOrders,
        phone: stores.phone,
        createdAt: stores.createdAt,
      })
      .from(stores)
      .orderBy(desc(stores.createdAt));
  } catch {
    return [];
  }
}

const categoryLabels: Record<string, string> = {
  restaurant: "مطعم",
  food: "وجبات سريعة",
  pharmacy: "صيدلية",
  grocery: "بقالة",
  bakery: "مخبز",
  other: "أخرى",
};

export default async function AdminStoresPage() {
  const allStores = await getAllStores();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">المتاجر</h1>
        <p className="text-slate-500">{allStores.length} متجر</p>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-right">
                <th className="px-6 py-4 text-sm font-medium text-slate-500">الاسم</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">التصنيف</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">الحالة</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">التقييم</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">الطلبات</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {allStores.length > 0 ? (
                allStores.map((store) => (
                  <tr key={store.id} className="border-t hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{store.nameAr}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {categoryLabels[store.category || "other"]}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        store.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {store.isOpen ? "مفتوح" : "مغلق"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{store.rating || "5.0"}</td>
                    <td className="px-6 py-4 text-slate-600">{store.totalOrders || 0}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/stores/${store.id}`}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Eye className="w-4 h-4" /> عرض
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Store className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    لا توجد متاجر
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
