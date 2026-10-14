import SuratForm from "@/components/surat-form";
import { getWarga } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Administrasi() {
  const warga = await getWarga();

  return (
    <>
      <h1>Administrasi & data</h1>

      <h2>Ajukan surat pengantar</h2>
      <div className="kartu">
        {/* Hanya kirim kolom yang dibutuhkan form ke browser (tanpa no HP) */}
        <SuratForm warga={warga.map(({ id, nama, blok }) => ({ id, nama, blok }))} />
      </div>

      {/* TODO: batasi daftar ini hanya untuk pengurus setelah ada login */}
      <h2>Daftar KK ({warga.length})</h2>
      <div className="kartu">
        {warga.map((w) => (
          <div key={w.id} className="baris">
            <div>
              {w.nama}
              <small>
                Blok {w.blok} · {w.jiwa} jiwa
              </small>
            </div>
            <span className="badge">{w.status}</span>
          </div>
        ))}
      </div>
    </>
  );
}
