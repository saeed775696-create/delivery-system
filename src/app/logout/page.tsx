"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
        });

        // حذف أي بيانات محلية
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("cart");

        // توجيه لصفحة تسجيل الدخول
        router.replace("/login");
      } catch (error) {
        console.error("Logout error:", error);
        router.replace("/login");
      }
    };

    logout();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-slate-600">جاري تسجيل الخروج...</p>
    </div>
  );
}