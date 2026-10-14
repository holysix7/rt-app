"use client";

import { useMutation, useMutationState, useQueryClient } from "@tanstack/react-query";
import { api, queryKeys } from "@/lib/query";
import { type Keuangan, RT } from "@/lib/shared/shared";

export default function IuranButton({ wargaId, bulan }: { wargaId: string; bulan: string }) {
  const queryClient = useQueryClient();
  const key = queryKeys.keuangan(bulan);
  const mutationKey = ["catat-iuran", bulan, wargaId];

  const catat = useMutation({
    mutationKey,
    mutationFn: () => api.catatIuran({ wargaId, bulan }),

    // Optimistic update: langsung tampilkan "Lunas" sebelum server menjawab,
    // supaya terasa cepat walau sinyal lemah.
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const sebelumnya = queryClient.getQueryData<Keuangan>(key);
      queryClient.setQueryData<Keuangan>(key, (lama) =>
        lama
          ? {
              ...lama,
              iuran: [...lama.iuran, { wargaId, bulan, jumlah: RT.iuranBulanan, tanggal: new Date().toISOString() }],
            }
          : lama,
      );
      return { sebelumnya };
    },

    // Gagal: kembalikan tampilan seperti semula.
    onError: (_error, _vars, hasilOnMutate) => {
      if (hasilOnMutate?.sebelumnya) queryClient.setQueryData(key, hasilOnMutate.sebelumnya);
    },

    // Berhasil atau gagal: ambil ulang data asli dari server (saldo & riwayat ikut ter-update).
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  // Karena optimistic update, tombol ini sempat hilang (baris jadi "Lunas") lalu
  // muncul lagi kalau gagal, sehingga state `catat` di atas sudah baru/kosong.
  // Pesan error diambil dari mutation cache: percobaan terakhir untuk warga ini.
  const errorTerakhir = useMutationState({
    filters: { mutationKey, exact: true },
    select: (m) => m.state.error?.message ?? null,
  }).at(-1);

  return (
    <div className="aksi">
      <button type="button" className="btn btn-kecil" onClick={() => catat.mutate()} disabled={catat.isPending}>
        {catat.isPending ? "Menyimpan..." : "Tandai lunas"}
      </button>
      {!catat.isPending && errorTerakhir && <small className="error">{errorTerakhir}</small>}
    </div>
  );
}
