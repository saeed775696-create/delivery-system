"use client";

import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  status: string;
  label: string;
};

export default function UpdateOrderStatusButton({
  orderId,
  status,
  label,
}: Props) {
  const router = useRouter();

  const updateStatus = async () => {
    try {
      const res = await fetch(
        "/api/drivers/orders/status",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            orderId,
            status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      onClick={updateStatus}
      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
    >
      {label}
    </button>
  );
}