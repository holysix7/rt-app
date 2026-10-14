-- Data contoh (sama dengan data mock lama). Aman dijalankan berulang kali.
-- Jalankan: pnpm db:seed

INSERT INTO warga (id, nama, blok, no_hp, status, jiwa) VALUES
  ('00000000-0000-4000-8000-000000000001', 'Budi Santoso', 'A-01', '6281200000001', 'pemilik', 4),
  ('00000000-0000-4000-8000-000000000002', 'Siti Aminah',  'A-02', '6281200000002', 'kontrak', 3),
  ('00000000-0000-4000-8000-000000000003', 'Agus Pratama', 'B-05', '6281200000003', 'pemilik', 5),
  ('00000000-0000-4000-8000-000000000004', 'Dewi Lestari', 'B-07', '6281200000004', 'pemilik', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO kas_transaksi (id, tanggal, keterangan, jenis, jumlah) VALUES
  ('00000000-0000-4000-8000-0000000000a1', '2026-10-01', 'Saldo awal Oktober',  'masuk',  2350000),
  ('00000000-0000-4000-8000-0000000000a2', '2026-10-02', 'Iuran A-01',          'masuk',  50000),
  ('00000000-0000-4000-8000-0000000000a3', '2026-10-05', 'Iuran B-05',          'masuk',  50000),
  ('00000000-0000-4000-8000-0000000000a4', '2026-10-08', 'Gaji petugas sampah', 'keluar', 400000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO iuran (warga_id, bulan, jumlah, tanggal, transaksi_id) VALUES
  ('00000000-0000-4000-8000-000000000001', '2026-10-01', 50000, '2026-10-02', '00000000-0000-4000-8000-0000000000a2'),
  ('00000000-0000-4000-8000-000000000003', '2026-10-01', 50000, '2026-10-05', '00000000-0000-4000-8000-0000000000a3')
ON CONFLICT (warga_id, bulan) DO NOTHING;

INSERT INTO umkm (id, nama, pemilik, warga_id, kategori, no_hp) VALUES
  ('00000000-0000-4000-8000-0000000000b1', 'Katering Bu Siti', 'Siti Aminah',  '00000000-0000-4000-8000-000000000002', 'Makanan', '6281200000002'),
  ('00000000-0000-4000-8000-0000000000b2', 'Laundry Kilat',    'Dewi Lestari', '00000000-0000-4000-8000-000000000004', 'Jasa',    '6281200000004')
ON CONFLICT (id) DO NOTHING;

INSERT INTO kegiatan (id, judul, tanggal, lokasi) VALUES
  ('00000000-0000-4000-8000-0000000000c1', 'Kerja bakti bersih selokan', '2026-10-18', 'Seluruh blok'),
  ('00000000-0000-4000-8000-0000000000c2', 'Posyandu balita',            '2026-10-22', 'Pos RT')
ON CONFLICT (id) DO NOTHING;
