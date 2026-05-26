"use client";

import { useRouter } from "next/navigation";

export default function ToggleAvailabilityButton({
  isAvailable,
}: {
  isAvailable: boolean;
}) {
  const router = useRouter();

  async function handleToggle() {
    try {
      await fetch("/api/drivers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAvailable: !isAvailable,
        }),
      });

      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`px-4 py-2 rounded-lg font-medium transition ${
        isAvailable
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
      }`}
    >
      {isAvailable ? "إيقاف الاستقبال" : "بدء الاستقبال"}
    </button>
  );
}