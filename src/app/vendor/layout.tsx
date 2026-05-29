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
  Bell,
  Search,
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
    {
      href: "/vendor",
      icon: LayoutDashboard,
      label: "لوحة التحكم",
    },
    {
      href: "/vendor/orders",
      icon: ShoppingBag,
      label: "الطلبات",
    },
    {
      href: "/vendor/products",
      icon: Package,
      label: "المنتجات",
    },
    {
      href: "/vendor/settings",
      icon: Settings,
      label: "الإعدادات",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* SIDEBAR */}
      <aside className="hidden md:flex md:w-72 bg-white border-l border-slate-200 fixed right-0 top-0 h-screen flex-col z-50">

        {/* LOGO */}
        <div className="h-20 border-b border-slate-100 flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Store className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="font-black text-slate-800 text-lg">
                متجر التاجر
              </h1>

              <p className="text-sm text-slate-500">
                لوحة التحكم
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="
                  flex items-center gap-4
                  px-4 py-3 rounded-2xl
                  text-slate-700
                  hover:bg-emerald-50
                  hover:text-emerald-700
                  transition-all duration-200
                  group
                "
              >
                <div
                  className="
                    w-10 h-10 rounded-xl
                    bg-slate-100
                    flex items-center justify-center
                    group-hover:bg-emerald-100
                    transition
                  "
                >
                  <Icon className="w-5 h-5" />
                </div>

                <span className="font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100">

          <div className="bg-emerald-50 rounded-2xl p-4 mb-4">
            <p className="text-sm text-slate-500">
              مرحباً بك 👋
            </p>

            <h3 className="font-bold text-slate-800 mt-1">
              {session.name || "التاجر"}
            </h3>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="
                w-full flex items-center gap-3
                px-4 py-3 rounded-2xl
                text-red-600
                hover:bg-red-50
                transition
              "
            >
              <LogOut className="w-5 h-5" />

              <span className="font-medium">
                تسجيل الخروج
              </span>
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 md:mr-72 min-h-screen">

        {/* TOP HEADER */}
        <header
          className="
            sticky top-0 z-40
            bg-white/80 backdrop-blur-xl
            border-b border-slate-200
          "
        >
          <div className="h-20 px-4 md:px-8 flex items-center justify-between">

            {/* LEFT */}
            <div className="flex items-center gap-3">

              {/* MOBILE MENU */}
              <button
                className="
                  md:hidden
                  w-11 h-11 rounded-xl
                  hover:bg-slate-100
                  flex items-center justify-center
                "
              >
                <Menu className="w-6 h-6 text-slate-700" />
              </button>

              {/* SEARCH */}
              <div
                className="
                  hidden md:flex items-center gap-3
                  bg-slate-100
                  rounded-2xl
                  px-4 h-12 w-[320px]
                "
              >
                <Search className="w-5 h-5 text-slate-400" />

                <input
                  type="text"
                  placeholder="ابحث عن طلب أو منتج..."
                  className="
                    bg-transparent
                    outline-none
                    text-sm
                    w-full
                  "
                />
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">

              {/* NOTIFICATIONS */}
              <button
                className="
                  relative
                  w-11 h-11 rounded-2xl
                  bg-white border border-slate-200
                  hover:bg-slate-50
                  flex items-center justify-center
                "
              >
                <Bell className="w-5 h-5 text-slate-700" />

                <span
                  className="
                    absolute top-2 left-2
                    w-2 h-2 rounded-full
                    bg-red-500
                  "
                />
              </button>

              {/* PROFILE */}
              <div
                className="
                  flex items-center gap-3
                  bg-white border border-slate-200
                  rounded-2xl px-3 py-2
                "
              >
                <div
                  className="
                    w-10 h-10 rounded-xl
                    bg-emerald-600
                    text-white
                    flex items-center justify-center
                    font-bold
                  "
                >
                  {(session.name || "T").charAt(0)}
                </div>

                <div className="hidden md:block">
                  <p className="text-sm font-bold text-slate-800">
                    {session.name || "التاجر"}
                  </p>

                  <p className="text-xs text-slate-500">
                    تاجر
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}