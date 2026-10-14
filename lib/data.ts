// Data contoh (mock). Ganti dengan database sungguhan, misalnya Supabase,
// lewat fungsi-fungsi di bawah agar halaman tidak perlu diubah.

export const RT = {
  nama: "RT 05",
  rw: "RW 02",
  kelurahan: "Kelurahan Contoh",
  iuranBulanan: 50000,
};

export type Warga = {
  id: string;
  nama: string;
  blok: string;
  noHp: string;
  status: "pemilik" | "kontrak";
  jiwa: number;
};

export type Iuran = {
  wargaId: string;
  bulan: string; // format YYYY-MM
  jumlah: number;
  tanggal: string;
};

export type Transaksi = {
  id: string;
  tanggal: string;
  keterangan: string;
  jenis: "masuk" | "keluar";
  jumlah: number;
};

export type Umkm = {
  id: string;
  nama: string;
  pemilik: string;
  kategori: string;
  noHp: string;
};

export type Kegiatan = {
  id: string;
  judul: string;
  tanggal: string;
  lokasi: string;
};

const warga: Warga[] = [
  { id: "w1", nama: "Budi Santoso", blok: "A-01", noHp: "6281200000001", status: "pemilik", jiwa: 4 },
  { id: "w2", nama: "Siti Aminah", blok: "A-02", noHp: "6281200000002", status: "kontrak", jiwa: 3 },
  { id: "w3", nama: "Agus Pratama", blok: "B-05", noHp: "6281200000003", status: "pemilik", jiwa: 5 },
  { id: "w4", nama: "Dewi Lestari", blok: "B-07", noHp: "6281200000004", status: "pemilik", jiwa: 2 },
];

const iuran: Iuran[] = [
  { wargaId: "w1", bulan: "2026-10", jumlah: 50000, tanggal: "2026-10-02" },
  { wargaId: "w3", bulan: "2026-10", jumlah: 50000, tanggal: "2026-10-05" },
];

const transaksi: Transaksi[] = [
  { id: "t1", tanggal: "2026-10-01", keterangan: "Saldo awal Oktober", jenis: "masuk", jumlah: 2350000 },
  { id: "t2", tanggal: "2026-10-02", keterangan: "Iuran A-01", jenis: "masuk", jumlah: 50000 },
  { id: "t3", tanggal: "2026-10-05", keterangan: "Iuran B-05", jenis: "masuk", jumlah: 50000 },
  { id: "t4", tanggal: "2026-10-08", keterangan: "Gaji petugas sampah", jenis: "keluar", jumlah: 400000 },
];

const umkm: Umkm[] = [
  { id: "u1", nama: "Katering Bu Siti", pemilik: "Siti Aminah", kategori: "Makanan", noHp: "6281200000002" },
  { id: "u2", nama: "Laundry Kilat", pemilik: "Dewi Lestari", kategori: "Jasa", noHp: "6281200000004" },
];

const kegiatan: Kegiatan[] = [
  { id: "k1", judul: "Kerja bakti bersih selokan", tanggal: "2026-10-18", lokasi: "Seluruh blok" },
  { id: "k2", judul: "Posyandu balita", tanggal: "2026-10-22", lokasi: "Pos RT" },
];

// --- Fungsi akses data (ganti isinya dengan query database) ---
export async function getWarga() { return warga; }
export async function getIuran(bulan: string) { return iuran.filter((i) => i.bulan === bulan); }
export async function getTransaksi() { return transaksi; }
export async function getUmkm() { return umkm; }
export async function getKegiatan() { return kegiatan; }

export async function catatIuran(wargaId: string, bulan: string) {
  const w = warga.find((x) => x.id === wargaId);
  if (!w) throw new Error("Warga tidak ditemukan");
  if (iuran.some((i) => i.wargaId === wargaId && i.bulan === bulan)) {
    throw new Error("Iuran bulan ini sudah tercatat");
  }
  const tanggal = new Date().toISOString().slice(0, 10);
  iuran.push({ wargaId, bulan, jumlah: RT.iuranBulanan, tanggal });
  transaksi.push({
    id: `t${transaksi.length + 1}`,
    tanggal,
    keterangan: `Iuran ${w.blok}`,
    jenis: "masuk",
    jumlah: RT.iuranBulanan,
  });
  return w;
}

// --- Helper ---
export function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export function bulanIni() {
  return new Date().toISOString().slice(0, 7);
}

export function tanggalIndo(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
