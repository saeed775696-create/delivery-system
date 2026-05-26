"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { Phone, Lock, User, Store, Truck } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    fullName: "",
    role: "customer" as "customer" | "driver" | "vendor",
  });

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && ["customer", "driver", "vendor"].includes(roleParam)) {
      setFormData((prev) => ({
        ...prev,
        role: roleParam as "customer" | "driver" | "vendor",
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ في التسجيل");
      }

      // Redirect based on role
      switch (data.user.role) {
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

  const roles = [
    {
      value: "customer",
      label: "عميل",
      description: "اطلب من المتاجر",
      icon: User,
    },
    {
      value: "driver",
      label: "مندوب توصيل",
      description: "اربح من التوصيل",
      icon: Truck,
    },
    {
      value: "vendor",
      label: "صاحب متجر",
      description: "سجل متجرك",
      icon: Store,
    },
  ];

  return (
    <Card className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">إنشاء حساب جديد</h1>
        <p className="text-slate-500 mt-2">انضم لعائلة توصيل تعز</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            نوع الحساب
          </label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, role: role.value as typeof formData.role })
                }
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  formData.role === role.value
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <role.icon
                  className={`w-6 h-6 mx-auto mb-1 ${
                    formData.role === role.value
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    formData.role === role.value
                      ? "text-emerald-700"
                      : "text-slate-600"
                  }`}
                >
                  {role.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="الاسم الكامل"
          type="text"
          name="fullName"
          placeholder="محمد أحمد"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          icon={<User className="w-5 h-5" />}
          required
        />

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

        <Input
          label="كلمة المرور"
          type="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          icon={<Lock className="w-5 h-5" />}
          required
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          إنشاء الحساب
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-slate-500">
          لديك حساب؟{" "}
          <Link
            href="/login"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center">جاري التحميل...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
