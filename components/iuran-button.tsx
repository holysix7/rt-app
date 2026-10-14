"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function IuranButton({ wargaId, bulan }: { wargaId: string; bulan: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function bayar() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/iuran", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wargaId, bulan }),
    });
    setLoading(false);
    if (!res.ok) {
      setError((await res.json()).error || "Gagal mencatat");
      return;
    }
    router.refresh();
  }

  return (
    <div className="aksi">
      <button type="button" className="btn btn-kecil" onClick={bayar} disabled={loading}>
        {loading ? "Menyimpan..." : "Tandai lunas"}
      </button>
      {error && <small className="error">{error}</small>}
    </div>
  );
}
