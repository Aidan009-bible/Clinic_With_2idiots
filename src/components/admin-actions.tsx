"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MedicineStockTable } from "@/components/medicine-stock-table";
import type { Medicine } from "@/lib/types";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });
}

export function AdminActions({
  medicines,
  initialLowStockOnly = false,
}: {
  medicines: Medicine[];
  initialLowStockOnly?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  async function submitJson(url: string, method: string, body: object) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      throw new Error(result.error ?? "Request failed.");
    }
  }

  return (
    <div className="grid gap-6">
      <section className="max-w-3xl">
        <form
          className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setLoading("manual");
            const form = event.currentTarget;
            const formData = new FormData(form);

            try {
              await submitJson("/api/medicines", "POST", {
                mode: "manual",
                name: String(formData.get("name") ?? ""),
                stock: Number(formData.get("stock") ?? 0),
                unit: String(formData.get("unit") ?? ""),
                expiry: String(formData.get("expiry") ?? ""),
                salePrice: Number(formData.get("salePrice") ?? 0),
                photoDataUrl,
              });
              form.reset();
              setPhotoDataUrl(null);
              router.refresh();
            } catch (submitError) {
              setError(
                submitError instanceof Error ? submitError.message : "Failed to add medicine.",
              );
            } finally {
              setLoading(null);
            }
          }}
        >
          <p className="text-sm font-medium text-slate-500">Create medicine</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Simple stock entry
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add one medicine with photo, stock, price, and expiry.
          </p>

          <div className="mt-5 grid gap-3">
            <input
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              name="name"
              placeholder="Medicine name"
              required
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                min="0"
                name="stock"
                placeholder="Stock quantity"
                required
                type="number"
              />
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                name="unit"
                placeholder="Unit"
                required
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                name="expiry"
                required
                type="date"
              />
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                min="0"
                name="salePrice"
                placeholder="Sale price MMK"
                required
                type="number"
              />
            </div>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <label className="block text-sm font-medium text-slate-700">Medicine photo</label>
              <input
                accept="image/*"
                className="mt-3 block w-full text-sm text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                onChange={async (event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    setPhotoDataUrl(null);
                    return;
                  }

                  try {
                    setPhotoDataUrl(await readFileAsDataUrl(file));
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
              {photoDataUrl ? (
                <div className="mt-4 h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <img
                    alt="Medicine preview"
                    className="h-full w-full object-cover"
                    src={photoDataUrl}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <button
            className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={loading === "manual"}
            type="submit"
          >
            {loading === "manual" ? "Saving..." : "Create medicine"}
          </button>
        </form>

      </section>

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}

      <MedicineStockTable
        description="Edit, delete, search, and review stock in one simple spreadsheet-style table."
        editable
        initialLowStockOnly={initialLowStockOnly}
        medicines={medicines}
        title="Medicine stock list"
      />
    </div>
  );
}
