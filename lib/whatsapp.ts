// Pengirim notifikasi WhatsApp.
// Default memakai format API Fonnte (gateway WA lokal). Untuk WhatsApp Cloud API
// resmi dari Meta, ganti isi fungsi kirimWA tanpa mengubah pemanggilnya.
//
// Tanpa WA_API_TOKEN, pesan hanya dicetak ke console (mode uji).

export async function kirimWA(target: string, pesan: string) {
  const token = process.env.WA_API_TOKEN;

  if (!token) {
    // biome-ignore lint/suspicious/noConsole: revisit later
    console.log(`[WA mode uji] ke ${target}:\n${pesan}`);
    return { ok: true, uji: true };
  }

  try {
    const res = await fetch(process.env.WA_API_URL || "https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: token },
      body: new URLSearchParams({ target, message: pesan }),
    });
    return { ok: res.ok, uji: false };
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: revisit later
    console.error("Gagal kirim WA:", err);
    return { ok: false, uji: false };
  }
}

export const NO_BENDAHARA = process.env.WA_BENDAHARA || "";
export const NO_KETUA_RT = process.env.WA_KETUA_RT || "";
