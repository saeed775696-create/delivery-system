"use client";

import { useRouter } from "next/navigation";

export default function AcceptOrderButton({
  orderId,
}: {
  orderId: string;
}) {
  const router = useRouter();

  const handleAccept = async () => {
    const res = await fetch(
      "/api/drivers/orders/accept",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      router.refresh();
    } else {
      alert(data.error);
    }
  };

  return (
    <button
      onClick={handleAccept}
      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
    >
      قبول الطلب
    </button>
  );
}