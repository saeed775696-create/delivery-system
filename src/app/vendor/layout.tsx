import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  Store,
  Menu,
} from "lucide-react";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "vendor") {
    redirect("/login");
  }

  const navItems = [
    { href: "/vendor", icon: LayoutDashboard, label: "لوحة التحكم" },
    { href: "/vendor/orders", icon: ShoppingBag, label: "الطلبات" },
    { href: "/vendor/products", icon: Package, label: "المنتجات" },
    { href: "/vendor/settings", icon: Settings, label: "إعدادات المتجر" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-800 text-white fixed h-full hidden md:block">
        <div className="p-6 border-b border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold">متجري</h1>
              <p className="text-xs text-emerald-200">لوحة التاجر</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-100 hover:bg-emerald-700 transition"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-700">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-900/20 transition w-full"
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
              <Store className="w-8 h-8 text-emerald-600" />
              <span className="font-bold text-slate-800">متجري</span>
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
