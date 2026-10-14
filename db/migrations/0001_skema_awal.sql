-- Skema awal web app RT.
-- Diturunkan dari kebutuhan UI: Beranda, Administrasi, Keuangan, Sosial,
-- serta API /api/iuran dan /api/surat.

-- ---------------------------------------------------------------------------
-- Tipe enum
-- ---------------------------------------------------------------------------
CREATE TYPE status_hunian AS ENUM ('pemilik', 'kontrak');
CREATE TYPE jenis_transaksi AS ENUM ('masuk', 'keluar');
CREATE TYPE status_surat AS ENUM ('menunggu', 'diproses', 'selesai', 'ditolak');

-- Mengisi kolom updated_at otomatis setiap kali baris diubah
CREATE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Warga: satu baris = satu Kepala Keluarga (KK)
-- Dipakai di daftar KK, dropdown surat, status iuran, statistik beranda.
-- ---------------------------------------------------------------------------
CREATE TABLE warga (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        text          NOT NULL CHECK (btrim(nama) <> ''),
  blok        text          NOT NULL CHECK (btrim(blok) <> ''),
  no_hp       text          NOT NULL CHECK (no_hp ~ '^62[0-9]{8,13}$'),
  status      status_hunian NOT NULL,
  jiwa        smallint      NOT NULL DEFAULT 1 CHECK (jiwa > 0),
  aktif       boolean       NOT NULL DEFAULT true, -- false = pindah, data lama tetap tersimpan
  created_at  timestamptz   NOT NULL DEFAULT now(),
  updated_at  timestamptz   NOT NULL DEFAULT now()
);
CREATE INDEX warga_blok_idx ON warga (blok) WHERE aktif;
CREATE TRIGGER warga_updated_at BEFORE UPDATE ON warga
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Buku kas RT (riwayat transaksi, saldo, pemasukan/pengeluaran)
-- ---------------------------------------------------------------------------
CREATE TABLE kas_transaksi (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal     date            NOT NULL DEFAULT current_date,
  keterangan  text            NOT NULL CHECK (btrim(keterangan) <> ''),
  jenis       jenis_transaksi NOT NULL,
  jumlah      integer         NOT NULL CHECK (jumlah > 0), -- rupiah
  created_at  timestamptz     NOT NULL DEFAULT now()
);
CREATE INDEX kas_transaksi_tanggal_idx ON kas_transaksi (tanggal, created_at);

-- ---------------------------------------------------------------------------
-- Iuran bulanan per KK. Satu KK hanya bisa bayar sekali per bulan.
-- Setiap iuran tercatat juga sebagai pemasukan kas (transaksi_id).
-- ---------------------------------------------------------------------------
CREATE TABLE iuran (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id      uuid    NOT NULL REFERENCES warga (id) ON DELETE RESTRICT,
  bulan         date    NOT NULL CHECK (extract(day FROM bulan) = 1), -- tanggal 1 bulan iuran
  jumlah        integer NOT NULL CHECK (jumlah > 0),
  tanggal       date    NOT NULL DEFAULT current_date,               -- tanggal bayar
  transaksi_id  uuid    UNIQUE REFERENCES kas_transaksi (id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT iuran_warga_bulan_unik UNIQUE (warga_id, bulan)
);
CREATE INDEX iuran_bulan_idx ON iuran (bulan);

-- ---------------------------------------------------------------------------
-- UMKM warga (katalog + tombol Chat WA)
-- pemilik disimpan sebagai teks karena bisa anggota keluarga, bukan kepala KK;
-- warga_id opsional untuk menautkan ke KK.
-- ---------------------------------------------------------------------------
CREATE TABLE umkm (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        text        NOT NULL CHECK (btrim(nama) <> ''),
  pemilik     text        NOT NULL,
  warga_id    uuid        REFERENCES warga (id) ON DELETE SET NULL,
  kategori    text        NOT NULL,
  no_hp       text        NOT NULL CHECK (no_hp ~ '^62[0-9]{8,13}$'),
  aktif       boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER umkm_updated_at BEFORE UPDATE ON umkm
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Jadwal kegiatan (beranda "Kegiatan terdekat" + halaman Sosial)
-- ---------------------------------------------------------------------------
CREATE TABLE kegiatan (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul       text        NOT NULL CHECK (btrim(judul) <> ''),
  tanggal     date        NOT NULL,
  lokasi      text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX kegiatan_tanggal_idx ON kegiatan (tanggal);
CREATE TRIGGER kegiatan_updated_at BEFORE UPDATE ON kegiatan
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Pengajuan surat pengantar (form di halaman Administrasi)
-- ---------------------------------------------------------------------------
CREATE TABLE surat_pengantar (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warga_id    uuid         NOT NULL REFERENCES warga (id) ON DELETE RESTRICT,
  keperluan   text         NOT NULL CHECK (btrim(keperluan) <> ''),
  status      status_surat NOT NULL DEFAULT 'menunggu',
  catatan     text,                                    -- diisi pengurus, mis. alasan ditolak
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX surat_pengantar_status_idx ON surat_pengantar (status, created_at);
CREATE INDEX surat_pengantar_warga_idx ON surat_pengantar (warga_id);
CREATE TRIGGER surat_pengantar_updated_at BEFORE UPDATE ON surat_pengantar
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
