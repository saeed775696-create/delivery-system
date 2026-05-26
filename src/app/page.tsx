import { db } from "@/db";
import { stores, orders, users } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";
import Link from "next/link";
import {
  ShoppingBag,
  Truck,
  Store,
  Users,
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  Smartphone,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [{ count: totalStores }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(stores);

    const [{ count: totalOrders }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);

    const [{ count: totalCustomers }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "customer"));

    return {
      stores: totalStores || 0,
      orders: totalOrders || 0,
      customers: totalCustomers || 0,
    };
  } catch {
    return { stores: 0, orders: 0, customers: 0 };
  }
}

async function getFeaturedStores() {
  try {
    const featuredStores = await db
      .select({
        id: stores.id,
        nameAr: stores.nameAr,
        category: stores.category,
        rating: stores.rating,
        imageUrl: stores.imageUrl,
        isOpen: stores.isOpen,
      })
      .from(stores)
      .where(eq(stores.isOpen, true))
      .orderBy(desc(stores.totalOrders))
      .limit(6);

    return featuredStores;
  } catch {
    return [];
  }
}

const categories = [
  { id: "restaurant", name: "مطاعم", icon: "🍽️", color: "bg-orange-100" },
  { id: "food", name: "وجبات سريعة", icon: "🍔", color: "bg-red-100" },
  { id: "pharmacy", name: "صيدليات", icon: "💊", color: "bg-green-100" },
  { id: "grocery", name: "بقالة", icon: "🛒", color: "bg-blue-100" },
  { id: "bakery", name: "مخابز", icon: "🥖", color: "bg-amber-100" },
  { id: "other", name: "أخرى", icon: "📦", color: "bg-purple-100" },
];

export default async function HomePage() {
  const [stats, featuredStores] = await Promise.all([
    getStats(),
    getFeaturedStores(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-l from-emerald-600 to-emerald-700 text-white">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">توصيل تعز</h1>
                <p className="text-xs text-emerald-100">التوصيل السريع</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded-lg transition"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium bg-white text-emerald-700 rounded-lg hover:bg-emerald-50 transition"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 pb-24">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-6">
  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> 
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              توصيل سريع لكل
              <span className="text-emerald-200"> احتياجاتك</span>
            </h2>
            <p className="text-lg text-emerald-100 mb-8">
              من المطاعم إلى الصيدليات، نوصل طلباتك في أسرع وقت إلى باب منزلك في
              جميع أنحاء تعز
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/stores"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-xl font-medium hover:bg-emerald-50 transition shadow-lg"
              >
                اطلب الآن
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link
                href="/register?role=driver"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-400 transition"
              >
                انضم كمندوب
                <Truck className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <div className="container mx-auto px-4 -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Store className="w-6 h-6 text-emerald-600" />}
            value={stats.stores.toString()}
            label="متجر"
          />
          <StatCard
            icon={<ShoppingBag className="w-6 h-6 text-blue-600" />}
            value={stats.orders.toString()}
            label="طلب"
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-purple-600" />}
            value={stats.customers.toString()}
            label="عميل"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-amber-600" />}
            value="30"
            label="دقيقة متوسط التوصيل"
          />
        </div>
      </div>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">التصنيفات</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/stores?category=${cat.id}`}
              className={`${cat.color} rounded-2xl p-4 text-center hover:scale-105 transition-transform`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className="text-sm font-medium text-slate-700">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Stores */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-800">المتاجر المميزة</h3>
          <Link
            href="/stores"
            className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            عرض الكل
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredStores.length > 0 ? (
            featuredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-slate-500">
              <Store className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>لا توجد متاجر متاحة حالياً</p>
              <Link
                href="/register?role=vendor"
                className="text-emerald-600 hover:underline mt-2 inline-block"
              >
                سجل متجرك الآن
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-slate-100 py-16 mt-8">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-slate-800 text-center mb-12">
            كيف يعمل التطبيق؟
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="اختر متجرك"
              description="تصفح المتاجر القريبة منك واختر ما تريد من منتجات"
            />
            <StepCard
              number="2"
              title="أضف للسلة"
              description="أضف المنتجات لسلتك وحدد عنوان التوصيل"
            />
            <StepCard
              number="3"
              title="استلم طلبك"
              description="تتبع طلبك حتى يصل لباب منزلك"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Smartphone className="w-16 h-16 mx-auto mb-6 text-emerald-200" />
          <h3 className="text-3xl font-bold mb-4">انضم إلينا اليوم</h3>
          <p className="text-emerald-100 mb-8 max-w-md mx-auto">
            سواء كنت صاحب متجر أو تريد أن تكون مندوب توصيل، انضم لعائلة توصيل تعز
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register?role=vendor"
              className="px-6 py-3 bg-white text-emerald-700 rounded-xl font-medium hover:bg-emerald-50 transition"
            >
              سجل متجرك
            </Link>
            <Link
              href="/register?role=driver"
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500 transition border border-emerald-500"
            >
              كن مندوباً
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-8 h-8 text-emerald-500" />
                <span className="text-xl font-bold text-white">توصيل تعز</span>
              </div>
              <p className="text-sm">
                خدمة توصيل سريعة وموثوقة في جميع أنحاء مدينة تعز
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/stores" className="hover:text-emerald-400">
                    المتاجر
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-emerald-400">
                    من نحن
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-emerald-400">
                    تواصل معنا
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">للشركاء</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/register?role=vendor"
                    className="hover:text-emerald-400"
                  >
                    سجل متجرك
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?role=driver"
                    className="hover:text-emerald-400"
                  >
                    كن مندوباً
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  تعز، اليمن
                </li>
                <li>📞 777-123-456</li>
                <li>✉️ info@taizdelivery.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>© 2026 توصيل تعز. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function StoreCard({
  store,
}: {
  store: {
    id: string;
    nameAr: string;
    category: string | null;
    rating: string | null;
    imageUrl: string | null;
    isOpen: boolean | null;
  };
}) {
  const categoryLabels: Record<string, string> = {
    restaurant: "مطعم",
    food: "وجبات سريعة",
    pharmacy: "صيدلية",
    grocery: "بقالة",
    bakery: "مخبز",
    other: "أخرى",
  };

  return (
    <Link
      href={`/stores/${store.id}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition group"
    >
      <div className="h-36 bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
        {store.imageUrl ? (
         <img
  src={store.imageUrl}
  alt={store.nameAr}
  className="w-full h-full object-cover"
  loading="lazy"
/>
        ) : (
          <Store className="w-12 h-12 text-emerald-300" />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition">
              {store.nameAr}
            </h4>
            <p className="text-sm text-slate-500">
              {categoryLabels[store.category || "other"]}
            </p>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">
              {store.rating || "5.0"}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              store.isOpen
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {store.isOpen ? "مفتوح" : "مغلق"}
          </span>
          <span className="text-xs text-slate-400">30-45 دقيقة</span>
        </div>
      </div>
    </Link>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h4 className="text-lg font-semibold text-slate-800 mb-2">{title}</h4>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
