"use client";

import { useState, type FormEvent } from "react";
import type { Warga } from "@/lib/data";

export default function SuratForm({ warga }: { warga: Warga[] }) {
  const [wargaId, setWargaId] = useState("");
  const [keperluan, setKeperluan] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; pesan: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function kirim(e: FormEvent) {
    e.preventDefault();
    if (!wargaId || !keperluan.trim()) {
      setStatus({ ok: false, pesan: "Pilih nama dan isi keperluan dulu." });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/surat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wargaId, keperluan }),
    });
    setLoading(false);
    const data = await res.json();
    if (res.ok) {
      setStatus({ ok: true, pesan: "Pengajuan terkirim. Notifikasi WA dikirim ke Ketua RT." });
      setKeperluan("");
    } else {
      setStatus({ ok: false, pesan: data.error || "Gagal mengirim" });
    }
  }

  return (
    <form onSubmit={kirim} className="form">
      <label>
        Nama warga
        <select value={wargaId} onChange={(e) => { setWargaId(e.target.value); setStatus(null); }}>
          <option value="">Pilih nama</option>
          {warga.map((w) => (
            <option key={w.id} value={w.id}>{w.nama} ({w.blok})</option>
          ))}
        </select>
      </label>
      <label>
        Keperluan
        <input
          value={keperluan}
          onChange={(e) => { setKeperluan(e.target.value); setStatus(null); }}
          placeholder="Contoh: pembuatan KTP"
        />
      </label>
      <button className="btn" disabled={loading}>{loading ? "Mengirim..." : "Ajukan surat"}</button>
      {status && <p className={status.ok ? "sukses" : "error"}>{status.pesan}</p>}
    </form>
  );
}
