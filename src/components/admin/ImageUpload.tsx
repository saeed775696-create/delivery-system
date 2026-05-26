"use client";

import { useState } from "react";

export default function ImageUpload({
  onUpload,
}: {
  onUpload: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setLoading(false);

    if (data.url) {
      onUpload(data.url);
    }
  };

  return (
    <div className="border p-3 rounded">
      <input type="file" onChange={handleUpload} />

      {loading && (
        <p className="text-sm text-slate-500 mt-2">جاري الرفع...</p>
      )}
    </div>
  );
}