import type { MetadataRoute } from "next";
import { RT } from "@/lib/shared";

// Next.js otomatis menyajikan file ini di /manifest.webmanifest
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `Web App ${RT.nama}`,
    short_name: RT.nama,
    description: "Administrasi, kas, dan info warga dalam satu aplikasi.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6f2",
    theme_color: "#0f6e56",
    lang: "id",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
