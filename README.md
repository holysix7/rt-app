# Web App RT

Boilerplate Next.js (App Router + TypeScript) untuk web app RT yang responsif di HP dan bisa di-install sebagai PWA.

## Fitur

- **Beranda**: ringkasan saldo kas, status iuran, jumlah KK/jiwa, kegiatan terdekat
- **Administrasi & data**: daftar KK, form pengajuan surat pengantar
- **Keuangan**: status iuran per warga, tombol "Tandai lunas", riwayat kas masuk/keluar
- **Sosial & ekonomi**: katalog UMKM warga (tombol chat WA), jadwal kegiatan
- **Notifikasi WhatsApp otomatis** saat iuran dicatat dan surat diajukan
- **PWA**: manifest, ikon, service worker (bisa dibuka saat sinyal lemah), siap push notification

## Menjalankan

Butuh Node.js 20.12+ dan PostgreSQL 14+.

```bash
pnpm install
cp .env.example .env.local   # isi DATABASE_URL (dan token WA kalau perlu)
docker compose up -d         # opsional: PostgreSQL lokal
pnpm db:migrate              # buat tabel
pnpm db:seed                 # opsional: data contoh
pnpm dev                     # buka http://localhost:3000
```

## Database

Koneksi lewat driver [postgres.js](https://github.com/porsager/postgres) di `lib/db.ts`; semua query ada di `lib/data.ts`.

| Tabel             | Dipakai di                                                     |
| ----------------- | -------------------------------------------------------------- |
| `warga`           | Daftar KK, dropdown surat, status iuran, statistik beranda     |
| `kas_transaksi`   | Saldo, pemasukan/pengeluaran, riwayat transaksi                |
| `iuran`           | Status iuran per bulan (unik per KK per bulan, tertaut ke kas) |
| `umkm`            | Katalog UMKM + tombol Chat WA                                  |
| `kegiatan`        | Kegiatan terdekat & jadwal kegiatan                            |
| `surat_pengantar` | Pengajuan surat (status: menunggu/diproses/selesai/ditolak)    |

Migration berupa file SQL di `db/migrations`, dijalankan urut dan dicatat di tabel `schema_migrations`.

```bash
pnpm db:status               # cek migration yang sudah/belum jalan
pnpm db:new tambah_kolom_x   # buat file migration baru
pnpm db:migrate              # terapkan
```

Jangan mengubah file migration yang sudah dijalankan di production; buat file baru.

Untuk mencoba PWA (service worker hanya aktif di mode produksi):

```bash
pnpm build && pnpm start
```

## Struktur

```
app/
  layout.tsx          header + navigasi bawah + registrasi service worker
  manifest.ts         manifest PWA (nama, warna, ikon)
  page.tsx            beranda
  administrasi/       data warga & surat
  keuangan/           kas & iuran
  sosial/             UMKM & kegiatan
  api/iuran/          catat iuran -> kirim WA
  api/surat/          ajukan surat -> kirim WA
components/           tombol, form, navigasi
lib/db.ts             koneksi PostgreSQL
lib/shared.ts         tipe & helper (aman untuk client)
lib/data.ts           fungsi akses data (query database, khusus server)
lib/query.ts          setup TanStack Query + fungsi fetch API
db/migrations/        migration SQL
db/seed.sql           data contoh
scripts/db.mjs        alat migrate/seed
lib/whatsapp.ts       pengirim WA (Fonnte, bisa diganti)
public/sw.js          service worker
public/icons/         ikon aplikasi
```

## TanStack Query & Form

Query dipakai untuk data yang berubah dari sisi browser (halaman Kas & iuran, form surat).

- `lib/query.ts`: `getQueryClient()`, daftar `queryKeys`, dan fungsi `api.*` untuk fetch ke `/api/*`.
- `components/providers.tsx`: `QueryClientProvider` + Devtools (hanya muncul saat `pnpm dev`).
- `app/keuangan/page.tsx`: prefetch di server lalu `HydrationBoundary`, jadi halaman langsung berisi data.
- `components/keuangan-view.tsx`: `useQuery` membaca cache yang sama; refetch lewat `GET /api/keuangan`.
- `components/iuran-button.tsx`: `useMutation` dengan optimistic update lalu `invalidateQueries`.
- `components/surat-form.tsx`: **TanStack Form** (`useForm`, validasi per field) untuk isian, lalu `useMutation` untuk kirim ke server.

Komponen client cukup import dari `@/lib/shared` dan `@/lib/query`, jangan dari `@/lib/data` (isinya query database).

## Notifikasi WhatsApp

Tanpa token, pesan cuma dicetak di terminal (mode uji). Untuk kirim sungguhan, daftar di gateway WA (contoh Fonnte), isi `WA_API_TOKEN` di `.env.local`. Mau pakai WhatsApp Cloud API resmi dari Meta? Cukup ubah isi `kirimWA()` di `lib/whatsapp.ts`.

## Langkah berikutnya

1. **Login & peran**: tambahkan login (misalnya Supabase Auth via OTP nomor HP) dan batasi daftar KK serta tombol "Tandai lunas" hanya untuk pengurus. Bagian ini ditandai `TODO` di kode.
2. **Deploy**: push ke GitHub lalu import di Vercel. HTTPS otomatis, syarat wajib PWA.
3. **Ikon**: ganti `public/icons/*.png` dengan logo RT.
