// Lapisan akses data. Halaman & API cukup memanggil fungsi di sini;
// detail query PostgreSQL tidak bocor ke komponen UI.
import { db } from "@/lib/db";
import {
  type Iuran,
  type Kegiatan,
  type Keuangan,
  RT,
  type SuratPengantar,
  type Transaksi,
  type Umkm,
  type Warga,
} from "../shared";
import { POLA_BULAN, POLA_UUID } from "./data.const";

// Tipe & helper ada di lib/shared.ts (aman untuk client component).
// Di-export ulang di sini supaya import lama `@/lib/data` tetap jalan di server.
export * from "@/lib/shared/shared";

// Kesalahan yang aman ditampilkan ke pengguna (validasi / aturan bisnis).
// Error lain (mis. database mati) dianggap error server.
export class DataError extends Error {}

// --- Baca data ---

export async function getWarga() {
  return db()<Array<Warga>>`
    SELECT id, nama, blok, no_hp AS "noHp", status, jiwa
    FROM warga
    WHERE aktif
    ORDER BY blok, nama
  `;
}

export async function getWargaById(id: string) {
  if (!POLA_UUID.test(id)) return null;
  const [w] = await db()<Array<Warga>>`
    SELECT id, nama, blok, no_hp AS "noHp", status, jiwa
    FROM warga
    WHERE id = ${id} AND aktif
  `;
  return w ?? null;
}

export async function getIuran(bulan: string) {
  if (!POLA_BULAN.test(bulan)) throw new DataError("Format bulan harus YYYY-MM");
  return db()<Array<Iuran>>`
    SELECT warga_id AS "wargaId",
           to_char(bulan, 'YYYY-MM') AS bulan,
           jumlah,
           to_char(tanggal, 'YYYY-MM-DD') AS tanggal
    FROM iuran
    WHERE bulan = ${`${bulan}-01`}::date
  `;
}

export async function getTransaksi() {
  return db()<Array<Transaksi>>`
    SELECT id, to_char(tanggal, 'YYYY-MM-DD') AS tanggal, keterangan, jenis, jumlah
    FROM kas_transaksi
    ORDER BY tanggal, created_at
  `;
}

export async function getUmkm() {
  return db()<Array<Umkm>>`
    SELECT id, nama, pemilik, kategori, no_hp AS "noHp"
    FROM umkm
    WHERE aktif
    ORDER BY nama
  `;
}

// Kegiatan mulai hari ini ke depan, yang paling dekat di atas.
export async function getKegiatan() {
  return db()<Array<Kegiatan>>`
    SELECT id, judul, to_char(tanggal, 'YYYY-MM-DD') AS tanggal, lokasi
    FROM kegiatan
    WHERE tanggal >= current_date
    ORDER BY tanggal
  `;
}

// Semua data halaman Kas & iuran dalam satu objek: dipakai untuk prefetch di
// server dan oleh GET /api/keuangan saat TanStack Query refetch di browser.
export async function getKeuangan(bulan: string): Promise<Keuangan> {
  const [warga, iuran, transaksi] = await Promise.all([getWarga(), getIuran(bulan), getTransaksi()]);
  return {
    bulan,
    warga: warga.map(({ id, nama, blok }) => ({ id, nama, blok })),
    // Salin ke array biasa (hasil postgres.js punya properti tambahan) agar aman diserialisasi.
    iuran: iuran.map((i) => ({ ...i })),
    transaksi: transaksi.map((t) => ({ ...t })),
  };
}

// --- Tulis data ---

// Mencatat iuran + pemasukan kas dalam satu transaksi database.
export async function catatIuran(wargaId: string, bulan: string) {
  if (!POLA_BULAN.test(bulan)) throw new DataError("Format bulan harus YYYY-MM");
  const w = await getWargaById(wargaId);
  if (!w) throw new DataError("Warga tidak ditemukan");

  await db().begin(async (tx) => {
    const [kas] = await tx<Array<{ id: string }>>`
      INSERT INTO kas_transaksi (keterangan, jenis, jumlah)
      VALUES (${`Iuran ${w.blok}`}, 'masuk', ${RT.iuranBulanan})
      RETURNING id
    `;
    // Constraint UNIQUE (warga_id, bulan) mencegah dobel bayar, juga saat dua
    // pengurus menekan tombol bersamaan.
    const [baru] = await tx<Array<{ id: string }>>`
      INSERT INTO iuran (warga_id, bulan, jumlah, transaksi_id)
      VALUES (${w.id}, ${`${bulan}-01`}::date, ${RT.iuranBulanan}, ${kas.id})
      ON CONFLICT (warga_id, bulan) DO NOTHING
      RETURNING id
    `;
    // Melempar error di sini membatalkan insert kas di atas (rollback).
    if (!baru) throw new DataError("Iuran bulan ini sudah tercatat");
  });

  return w;
}

export async function ajukanSurat(wargaId: string, keperluan: string) {
  const isi = keperluan.trim();
  if (!isi) throw new DataError("Keperluan wajib diisi");
  if (isi.length > 200) throw new DataError("Keperluan maksimal 200 karakter");
  const w = await getWargaById(wargaId);
  if (!w) throw new DataError("Warga tidak ditemukan");

  const [surat] = await db()<Array<SuratPengantar>>`
    INSERT INTO surat_pengantar (warga_id, keperluan)
    VALUES (${w.id}, ${isi})
    RETURNING id, warga_id AS "wargaId", keperluan, status, created_at::text AS dibuat
  `;
  return { warga: w, surat };
}
