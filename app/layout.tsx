import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/bottom-nav";
import Providers from "@/components/providers";
import RegisterSW from "@/components/register-sw";
import { RT } from "@/lib/shared/shared";

export const metadata: Metadata = {
  title: `Web App ${RT.nama}`,
  description: "Administrasi, kas, dan info warga dalam satu aplikasi.",
  appleWebApp: { capable: true, title: RT.nama, statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0f6e56",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <header className="topbar">
          <strong>{RT.nama}</strong>
          <span>
            {RT.rw} · {RT.kelurahan}
          </span>
        </header>
        <main className="konten">
          <Providers>{children}</Providers>
        </main>
        <BottomNav />
        <RegisterSW />
      </body>
    </html>
  );
}
