import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Users,
  Truck,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "لوحة التحكم" },
    { href: "/admin/orders", icon: ShoppingBag, label: "الطلبات" },
    { href: "/admin/stores", icon: Store, label: "المتاجر" },
    { href: "/admin/drivers", icon: Truck, label: "المندوبين" },
    { href: "/admin/users", icon: Users, label: "المستخدمين" },
    { href: "/admin/settings", icon: Settings, label: "الإعدادات" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white fixed h-full hidden md:block">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold">توصيل تعز</h1>
              <p className="text-xs text-slate-400">لوحة الإدارة</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition w-full"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:mr-64">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm md:hidden sticky top-0 z-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-emerald-600" />
              <span className="font-bold text-slate-800">لوحة الإدارة</span>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
