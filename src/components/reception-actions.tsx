"use client";

import { useRouter } from "next/navigation";
import { useDeferredValue, useState } from "react";

import { MedicineStockTable } from "@/components/medicine-stock-table";
import type { Medicine, Patient, Visit } from "@/lib/types";

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

export function ReceptionPatientForm({ patients }: { patients: Patient[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [patientType, setPatientType] = useState<"old" | "new">("old");
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const deferredPatientQuery = useDeferredValue(patientQuery);
  const normalizedPatientQuery = deferredPatientQuery.trim().toLowerCase();
  const filteredPatients = patients.filter((patient) =>
    `${patient.patientCode} ${patient.name} ${patient.phone}`
      .toLowerCase()
      .includes(normalizedPatientQuery),
  );

  return (
    <form
      className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        const form = event.currentTarget;
        const formData = new FormData(form);

        try {
          let patientId = String(formData.get("patientId") ?? "");

          if (patientType === "old" && !patientId) {
            throw new Error("Please select an existing patient.");
          }

          if (patientType === "new") {
            const patientResponse = await fetch("/api/patients", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: String(formData.get("name") ?? ""),
                age: Number(formData.get("age") ?? 0),
                phone: String(formData.get("phone") ?? ""),
                tags: "",
              }),
            });
            const patientResult = (await patientResponse.json()) as {
              error?: string;
              patient?: Patient;
            };

            if (!patientResponse.ok || !patientResult.patient) {
              throw new Error(patientResult.error ?? "Failed to create patient.");
            }

            patientId = patientResult.patient.id;
          }

          const visitResponse = await fetch("/api/visits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              patientId,
              symptoms: String(formData.get("symptoms") ?? ""),
            }),
          });
          const visitResult = (await visitResponse.json()) as { error?: string };

          if (!visitResponse.ok) {
            throw new Error(visitResult.error ?? "Failed to add patient to the queue.");
          }

          form.reset();
          router.push("/reception/queue");
          router.refresh();
        } catch (submitError) {
          setError(submitError instanceof Error ? submitError.message : "Failed to create patient.");
        } finally {
          setLoading(false);
        }
      }}
    >
      <p className="text-sm font-medium text-slate-500">Patient check-in</p>
      <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
        Add patient to today&apos;s queue
      </h3>
      <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
        {(["old", "new"] as const).map((type) => (
          <button
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              patientType === type ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
            }`}
            key={type}
            onClick={() => setPatientType(type)}
            type="button"
          >
            {type === "old" ? "Old patient" : "New patient"}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-3">
        {patientType === "old" ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <input name="patientId" type="hidden" value={selectedPatientId} />
            <div className="border-b border-slate-200 bg-slate-50 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500" htmlFor="existing-patient-search">
                Choose existing patient
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                id="existing-patient-search"
                onChange={(event) => setPatientQuery(event.target.value)}
                placeholder="Search name, patient ID, or phone"
                type="search"
                value={patientQuery}
              />
              <p className="mt-2 text-xs text-slate-500">
                {filteredPatients.length} patient{filteredPatients.length === 1 ? "" : "s"} found
              </p>
            </div>
            <div className="max-h-80 overflow-auto">
              <table className="w-full min-w-[620px] border-collapse text-left">
                <thead className="sticky top-0 bg-white text-xs uppercase tracking-[0.1em] text-slate-500 shadow-[0_1px_0_0_#e2e8f0]">
                  <tr>
                    <th className="w-14 px-4 py-3 font-semibold">Pick</th>
                    <th className="px-4 py-3 font-semibold">Patient</th>
                    <th className="px-4 py-3 font-semibold">Age</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Last visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPatients.map((patient) => {
                    const selected = selectedPatientId === patient.id;

                    return (
                      <tr
                        className={`cursor-pointer transition ${selected ? "bg-sky-100" : "hover:bg-sky-50"}`}
                        key={patient.id}
                        onClick={() => setSelectedPatientId(patient.id)}
                      >
                        <td className="px-4 py-3">
                          <input
                            aria-label={`Select ${patient.name}`}
                            checked={selected}
                            name="patient-choice"
                            onChange={() => setSelectedPatientId(patient.id)}
                            type="radio"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-950">{patient.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{patient.patientCode}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{patient.age}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{patient.phone}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDateTime(patient.lastVisitAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!filteredPatients.length ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500">
                  No patient matches “{patientQuery}”.
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" name="name" placeholder="Patient name" required />
            <div className="grid gap-3 md:grid-cols-2">
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" min="1" name="age" placeholder="Age" required type="number" />
              <input className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" name="phone" placeholder="Phone number" required />
            </div>
          </>
        )}
        <textarea className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 text-sm" name="symptoms" placeholder="Symptoms or reason for visit (optional)" />
      </div>
      <button className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={loading} type="submit">
        {loading ? "Adding to queue..." : "Add to waiting queue"}
      </button>
      {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}

export function ReceptionVisitForm({ patients }: { patients: Patient[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        const form = event.currentTarget;
        const formData = new FormData(form);

        try {
          const response = await fetch("/api/visits", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              patientId: String(formData.get("patientId") ?? ""),
              symptoms: String(formData.get("symptoms") ?? ""),
            }),
          });

          const result = (await response.json()) as { error?: string };

          if (!response.ok) {
            throw new Error(result.error ?? "Failed to create visit.");
          }

          form.reset();
          router.refresh();
        } catch (submitError) {
          setError(submitError instanceof Error ? submitError.message : "Failed to create visit.");
        } finally {
          setLoading(false);
        }
      }}
    >
      <p className="text-sm font-medium text-slate-500">Old patient new date</p>
      <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
        Open today&apos;s visit
      </h3>
      <div className="mt-5 grid gap-3">
        <select className="rounded-2xl border border-slate-300 px-4 py-3 text-sm" name="patientId" required>
          <option value="">Choose patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.patientCode} - {patient.name}
            </option>
          ))}
        </select>
        <textarea className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 text-sm" name="symptoms" placeholder="Symptoms separated by comma (optional)" />
      </div>
      <button className="mt-4 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={loading} type="submit">
        {loading ? "Creating..." : "Create visit"}
      </button>
      {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
    </form>
  );
}

export function ReceptionBilling({
  visits,
}: {
  visits: Visit[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  return (
    <div className="grid gap-4">
      {visits.map((visit) => (
        <div key={visit.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Bill slip</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                {visit.patientName}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {visit.patientCode} • {formatDateTime(visit.createdAt)}
              </p>
            </div>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-900">
              {visit.status}
            </span>
          </div>

          <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Consultation fee</p>
            <p className="mt-1 text-sm text-slate-600">{visit.consultationFee.toLocaleString()} MMK</p>
            <p className="mt-4 text-sm font-semibold text-slate-900">Medicines</p>
            <div className="mt-2 grid gap-2">
              {visit.prescription.map((item) => (
                <div key={`${visit.id}-${item.medicineId}`} className="flex items-center justify-between gap-3 text-sm text-slate-600">
                  <span>{item.medicineName} • {item.quantity} • {item.dosage}</span>
                  <span>{item.lineTotal.toLocaleString()} MMK</span>
                </div>
              ))}
              {!visit.prescription.length ? <p className="text-sm text-slate-500">No medicines.</p> : null}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-base font-semibold text-slate-950">Total</span>
              <span className="text-base font-semibold text-slate-950">{visit.totalCharge.toLocaleString()} MMK</span>
            </div>
          </div>

          <button
            className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={loadingId === visit.id}
            onClick={async () => {
              setError("");
              setLoadingId(visit.id);
              try {
                const response = await fetch(`/api/visits/${visit.id}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    action: "issue-bill",
                  }),
                });
                const result = (await response.json()) as { error?: string };

                if (!response.ok) {
                  throw new Error(result.error ?? "Failed to issue bill.");
                }

                router.refresh();
              } catch (submitError) {
                setError(submitError instanceof Error ? submitError.message : "Failed to issue bill.");
              } finally {
                setLoadingId(null);
              }
            }}
            type="button"
          >
            {loadingId === visit.id ? "Processing..." : "Issue slip and reduce stock"}
          </button>
        </div>
      ))}
      {!visits.length ? (
        <p className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm shadow-slate-200/60">
          No visits are ready for billing right now.
        </p>
      ) : null}
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}

export function ReceptionStock({ medicines }: { medicines: Medicine[] }) {
  return (
    <MedicineStockTable
      description="Reception can check available stock before issuing bills and handing out medicine."
      medicines={medicines}
      title="Current counter stock"
    />
  );
}
