import { NextResponse } from "next/server";
import { ajukanSurat, DataError } from "@/lib/data/data";
import { kirimWA, NO_KETUA_RT } from "@/lib/whatsapp";

// POST /api/surat  { wargaId, keperluan }
// Menyimpan pengajuan surat pengantar (status "menunggu"),
// lalu notifikasi ke Ketua RT dan konfirmasi ke warga.
export async function POST(req: Request) {
  const { wargaId, keperluan } = await req.json().catch(() => ({}));
  if (typeof wargaId !== "string" || typeof keperluan !== "string" || !wargaId || !keperluan.trim()) {
    return NextResponse.json({ error: "Pilih warga dan isi keperluan" }, { status: 400 });
  }

  let hasil: Awaited<ReturnType<typeof ajukanSurat>>;
  try {
    hasil = await ajukanSurat(wargaId, keperluan);
  } catch (e) {
    if (e instanceof DataError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    // biome-ignore lint/suspicious/noConsole: log error server
    console.error("Gagal menyimpan pengajuan surat:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server, coba lagi" }, { status: 500 });
  }

  const { warga: w, surat } = hasil;
  await kirimWA(
    w.noHp,
    `Halo ${w.nama}, pengajuan surat pengantar untuk "${surat.keperluan}" sudah diterima. Kami kabari jika sudah siap.`,
  );
  if (NO_KETUA_RT) {
    await kirimWA(NO_KETUA_RT, `Pengajuan surat baru dari ${w.nama} (${w.blok}): ${surat.keperluan}`);
  }

  return NextResponse.json({ ok: true, id: surat.id });
}
