"use client";

import { type AnyFieldApi, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/query";
import type { Warga } from "@/lib/shared";

const MAKS_KEPERLUAN = 200;

// Pesan error per field, muncul setelah field disentuh atau form dikirim.
function ErrorField({ field }: { field: AnyFieldApi }) {
  const { isTouched, isValid, errors } = field.state.meta;
  if (!isTouched || isValid) return null;
  return (
    <small id={`${field.name}-error`} className="error">
      {errors.join(", ")}
    </small>
  );
}

export default function SuratForm({ warga }: { warga: Array<Pick<Warga, "id" | "nama" | "blok">> }) {
  // TanStack Query: urusan kirim ke server (loading, sukses, gagal).
  const ajukan = useMutation({ mutationFn: api.ajukanSurat });

  // TanStack Form: urusan isian & validasi di browser.
  const form = useForm({
    defaultValues: { wargaId: "", keperluan: "" },
    onSubmit: async ({ value, formApi }) => {
      try {
        await ajukan.mutateAsync({ wargaId: value.wargaId, keperluan: value.keperluan.trim() });
      } catch {
        return; // pesan error dari server ditampilkan lewat state `ajukan`
      }
      // Kosongkan keperluan; nama warga tetap terpilih kalau mau mengajukan lagi.
      formApi.reset({ ...value, keperluan: "" }, { keepDefaultValues: true });
    },
    listeners: {
      // Mengubah isian menghapus pesan sukses/gagal dari pengiriman sebelumnya.
      onChange: () => {
        if (!ajukan.isPending) ajukan.reset();
      },
    },
  });

  return (
    <form
      className="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="wargaId"
        validators={{
          onChange: ({ value }) => (value ? undefined : "Pilih nama warga"),
        }}
      >
        {(field) => (
          <label>
            Nama warga
            <select
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
              aria-describedby={`${field.name}-error`}
            >
              <option value="">Pilih nama</option>
              {warga.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nama} ({w.blok})
                </option>
              ))}
            </select>
            <ErrorField field={field} />
          </label>
        )}
      </form.Field>

      <form.Field
        name="keperluan"
        validators={{
          onChange: ({ value }) => {
            if (!value.trim()) return "Isi keperluan surat";
            if (value.trim().length > MAKS_KEPERLUAN) return `Maksimal ${MAKS_KEPERLUAN} karakter`;
            return undefined;
          },
        }}
      >
        {(field) => (
          <label>
            Keperluan
            <input
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Contoh: pembuatan KTP"
              maxLength={MAKS_KEPERLUAN}
              aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
              aria-describedby={`${field.name}-error`}
            />
            <ErrorField field={field} />
          </label>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? "Mengirim..." : "Ajukan surat"}
          </button>
        )}
      </form.Subscribe>

      {ajukan.isError && <p className="error">{ajukan.error.message}</p>}
      {ajukan.isSuccess && <p className="sukses">Pengajuan terkirim. Notifikasi WA dikirim ke Ketua RT.</p>}
    </form>
  );
}
