import Link from "next/link";
import { Truck } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
        <Truck className="w-10 h-10 text-emerald-600" />
      </div>
      <h1 className="text-4xl font-bold text-slate-800 mb-2">404</h1>
      <h2 className="text-xl text-slate-600 mb-4">الصفحة غير موجودة</h2>
      <p className="text-slate-500 mb-8 text-center max-w-md">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
