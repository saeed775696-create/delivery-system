"use client";

import { useState } from "react";

export default function ToggleStoreButton({
  storeId,
  isOpen,
}: {
  storeId: string;
  isOpen: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    try {
      await fetch(`/api/stores/${storeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isOpen: !isOpen,
        }),
      });

      window.location.reload();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-2 rounded-lg font-medium transition ${
          isOpen
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
        }`}
      >
        {loading
          ? "جاري التحديث..."
          : isOpen
          ? "إغلاق المتجر"
          : "فتح المتجر"}
      </button>
    </form>
  );
}