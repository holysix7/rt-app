// Koneksi PostgreSQL (driver postgres.js). Hanya untuk kode server:
// Server Component, Route Handler, Server Action.
import postgres from "postgres";

declare global {
  // Disimpan di globalThis supaya hot reload saat `next dev` tidak membuat pool baru terus.
  var __rtSql: postgres.Sql | undefined;
}

function buatKoneksi() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL belum diisi. Salin .env.example ke .env.local lalu isi DATABASE_URL.");
  }
  return postgres(url, {
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idle_timeout: 20,
    // Pooler mode transaksi (mis. Supabase port 6543, PgBouncer) tidak mendukung prepared statement.
    prepare: process.env.DATABASE_PREPARE !== "false",
    // current_date di database mengikuti waktu Indonesia, bukan UTC.
    connection: { TimeZone: "Asia/Jakarta" },
    onnotice: () => {},
  });
}

export function db() {
  globalThis.__rtSql ??= buatKoneksi();
  return globalThis.__rtSql;
}
