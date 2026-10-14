import { NextResponse } from "next/server";
import { catatIuran, rupiah, RT } from "@/lib/data";
import { kirimWA, NO_BENDAHARA } from "@/lib/whatsapp";

// POST /api/iuran  { wargaId, bulan }
// Mencatat iuran lalu mengirim notifikasi otomatis ke warga & bendahara.
export async function POST(req: Request) {
  const { wargaId, bulan } = await req.json().catch(() => ({}));
  if (!wargaId || !bulan) {
    return NextResponse.json({ error: "wargaId dan bulan wajib diisi" }, { status: 400 });
  }

  try {
    const w = await catatIuran(wargaId, bulan);
    const jumlah = rupiah(RT.iuranBulanan);

    await kirimWA(
      w.noHp,
      `Terima kasih ${w.nama}, iuran ${RT.nama} bulan ${bulan} sebesar ${jumlah} sudah tercatat.`
    );
    if (NO_BENDAHARA) {
      await kirimWA(NO_BENDAHARA, `Iuran masuk: ${w.nama} (${w.blok}) - ${bulan} - ${jumlah}`);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
