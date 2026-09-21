"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { Medicine } from "@/lib/types";

type MedicineDraft = {
  name: string;
  stock: string;
  unit: string;
  expiry: string;
  salePrice: string;
  photoDataUrl: string | null;
};

function buildDraft(medicine: Medicine): MedicineDraft {
  return {
    name: medicine.name,
    stock: String(medicine.stock),
    unit: medicine.unit,
    expiry: medicine.expiry,
    salePrice: String(medicine.salePrice),
    photoDataUrl: medicine.photoDataUrl,
  };
}

function formatMoney(value: number) {
  return `${value.toLocaleString()} MMK`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });
}

export function MedicineStockTable({
  medicines,
  editable = false,
  title,
  description,
  initialLowStockOnly = false,
}: {
  medicines: Medicine[];
  editable?: boolean;
  title: string;
  description: string;
  initialLowStockOnly?: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MedicineDraft | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(initialLowStockOnly);
  const [error, setError] = useState("");

  const filteredMedicines = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return medicines.filter((medicine) => {
      if (lowStockOnly && !medicine.lowStock) {
        return false;
      }

      return (
        !normalizedQuery ||
        `${medicine.name} ${medicine.unit} ${medicine.expiry}`
          .toLowerCase()
          .includes(normalizedQuery)
      );
    });
  }, [lowStockOnly, medicines, query]);

  async function saveMedicine(medicineId: string) {
    if (!draft) {
      return;
    }

    setError("");
    setLoadingId(medicineId);

    try {
      const response = await fetch(`/api/medicines/${medicineId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          stock: Number(draft.stock),
          unit: draft.unit,
          expiry: draft.expiry,
          salePrice: Number(draft.salePrice),
          photoDataUrl: draft.photoDataUrl,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to update medicine.");
      }

      setEditingId(null);
      setDraft(null);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to update medicine.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function removeMedicine(medicineId: string) {
    setError("");
    setLoadingId(medicineId);

    try {
      const response = await fetch(`/api/medicines/${medicineId}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to delete medicine.");
      }

      if (editingId === medicineId) {
        setEditingId(null);
        setDraft(null);
      }

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to delete medicine.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Medicine stock</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="w-full max-w-sm">
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Search medicine
          </label>
          <input
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or unit"
            value={query}
          />
          <button
            className={`mt-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              lowStockOnly
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-slate-300 bg-white text-slate-600"
            }`}
            onClick={() => setLowStockOnly((current) => !current)}
            type="button"
          >
            {lowStockOnly ? "Showing low stock only" : "Filter low stock"}
          </button>
        </div>
      </div>

      {editable && editingId && draft ? (
        <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Editing medicine</p>
              <h4 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                {draft.name || "Medicine details"}
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                disabled={loadingId === editingId}
                onClick={() => saveMedicine(editingId)}
                type="button"
              >
                {loadingId === editingId ? "Saving..." : "Save changes"}
              </button>
              <button
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                onClick={() => {
                  setEditingId(null);
                  setDraft(null);
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="h-36 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {draft.photoDataUrl ? (
                  <img
                    alt={draft.name || "Medicine"}
                    className="h-full w-full object-cover"
                    src={draft.photoDataUrl}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    No photo
                  </div>
                )}
              </div>
              <input
                accept="image/*"
                className="mt-4 block w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                onChange={async (event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  try {
                    const dataUrl = await readFileAsDataUrl(file);
                    setDraft((current) =>
                      current ? { ...current, photoDataUrl: dataUrl } : current,
                    );
                  } catch (uploadError) {
                    setError(
                      uploadError instanceof Error
                        ? uploadError.message
                        : "Failed to read image.",
                    );
                  }
                }}
                type="file"
              />
              <button
                className="mt-3 text-xs font-semibold text-rose-700"
                onClick={() =>
                  setDraft((current) =>
                    current ? { ...current, photoDataUrl: null } : current,
                  )
                }
                type="button"
              >
                Remove photo
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Medicine name</span>
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, name: event.target.value } : current,
                    )
                  }
                  value={draft.name}
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Stock</span>
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  min="0"
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, stock: event.target.value } : current,
                    )
                  }
                  type="number"
                  value={draft.stock}
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Unit</span>
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, unit: event.target.value } : current,
                    )
                  }
                  value={draft.unit}
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Price</span>
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  min="0"
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, salePrice: event.target.value } : current,
                    )
                  }
                  type="number"
                  value={draft.salePrice}
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-600 md:col-span-2">
                <span className="font-medium text-slate-700">Expiry</span>
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, expiry: event.target.value } : current,
                    )
                  }
                  type="date"
                  value={draft.expiry}
                />
              </label>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-[20px] border border-slate-200">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-slate-100 text-left text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Photo</th>
              <th className="px-4 py-3 font-semibold">Medicine</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Unit</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Expiry</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              {editable ? <th className="px-4 py-3 font-semibold">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.map((medicine) => {
              const isEditing = editingId === medicine.id && draft;

              return (
                <tr key={medicine.id} className="border-t border-slate-200 align-top text-slate-700">
                  <td className="px-4 py-3">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                      {medicine.photoDataUrl ? (
                        <img
                          alt={medicine.name}
                          className="h-full w-full object-cover"
                          src={medicine.photoDataUrl}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[11px] text-slate-400">
                          No photo
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-950">{medicine.name}</p>
                      <p className="mt-1 text-xs text-slate-500">ID: {medicine.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{medicine.stock.toLocaleString()}</td>
                  <td className="px-4 py-3">{medicine.unit}</td>
                  <td className="px-4 py-3">{formatMoney(medicine.salePrice)}</td>
                  <td className="px-4 py-3">{medicine.expiry}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        medicine.lowStock
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {medicine.lowStock ? "Low" : "OK"}
                    </span>
                  </td>
                  {editable ? (
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                            isEditing
                              ? "bg-slate-200 text-slate-900"
                              : "bg-slate-950 text-white"
                          }`}
                          onClick={() => {
                            setError("");
                            setEditingId(medicine.id);
                            setDraft(buildDraft(medicine));
                          }}
                          type="button"
                        >
                          {isEditing ? "Editing" : "Edit"}
                        </button>
                        <button
                          className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-60"
                          disabled={loadingId === medicine.id}
                          onClick={() => removeMedicine(medicine.id)}
                          type="button"
                        >
                          {loadingId === medicine.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
            {!filteredMedicines.length ? (
              <tr>
                <td
                  className="px-4 py-5 text-sm text-slate-500"
                  colSpan={editable ? 8 : 7}
                >
                  No medicines found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}
    </section>
  );
}
