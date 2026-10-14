import Link from "next/link";
import { bulanIni, getIuran, getKegiatan, getTransaksi, getWarga, rupiah, tanggalIndo } from "@/lib/data/data";

export const dynamic = "force-dynamic";

export default async function Beranda() {
  const [warga, transaksi, kegiatan, iuran] = await Promise.all([
    getWarga(),
    getTransaksi(),
    getKegiatan(),
    getIuran(bulanIni()),
  ]);
  const saldo = transaksi.reduce((s, t) => s + (t.jenis === "masuk" ? t.jumlah : -t.jumlah), 0);
  const jiwa = warga.reduce((s, w) => s + w.jiwa, 0);

  return (
    <>
      <h1>Halo, warga!</h1>

      <div className="grid-2">
        <div className="kartu stat">
          Saldo kas<b>{rupiah(saldo)}</b>
        </div>
        <div className="kartu stat">
          Iuran bulan ini
          <b>
            {iuran.length}/{warga.length} KK
          </b>
        </div>
        <div className="kartu stat">
          Jumlah KK<b>{warga.length}</b>
        </div>
        <div className="kartu stat">
          Jumlah jiwa<b>{jiwa}</b>
        </div>
      </div>

      <h2>Menu</h2>
      <div className="menu-cepat">
        <Link href="/administrasi">
          Data warga<small>Daftar KK & surat</small>
        </Link>
        <Link href="/keuangan">
          Kas & iuran<small>Laporan transparan</small>
        </Link>
        <Link href="/sosial">
          UMKM warga<small>Belanja ke tetangga</small>
        </Link>
        <Link href="/sosial#kegiatan">
          Kegiatan<small>Jadwal terdekat</small>
        </Link>
      </div>

      <h2>Kegiatan terdekat</h2>
      <div className="kartu">
        {kegiatan.map((k) => (
          <div key={k.id} className="baris">
            <div>
              {k.judul}
              <small>{k.lokasi}</small>
            </div>
            <span className="badge">{tanggalIndo(k.tanggal)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
