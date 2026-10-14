import { NextResponse } from "next/server";
import { bulanIni, DataError, getKeuangan } from "@/lib/data/data";

// GET /api/keuangan?bulan=YYYY-MM
// Dipakai TanStack Query untuk refetch data halaman Kas & iuran.
export async function GET(req: Request) {
  const bulan = new URL(req.url).searchParams.get("bulan") || bulanIni();
  try {
    return NextResponse.json(await getKeuangan(bulan));
  } catch (e) {
    if (e instanceof DataError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    // biome-ignore lint/suspicious/noConsole: log error server
    console.error("Gagal memuat data keuangan:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server, coba lagi" }, { status: 500 });
  }
}
