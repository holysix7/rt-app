"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { href: "/", label: "Beranda", icon: "⌂" },
  { href: "/administrasi", label: "Warga", icon: "☰" },
  { href: "/keuangan", label: "Kas", icon: "Rp" },
  { href: "/sosial", label: "Sosial", icon: "♥" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bottom-nav">
      {menu.map((m) => {
        const aktif = m.href === "/" ? path === "/" : path.startsWith(m.href);
        return (
          <Link key={m.href} href={m.href} className={aktif ? "aktif" : ""}>
            <span className="nav-icon" aria-hidden>{m.icon}</span>
            <span>{m.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
