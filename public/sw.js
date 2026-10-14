// Service worker sederhana: cache halaman utama agar tetap bisa dibuka saat sinyal jelek.
// Naikkan versi ini setiap kali deploy perubahan besar.
const CACHE = "rt-app-v1";
const PRECACHE = ["/", "/administrasi", "/keuangan", "/sosial", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Jangan cache API & request selain GET
  if (req.method !== "GET" || new URL(req.url).pathname.startsWith("/api/")) return;

  // Network-first: ambil data terbaru, fallback ke cache kalau offline
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("/")))
  );
});

// Siap untuk push notification (perlu setup VAPID di server)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "Info RT", body: "" };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
    })
  );
});
