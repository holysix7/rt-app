export const RT = {
  nama: "RT 05",
  rw: "RW 02",
  kelurahan: "Kelurahan Contoh",
  iuranBulanan: 50000,
};

export interface Warga {
  id: string;
  nama: string;
  blok: string;
  noHp: string;
  status: "pemilik" | "kontrak";
  jiwa: number;
}

export interface Iuran {
  wargaId: string;
  bulan: string; // format YYYY-MM
  jumlah: number;
  tanggal: string; // format YYYY-MM-DD
}

export interface Transaksi {
  id: string;
  tanggal: string;
  keterangan: string;
  jenis: "masuk" | "keluar";
  jumlah: number;
}

export interface Umkm {
  id: string;
  nama: string;
  pemilik: string;
  kategori: string;
  noHp: string;
}

export interface Kegiatan {
  id: string;
  judul: string;
  tanggal: string;
  lokasi: string;
}

export interface SuratPengantar {
  id: string;
  wargaId: string;
  keperluan: string;
  status: "menunggu" | "diproses" | "selesai" | "ditolak";
  dibuat: string;
}

// Data halaman Kas & iuran. Warga sengaja tanpa no HP karena endpoint-nya publik.
export interface Keuangan {
  bulan: string;
  warga: Array<Pick<Warga, "id" | "nama" | "blok">>;
  iuran: Array<Iuran>;
  transaksi: Array<Transaksi>;
}
