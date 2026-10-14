import { NextResponse } from "next/server";
import { catatIuran, DataError, rupiah } from "@/lib/data";
import { RT } from "@/lib/shared";
import { kirimWA, NO_BENDAHARA } from "@/lib/whatsapp";

// POST /api/iuran  { wargaId, bulan }
// Mencatat iuran lalu mengirim notifikasi otomatis ke warga & bendahara.
export async function POST(req: Request) {
  const { wargaId, bulan } = await req.json().catch(() => ({}));
  if (typeof wargaId !== "string" || typeof bulan !== "string" || !wargaId || !bulan) {
    return NextResponse.json({ error: "wargaId dan bulan wajib diisi" }, { status: 400 });
  }

  let w: Awaited<ReturnType<typeof catatIuran>>;
  try {
    w = await catatIuran(wargaId, bulan);
  } catch (e) {
    if (e instanceof DataError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    // biome-ignore lint/suspicious/noConsole: log error server
    console.error("Gagal mencatat iuran:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server, coba lagi" }, { status: 500 });
  }

  // Notifikasi dikirim setelah data tersimpan; gagal kirim WA tidak membatalkan iuran.
  const jumlah = rupiah(RT.iuranBulanan);
  await kirimWA(w.noHp, `Terima kasih ${w.nama}, iuran ${RT.nama} bulan ${bulan} sebesar ${jumlah} sudah tercatat.`);
  if (NO_BENDAHARA) {
    await kirimWA(NO_BENDAHARA, `Iuran masuk: ${w.nama} (${w.blok}) - ${bulan} - ${jumlah}`);
  }

  return NextResponse.json({ ok: true });
}
