import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import KeuanganView from "@/components/keuangan-view";
import { bulanIni, getKeuangan } from "@/lib/data";
import { getQueryClient, queryKeys } from "@/lib/query";

export const dynamic = "force-dynamic";

// Server Component: ambil data langsung dari database (tanpa lewat API),
// lalu titipkan ke cache TanStack Query di browser lewat HydrationBoundary.
// Hasilnya: halaman langsung tampil berisi data, dan setelah itu client bisa
// refetch / update sendiri tanpa reload halaman.
export default async function Keuangan() {
  const bulan = bulanIni();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.keuangan(bulan),
    queryFn: () => getKeuangan(bulan),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <KeuanganView bulan={bulan} />
    </HydrationBoundary>
  );
}
