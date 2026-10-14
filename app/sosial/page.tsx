import { getKegiatan, getUmkm, tanggalIndo } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Sosial() {
  const [umkm, kegiatan] = await Promise.all([getUmkm(), getKegiatan()]);

  return (
    <>
      <h1>Sosial & ekonomi</h1>

      <h2>UMKM warga</h2>
      <div className="kartu">
        {umkm.map((u) => (
          <div key={u.id} className="baris">
            <div>
              {u.nama}
              <small>{u.kategori} · {u.pemilik}</small>
            </div>
            <a
              className="link-wa"
              href={`https://wa.me/${u.noHp}?text=${encodeURIComponent(`Halo, saya warga RT mau pesan dari ${u.nama}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat WA
            </a>
          </div>
        ))}
      </div>

      <h2 id="kegiatan">Kegiatan</h2>
      <div className="kartu">
        {kegiatan.map((k) => (
          <div key={k.id} className="baris">
            <div>{k.judul}<small>{k.lokasi}</small></div>
            <span className="badge">{tanggalIndo(k.tanggal)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
