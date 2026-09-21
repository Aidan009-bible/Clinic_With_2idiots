"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Medicine, PrescriptionItem, Visit } from "@/lib/types";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export function DoctorWaitingQueue({ visits }: { visits: Visit[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-sm font-medium text-slate-500">Today&apos;s waiting list</p>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          {visits.length} patient{visits.length === 1 ? "" : "s"} waiting
        </h3>
      </div>
      <div className="divide-y divide-slate-200">
        {visits.map((visit, index) => (
          <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center" key={visit.id}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-800">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-slate-950">{visit.patientName}</p>
              <p className="mt-1 text-sm text-slate-500">
                {visit.patientCode} • {formatDateTime(visit.createdAt)}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {visit.symptoms.join(", ") || "No symptoms recorded"}
              </p>
            </div>
            <button
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              disabled={loadingId !== null}
              onClick={async () => {
                setError("");
                setLoadingId(visit.id);
                try {
                  const response = await fetch(`/api/visits/${visit.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "start-consultation" }),
                  });
                  const result = (await response.json()) as { error?: string };

                  if (!response.ok) {
                    throw new Error(result.error ?? "Failed to open consultation.");
                  }

                  router.push(`/doctor/queue/${visit.id}`);
                } catch (submitError) {
                  setError(submitError instanceof Error ? submitError.message : "Failed to open consultation.");
                  setLoadingId(null);
                }
              }}
              type="button"
            >
              {loadingId === visit.id ? "Opening..." : "Next"}
            </button>
          </div>
        ))}
        {!visits.length ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">No patients are waiting.</p>
        ) : null}
      </div>

      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
    </section>
  );
}

export function DoctorConsultation({
  visit,
  medicines,
  history,
}: {
  visit: Visit;
  medicines: Medicine[];
  history: Visit[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  return (
    <div className="grid gap-4">
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      <DoctorVisitCard
        history={history}
        medicines={medicines}
        onError={setError}
        router={router}
        visit={visit}
      />
    </div>
  );
}

type DraftPrescriptionItem = {
  medicineId: string;
  dosage: string;
  quantity: number;
};

function buildDraftPrescription(items: PrescriptionItem[]): DraftPrescriptionItem[] {
  if (!items.length) {
    return [{ medicineId: "", dosage: "", quantity: 1 }];
  }

  return items.map((item) => ({
    medicineId: item.medicineId,
    dosage: item.dosage,
    quantity: item.quantity,
  }));
}

function DoctorVisitCard({
  visit,
  medicines,
  history,
  router,
  onError,
}: {
  visit: Visit;
  medicines: Medicine[];
  history: Visit[];
  router: ReturnType<typeof useRouter>;
  onError: (value: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState<DraftPrescriptionItem[]>(
    buildDraftPrescription(visit.prescription),
  );

  const selectedPrescription = prescriptionItems
    .map((item) => {
      const medicine = medicines.find((entry) => entry.id === item.medicineId);

      if (!medicine || item.quantity <= 0) {
        return null;
      }

      return {
        medicine,
        quantity: item.quantity,
        dosage: item.dosage,
        lineTotal: medicine.salePrice * item.quantity,
      };
    })
    .filter(
      (
        item,
      ): item is {
        medicine: Medicine;
        quantity: number;
        dosage: string;
        lineTotal: number;
      } => Boolean(item),
    );

  const medicineTotal = selectedPrescription.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <form
      className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        onError("");
        setLocalError("");
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const diagnosis = String(formData.get("diagnosis") ?? "").trim();
        const consultationFee = Number(formData.get("consultationFee") ?? 0);

        if (!diagnosis) {
          setLocalError("Please enter the diagnosis before saving.");
          setLoading(false);
          return;
        }

        if (!Number.isFinite(consultationFee) || consultationFee < 0) {
          setLocalError("Please enter a valid consultation fee.");
          setLoading(false);
          return;
        }

        try {
          const response = await fetch(`/api/visits/${visit.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "doctor-update",
              diagnosis,
              notes: String(formData.get("notes") ?? ""),
              consultationFee,
              prescriptionItems,
            }),
          });

          const result = (await response.json()) as { error?: string };

          if (!response.ok) {
            throw new Error(result.error ?? "Failed to update visit.");
          }

          router.push("/doctor/history");
          router.refresh();
        } catch (submitError) {
          onError(submitError instanceof Error ? submitError.message : "Failed to update visit.");
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-slate-950">{visit.patientName}</p>
              <p className="text-sm text-slate-500">
                {visit.patientCode} • {formatDateTime(visit.createdAt)}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-2 text-xs font-semibold ${
                visit.status === "Ready for Billing"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-sky-100 text-sky-800"
              }`}
            >
              {visit.status}
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Symptoms: {visit.symptoms.join(", ")}
          </p>
          <div className="mt-4 grid gap-3">
            <textarea
              className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              defaultValue={visit.diagnosis}
              name="diagnosis"
              placeholder="Diagnosis"
            />
            <textarea
              className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              defaultValue={visit.notes}
              name="notes"
              placeholder="Consultation notes"
            />
            <input
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              defaultValue={visit.consultationFee}
              min="0"
              name="consultationFee"
              placeholder="Consultation fee MMK"
              type="number"
            />
          </div>

          <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Prescription</p>
                <h4 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  Select medicine from current stock
                </h4>
              </div>
              <button
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={() =>
                  setPrescriptionItems((current) => [
                    ...current,
                    { medicineId: "", dosage: "", quantity: 1 },
                  ])
                }
                type="button"
              >
                Add medicine
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {prescriptionItems.map((item, index) => {
                const selectedMedicine = medicines.find(
                  (medicine) => medicine.id === item.medicineId,
                );

                return (
                  <div
                    key={`${visit.id}-medicine-${index}`}
                    className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_140px_auto]"
                  >
                    <select
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      onChange={(event) =>
                        setPrescriptionItems((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === index
                              ? { ...entry, medicineId: event.target.value }
                              : entry,
                          ),
                        )
                      }
                      value={item.medicineId}
                    >
                      <option value="">Choose medicine</option>
                      {medicines.map((medicine) => (
                        <option key={medicine.id} value={medicine.id}>
                          {medicine.name} ({medicine.stock} {medicine.unit})
                        </option>
                      ))}
                    </select>
                    <input
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      onChange={(event) =>
                        setPrescriptionItems((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === index
                              ? { ...entry, dosage: event.target.value }
                              : entry,
                          ),
                        )
                      }
                      placeholder="Dosage, e.g. 1 tab after meal"
                      value={item.dosage}
                    />
                    <input
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      min="1"
                      onChange={(event) =>
                        setPrescriptionItems((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === index
                              ? {
                                  ...entry,
                                  quantity: Math.max(1, Number(event.target.value) || 1),
                                }
                              : entry,
                          ),
                        )
                      }
                      type="number"
                      value={item.quantity}
                    />
                    <button
                      className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700"
                      onClick={() =>
                        setPrescriptionItems((current) =>
                          current.length === 1
                            ? [{ medicineId: "", dosage: "", quantity: 1 }]
                            : current.filter((_, entryIndex) => entryIndex !== index),
                        )
                      }
                      type="button"
                    >
                      Remove
                    </button>
                    {selectedMedicine ? (
                      <p className="text-sm text-slate-500 md:col-span-4">
                        {selectedMedicine.salePrice.toLocaleString()} MMK each • stock{" "}
                        {selectedMedicine.stock} {selectedMedicine.unit} • line total{" "}
                        {(selectedMedicine.salePrice * item.quantity).toLocaleString()} MMK
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-500">Medicine summary</p>
              <div className="mt-3 grid gap-2">
                {selectedPrescription.map((item, index) => (
                  <div
                    key={`${visit.id}-summary-${item.medicine.id}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-700"
                  >
                    <span>
                      {item.medicine.name} • {item.quantity} {item.medicine.unit}
                      {item.dosage ? ` • ${item.dosage}` : ""}
                    </span>
                    <span>{item.lineTotal.toLocaleString()} MMK</span>
                  </div>
                ))}
                {!selectedPrescription.length ? (
                  <p className="text-sm text-slate-500">
                    No medicine selected yet. Reception will only see items added here.
                  </p>
                ) : null}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-sm font-semibold text-slate-950">
                <span>Medicine total</span>
                <span>{medicineTotal.toLocaleString()} MMK</span>
              </div>
            </div>
          </div>

          <button
            className="mt-4 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Saving..." : "Done and send to billing"}
          </button>
          <p className="mt-2 text-sm text-slate-500">
            Saving here updates the patient and moves the visit to billing automatically.
          </p>
          {localError ? (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {localError}
            </p>
          ) : null}
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Patient history</p>
          <h4 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Previous visits with fee
          </h4>
          <div className="mt-4 grid gap-3">
            {history
              .filter((entry) => entry.id !== visit.id)
              .slice(0, 5)
              .map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    {formatDateTime(entry.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {entry.diagnosis || "No diagnosis yet"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Fee {entry.consultationFee.toLocaleString()} MMK • Medicine{" "}
                    {entry.medicineCharge.toLocaleString()} MMK
                  </p>
                </div>
              ))}
            {history.filter((entry) => entry.id !== visit.id).length === 0 ? (
              <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500">
                No previous history for this patient yet.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}
