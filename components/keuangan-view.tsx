"use client";

import { useQuery } from "@tanstack/react-query";
import IuranButton from "@/components/iuran-button";
import { api, queryKeys } from "@/lib/query";
import { rupiah, tanggalIndo } from "@/lib/shared/shared";

export default function KeuanganView({ bulan }: { bulan: string }) {
  // Data awal sudah ada di cache (hasil prefetch server), jadi tidak ada loading
  // saat halaman dibuka. queryFn dipakai saat refetch: kembali ke tab setelah
  // >1 menit, atau setelah iuran dicatat (invalidate).
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.keuangan(bulan),
    queryFn: () => api.keuangan(bulan),
  });

  if (isPending) {
    return (
      <>
        <h1>Kas & iuran</h1>
        <p className="stat">Memuat data...</p>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <h1>Kas & iuran</h1>
        <div className="kartu aksi">
          <p className="error">{error.message}</p>
          <button type="button" className="btn btn-kecil" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Mencoba..." : "Coba lagi"}
          </button>
        </div>
      </>
    );
  }

  const { warga, iuran, transaksi } = data;
  const masuk = transaksi.filter((t) => t.jenis === "masuk").reduce((s, t) => s + t.jumlah, 0);
  const keluar = transaksi.filter((t) => t.jenis === "keluar").reduce((s, t) => s + t.jumlah, 0);
  const sudahBayar = new Set(iuran.map((i) => i.wargaId));

  return (
    <>
      <h1>Kas & iuran</h1>

      <div className="grid-2">
        <div className="kartu stat">
          Pemasukan<b className="masuk">{rupiah(masuk)}</b>
        </div>
        <div className="kartu stat">
          Pengeluaran<b className="keluar">{rupiah(keluar)}</b>
        </div>
      </div>
      <div className="kartu stat">
        Saldo saat ini<b>{rupiah(masuk - keluar)}</b>
      </div>

      <h2>Status iuran {bulan}</h2>
      <div className="kartu">
        {warga.map((w) => (
          <div key={w.id} className="baris">
            <div>
              {w.nama}
              <small>Blok {w.blok}</small>
            </div>
            {sudahBayar.has(w.id) ? (
              <span className="badge">Lunas</span>
            ) : (
              // TODO: tombol ini khusus bendahara setelah ada login
              <IuranButton wargaId={w.id} bulan={bulan} />
            )}
          </div>
        ))}
      </div>

      <h2>Riwayat transaksi</h2>
      <div className="kartu">
        {[...transaksi].reverse().map((t) => (
          <div key={t.id} className="baris">
            <div>
              {t.keterangan}
              <small>{tanggalIndo(t.tanggal)}</small>
            </div>
            <span className={t.jenis}>
              {t.jenis === "masuk" ? "+" : "−"}
              {rupiah(t.jumlah)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
