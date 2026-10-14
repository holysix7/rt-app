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
Butuh Node.js 18.18 atau lebih baru.

```bash
npm install
cp .env.example .env.local   # opsional, untuk notifikasi WA
npm run dev                  # buka http://localhost:3000
```

Untuk mencoba PWA (service worker hanya aktif di mode produksi):

```bash
npm run build && npm start
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
lib/data.ts           data contoh + fungsi akses data
lib/whatsapp.ts       pengirim WA (Fonnte, bisa diganti)
public/sw.js          service worker
public/icons/         ikon aplikasi
```

## Notifikasi WhatsApp
Tanpa token, pesan cuma dicetak di terminal (mode uji). Untuk kirim sungguhan, daftar di gateway WA (contoh Fonnte), isi `WA_API_TOKEN` di `.env.local`. Mau pakai WhatsApp Cloud API resmi dari Meta? Cukup ubah isi `kirimWA()` di `lib/whatsapp.ts`.

## Langkah berikutnya
1. **Database**: ganti isi fungsi di `lib/data.ts` dengan query Supabase (data contoh hilang setiap server restart).
2. **Login & peran**: tambahkan login (misalnya Supabase Auth via OTP nomor HP) dan batasi daftar KK serta tombol "Tandai lunas" hanya untuk pengurus. Bagian ini ditandai `TODO` di kode.
3. **Deploy**: push ke GitHub lalu import di Vercel. HTTPS otomatis, syarat wajib PWA.
4. **Ikon**: ganti `public/icons/*.png` dengan logo RT.
