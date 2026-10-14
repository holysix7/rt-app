// Alat database sederhana tanpa ORM.
//
//   pnpm db:migrate            jalankan migration yang belum diterapkan
//   pnpm db:status             lihat migration mana yang sudah/belum jalan
//   pnpm db:seed               isi data contoh (db/seed.sql)
//   pnpm db:new <nama>         buat file migration baru kosong
//
// Migration = file .sql di db/migrations, dijalankan urut nama file,
// masing-masing di dalam satu transaksi. Riwayatnya disimpan di tabel
// schema_migrations. Jangan ubah file migration yang sudah jalan di
// production — buat file baru untuk perubahan berikutnya.

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";

const ROOT = path.resolve(import.meta.dirname, "..");
const MIGRATIONS_DIR = path.join(ROOT, "db", "migrations");
const SEED_FILE = path.join(ROOT, "db", "seed.sql");
const LOCK_ID = 7_052_026; // kunci advisory agar dua proses migrate tidak jalan bersamaan

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(path.join(ROOT, file));
  } catch {
    // file tidak ada, lewati
  }
}

const [perintah = "migrate", ...args] = process.argv.slice(2);

if (perintah === "new") {
  await buatMigration(args.join("_"));
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL belum diisi. Salin .env.example ke .env.local lalu isi DATABASE_URL.");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} });

try {
  if (perintah === "migrate") await migrate();
  else if (perintah === "status") await status();
  else if (perintah === "seed") await seed();
  else {
    console.error(`Perintah tidak dikenal: ${perintah}`);
    process.exitCode = 1;
  }
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await sql.end();
}

async function siapkanTabelRiwayat() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      nama        text PRIMARY KEY,
      dijalankan  timestamptz NOT NULL DEFAULT now()
    )
  `;
}

async function daftarFile() {
  const files = await readdir(MIGRATIONS_DIR);
  return files.filter((f) => f.endsWith(".sql")).sort();
}

async function sudahJalan() {
  const rows = await sql`SELECT nama FROM schema_migrations`;
  return new Set(rows.map((r) => r.nama));
}

async function migrate() {
  await sql`SELECT pg_advisory_lock(${LOCK_ID})`;
  try {
    await siapkanTabelRiwayat();
    const selesai = await sudahJalan();
    const antrean = (await daftarFile()).filter((f) => !selesai.has(f));

    if (antrean.length === 0) {
      console.log("Database sudah versi terbaru.");
      return;
    }

    for (const file of antrean) {
      const isi = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
      process.stdout.write(`→ ${file} ... `);
      await sql.begin(async (tx) => {
        await tx.unsafe(isi);
        await tx`INSERT INTO schema_migrations (nama) VALUES (${file})`;
      });
      console.log("ok");
    }
    console.log(`${antrean.length} migration diterapkan.`);
  } finally {
    await sql`SELECT pg_advisory_unlock(${LOCK_ID})`;
  }
}

async function status() {
  await siapkanTabelRiwayat();
  const selesai = await sudahJalan();
  for (const file of await daftarFile()) {
    console.log(`${selesai.has(file) ? "[x]" : "[ ]"} ${file}`);
  }
}

async function seed() {
  const isi = await readFile(SEED_FILE, "utf8");
  await sql.begin((tx) => tx.unsafe(isi));
  console.log("Data contoh dimasukkan.");
}

async function buatMigration(nama) {
  const slug = nama
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  if (!slug) {
    console.error("Beri nama migration, contoh: pnpm db:new tambah_kolom_rt");
    process.exit(1);
  }
  const files = await daftarFile();
  const terakhir = files.length ? Number.parseInt(files[files.length - 1], 10) : 0;
  const nomor = String(terakhir + 1).padStart(4, "0");
  const file = `${nomor}_${slug}.sql`;
  await writeFile(path.join(MIGRATIONS_DIR, file), `-- ${file}\n\n`);
  console.log(`Dibuat: db/migrations/${file}`);
}
