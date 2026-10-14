import { NextResponse } from "next/server";
import { getWarga } from "@/lib/data";
import { kirimWA, NO_KETUA_RT } from "@/lib/whatsapp";

// POST /api/surat  { wargaId, keperluan }
// Pengajuan surat pengantar -> notifikasi ke Ketua RT dan konfirmasi ke warga.
export async function POST(req: Request) {
  const { wargaId, keperluan } = await req.json().catch(() => ({}));
  if (!wargaId || !keperluan?.trim()) {
    return NextResponse.json({ error: "Pilih warga dan isi keperluan" }, { status: 400 });
  }

  const w = (await getWarga()).find((x) => x.id === wargaId);
  if (!w) return NextResponse.json({ error: "Warga tidak ditemukan" }, { status: 404 });

  // TODO: simpan pengajuan ke database dengan status "menunggu"

  await kirimWA(w.noHp, `Halo ${w.nama}, pengajuan surat pengantar untuk "${keperluan}" sudah diterima. Kami kabari jika sudah siap.`);
  if (NO_KETUA_RT) {
    await kirimWA(NO_KETUA_RT, `Pengajuan surat baru dari ${w.nama} (${w.blok}): ${keperluan}`);
  }

  return NextResponse.json({ ok: true });
}
