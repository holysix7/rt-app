// Konfigurasi TanStack Query: pembuatan QueryClient, query key, dan fungsi
// fetch ke API. Aman dipakai di server maupun client (tidak menyentuh database).
import { isServer, QueryClient } from "@tanstack/react-query";
import type { Keuangan } from "@/lib/shared/shared";

function buatQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data hasil prefetch di server dianggap segar 1 menit, jadi tidak
        // langsung di-fetch ulang begitu halaman tampil di browser.
        staleTime: 60 * 1000,
        retry: 1,
      },
      mutations: {
        // Jangan ulangi otomatis: mencatat iuran dua kali itu berbahaya.
        retry: false,
      },
    },
  });
}

let queryClientBrowser: QueryClient | undefined;

// Server: QueryClient baru per request (data antar warga tidak tercampur).
// Browser: satu QueryClient yang sama selama aplikasi terbuka.
export function getQueryClient() {
  if (isServer) return buatQueryClient();
  queryClientBrowser ??= buatQueryClient();
  return queryClientBrowser;
}

// Semua query key di satu tempat supaya invalidasi tidak salah ketik.
export const queryKeys = {
  keuangan: (bulan: string) => ["keuangan", bulan] as const,
};

// --- Fungsi fetch ke API (dipanggil dari browser) ---

async function panggilApi<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Gagal menghubungi server");
  return data as T;
}

function kirimJson<T>(url: string, body: unknown) {
  return panggilApi<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export const api = {
  keuangan: (bulan: string) => panggilApi<Keuangan>(`/api/keuangan?bulan=${encodeURIComponent(bulan)}`),
  catatIuran: (input: { wargaId: string; bulan: string }) => kirimJson<{ ok: true }>("/api/iuran", input),
  ajukanSurat: (input: { wargaId: string; keperluan: string }) =>
    kirimJson<{ ok: true; id: string }>("/api/surat", input),
};
