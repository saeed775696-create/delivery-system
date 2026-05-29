"use client";

import { useState } from "react";

const statuses = [
  {
    value: "open",
    label: "مفتوح",
    color: "bg-green-500",
  },
  {
    value: "busy",
    label: "مشغول",
    color: "bg-orange-500",
  },
  {
    value: "closed",
    label: "مغلق",
    color: "bg-red-500",
  },
  {
    value: "offline",
    label: "خارج الخدمة",
    color: "bg-slate-500",
  },
];

export default function StoreStatusSwitcher({
  currentStatus,
}: {
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/vendor/store/status",
        {
          method: "POST",
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed");
      }

      setStatus(newStatus);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {statuses.map((item) => (
        <button
          key={item.value}
          disabled={loading}
          onClick={() =>
            updateStatus(item.value)
          }
          className={`px-4 py-2 rounded-xl text-sm font-medium transition text-white ${
            status === item.value
              ? item.color
              : "bg-slate-200 text-slate-700"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}