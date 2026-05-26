"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { Phone, Lock, Eye, EyeOff } from "lucide-react"; // أضفنا Eye و EyeOff هنا

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 1. أضفنا هذه الحالة هنا لقراءة حالة العين
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ في تسجيل الدخول");
      }

      // Redirect based on role
      switch (data.user.role) {
        case "admin":
          router.push("/admin");
          break;
        case "vendor":
          router.push("/vendor");
          break;
        case "driver":
          router.push("/driver");
          break;
        default:
          router.push("/stores");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">مرحباً بعودتك</h1>
        <p className="text-slate-500 mt-2">سجل دخولك للمتابعة</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="رقم الهاتف"
          type="tel"
          name="phone"
          placeholder="777123456"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
          icon={<Phone className="w-5 h-5" />}
          required
        />

        {/* 2. قمنا بلف الحقل بـ div يعطيه تموضع نسبي لتثبيت العين في اليسار بدقة */}
        <div className="relative flex flex-col justify-end">
          <Input
            label="كلمة المرور"
            type={showPassword ? "text" : "password"} // 3. يتغير النوع هنا ديناميكياً بناءً على الحالة
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            icon={<Lock className="w-5 h-5" />}
            required
          />
          {/* 4. هذا هو زر العين، يظهر فوق الحقل من جهة اليسار (RTL المعتمد للعربية) */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 bottom-3 text-slate-400 hover:text-slate-600 focus:outline-none z-10"
            title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          تسجيل الدخول
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-slate-500">
          ليس لديك حساب؟{" "}
          <Link
            href="/register"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </Card>
  );
}