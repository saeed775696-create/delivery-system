import { Truck } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 flex flex-col">
      <header className="p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700">
          <Truck className="w-8 h-8" />
          <span className="text-xl font-bold">توصيل تعز</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
