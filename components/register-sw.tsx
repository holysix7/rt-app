"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      // biome-ignore lint/suspicious/noConsole: revisit later
      navigator.serviceWorker.register("/sw.js").catch((e) => console.error("SW gagal:", e));
    }
  }, []);
  return null;
}
