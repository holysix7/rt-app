import type { Keuangan } from "../shared";
import { callApi, sendRequest } from "./query";

export const queryKeys = {
  keuangan: (bulan: string) => ["keuangan", bulan] as const,
};

export const queryService = {
  keuangan: (bulan: string) => callApi<Keuangan>(`/api/keuangan?bulan=${encodeURIComponent(bulan)}`),
  catatIuran: (input: { wargaId: string; bulan: string }) => sendRequest<{ ok: true }>("/api/iuran", input),
  ajukanSurat: (input: { wargaId: string; keperluan: string }) =>
    sendRequest<{ ok: true; id: string }>("/api/surat", input),
};
