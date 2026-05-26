"use client";

import Button from "@/components/ui/Button";
import { Truck } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <Truck className="w-10 h-10 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        حدث خطأ غير متوقع
      </h1>
      <p className="text-slate-500 mb-8 text-center max-w-md">
        عذراً، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى
      </p>
      <Button onClick={reset} variant="primary" size="lg">
        إعادة المحاولة
      </Button>
    </div>
  );
}
