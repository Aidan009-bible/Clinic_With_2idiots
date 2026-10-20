"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Medicine, PrescriptionItem, Visit } from "@/lib/types";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function getQueueActionLabel(status: Visit["status"]) {
  if (status === "Waiting") {
    return "Start consult";
  }

  if (status === "In Consultation") {
    return "Continue";
  }

  return "Review";
}

function getQueueActionClass(status: Visit["status"]) {
  if (status === "Ready for Billing") {
    return "bg-emerald-600 text-white hover:bg-emerald-700";
  }

  if (status === "In Consultation") {
    return "bg-[#0b2a5b] text-white hover:bg-[#08234c]";
  }

  return "bg-[#0b2a5b] text-white hover:bg-[#08234c]";
}

function getVisitStatusClass(status: Visit["status"]) {
  if (status === "Completed") {
    return "bg-[#f1f5f9] text-[#61758a] ring-1 ring-inset ring-[#d8e4ec]";
  }

  if (status === "Ready for Billing") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "In Consultation") {
    return "bg-[#e7f0ff] text-[#0b2a5b]";
  }

  return "bg-amber-100 text-amber-800";
}

function QueueIcon({ type }: { type: "waiting" | "consulting" | "billing" }) {
  if (type === "waiting") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V12l3 1.8" />
      </svg>
    );
  }

  if (type === "consulting") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 5.5h7A2.5 2.5 0 0 1 18 8v8a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 16V8a2.5 2.5 0 0 1 2.5-2.5Z" />
        <path strokeLinecap="round" d="M9.5 10h5M9.5 13h3" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4.5h10a2 2 0 0 1 2 2v13l-3-1.7-3 1.7-3-1.7-3 1.7v-13a2 2 0 0 1 2-2Z" />
      <path strokeLinecap="round" d="M10 9h4M10 12.5h4" />
    </svg>
  );
}

export function DoctorWaitingQueue({ visits }: { visits: Visit[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const waitingVisits = visits.filter((visit) => visit.status === "Waiting");
  const consultingVisits = visits.filter((visit) => visit.status === "In Consultation");
  const billingVisits = visits.filter((visit) => visit.status === "Ready for Billing");
  const queueSections = [
    {
      title: "Waiting",
      detail: "New patients added by reception",
      visits: waitingVisits,
      empty: "No patients are waiting for a new consultation.",
      icon: "waiting" as const,
      iconTone: "bg-amber-100 text-amber-800",
      badgeTone: "bg-amber-100 text-amber-800",
      borderTone: "border-amber-200",
      rowTone: "bg-amber-50/45",
    },
    {
      title: "In consultation",
      detail: "Opened visits that still need doctor work",
      visits: consultingVisits,
      empty: "No active consultations are in progress.",
      icon: "consulting" as const,
      iconTone: "bg-[#e7f0ff] text-[#0b2a5b]",
      badgeTone: "bg-[#e7f0ff] text-[#0b2a5b]",
      borderTone: "border-[#cfe0ff]",
      rowTone: "bg-[#f7fafc]",
    },
    {
      title: "Ready for billing",
      detail: "Completed doctor work waiting for reception",
      visits: billingVisits,
      empty: "No visits have been sent to billing yet.",
      icon: "billing" as const,
      iconTone: "bg-emerald-100 text-emerald-800",
      badgeTone: "bg-emerald-100 text-emerald-800",
      borderTone: "border-emerald-200",
      rowTone: "bg-emerald-50/45",
    },
  ];
  const queueStats = [
    { label: "Waiting", value: waitingVisits.length, detail: "Needs start", icon: "waiting" as const, tone: "bg-amber-100 text-amber-800" },
    { label: "With doctor", value: consultingVisits.length, detail: "Continue care", icon: "consulting" as const, tone: "bg-[#e7f0ff] text-[#0b2a5b]" },
    { label: "For reception", value: billingVisits.length, detail: "Billing ready", icon: "billing" as const, tone: "bg-emerald-100 text-emerald-800" },
  ];

  async function openVisit(visit: Visit) {
    setError("");
    setLoadingId(visit.id);

    if (visit.status !== "Waiting") {
      router.push(`/doctor/queue/${visit.id}`);
      return;
    }

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
  }

  return (
    <section className="grid gap-5">
      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#2f80ed]">Doctor workbench</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-[#071b33]">
              Active patient queue
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#61758a]">
              Start new patients, continue open consultations, and confirm records already sent to reception.
            </p>
          </div>
          <p className="rounded-full border border-[#d8e4ec] bg-white px-4 py-2 text-sm font-medium text-[#61758a]">
            {visits.length} active visit{visits.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-[#d8e4ec] bg-white shadow-sm">
          <div className="grid divide-y divide-[#d8e4ec] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {queueStats.map((stat) => (
              <article className="flex items-center gap-4 px-5 py-4" key={stat.label}>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}>
                  <QueueIcon type={stat.icon} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#61758a]">{stat.label}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className="text-3xl font-semibold tracking-tight text-[#071b33]">{stat.value}</p>
                    <p className="text-xs font-medium text-[#8ca0b4]">{stat.detail}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {visits.length > 0 ? queueSections.map((section) => (
        <article className="overflow-hidden rounded-[22px] border border-[#d8e4ec] bg-white shadow-sm" key={section.title}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8e4ec] px-6 py-5">
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${section.iconTone}`}>
                <QueueIcon type={section.icon} />
              </div>
              <div>
                <h4 className="text-lg font-semibold tracking-tight text-[#071b33]">{section.title}</h4>
                <p className="mt-1 text-sm text-[#61758a]">{section.detail}</p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${section.badgeTone}`}>
              {section.visits.length}
            </span>
          </div>

          {section.visits.length ? (
            <div className="divide-y divide-[#e7eef3]">
              {section.visits.map((visit, index) => (
                <div
                  className="grid gap-4 px-5 py-4 transition-colors hover:bg-[#f7fafc] xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_144px] xl:items-center"
                  key={visit.id}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${section.borderTone} bg-white text-sm font-bold tabular-nums text-[#0b2a5b]`}>
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words text-base font-semibold text-[#071b33]">{visit.patientName}</p>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#2f80ed] ring-1 ring-[#d8e4ec]">
                          {visit.patientCode}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#61758a]">
                        Checked in {formatDateTime(visit.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0 border-l-2 border-[#e7eef3] pl-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8ca0b4]">
                      {section.title === "Ready for billing" ? "Doctor summary" : "Clinical note"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#071b33]">
                      {visit.diagnosis || visit.symptoms.join(", ") || "No symptoms recorded"}
                    </p>
                  </div>

                  <button
                    className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold transition disabled:opacity-60 sm:w-36 xl:justify-self-end ${getQueueActionClass(visit.status)}`}
                    disabled={loadingId !== null}
                    onClick={() => {
                      void openVisit(visit);
                    }}
                    type="button"
                  >
                    {loadingId === visit.id
                      ? "Opening..."
                      : getQueueActionLabel(visit.status)}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${section.iconTone}`}>
                <QueueIcon type={section.icon} />
              </div>
              <p className="mt-4 font-semibold text-[#071b33]">{section.empty}</p>
              <p className="mt-1 text-sm text-[#61758a]">This section will update when the queue status changes.</p>
            </div>
          )}
        </article>
      )) : null}

      {!visits.length ? (
        <div className="rounded-[22px] border border-[#d8e4ec] bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f0ff] text-[#0b2a5b]">
            <QueueIcon type="waiting" />
          </div>
          <p className="mt-4 font-semibold text-[#071b33]">No active queue items</p>
          <p className="mt-1 text-sm text-[#61758a]">
            Reception has not added waiting patients, and there are no open consultations.
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}
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
  const [draftFee, setDraftFee] = useState(visit.consultationFee);
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
  const visitTotal = draftFee + medicineTotal;

  return (
    <form
      className="grid gap-5"
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
      <section className="overflow-hidden rounded-[20px] border border-[#d8e4ec] bg-white shadow-sm">
        <div className="grid gap-5 border-b border-[#d8e4ec] bg-[#fbfdff] p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(240px,0.75fr)] xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0b2a5b] text-xl font-semibold text-white">
              {visit.patientName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#2f80ed]">
                  Active consultation
                </p>
                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getVisitStatusClass(visit.status)}`}>
                  {visit.status}
                </span>
              </div>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#071b33]">{visit.patientName}</h3>
              <p className="mt-1 text-sm text-[#61758a]">
                {visit.patientCode} • Checked in {formatDateTime(visit.createdAt)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#dce8f5] bg-[#f0f6ff] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#61758a]">Presenting symptoms</p>
            <p className="mt-2 text-sm leading-6 text-[#071b33]">
              {visit.symptoms.join(", ") || "No symptoms recorded"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid min-w-0 gap-6">
            <div className="border-b border-[#e7eef3] pb-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#61758a]">Clinical note</p>
                  <h4 className="mt-1 text-lg font-semibold tracking-tight text-[#071b33]">
                    Diagnosis and notes
                  </h4>
                </div>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#61758a] ring-1 ring-[#d8e4ec]">
                  Doctor entry
                </span>
              </div>

              <div className="mt-5 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#071b33]">Diagnosis</span>
                  <textarea
                    className="min-h-28 rounded-2xl border border-[#d8e4ec] bg-white px-4 py-3 text-sm text-[#071b33] outline-none transition placeholder:text-[#8ca0b4] focus:border-[#2f80ed] focus:ring-4 focus:ring-[#e7f0ff]"
                    defaultValue={visit.diagnosis}
                    name="diagnosis"
                    placeholder="Diagnosis"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#071b33]">Consultation notes</span>
                  <textarea
                    className="min-h-24 rounded-2xl border border-[#d8e4ec] bg-white px-4 py-3 text-sm text-[#071b33] outline-none transition placeholder:text-[#8ca0b4] focus:border-[#2f80ed] focus:ring-4 focus:ring-[#e7f0ff]"
                    defaultValue={visit.notes}
                    name="notes"
                    placeholder="Consultation notes"
                  />
                </label>
                <label className="grid gap-2 md:max-w-xs">
                  <span className="text-sm font-semibold text-[#071b33]">Consultation fee</span>
                  <input
                    className="rounded-2xl border border-[#d8e4ec] bg-white px-4 py-3 text-sm text-[#071b33] outline-none transition placeholder:text-[#8ca0b4] focus:border-[#2f80ed] focus:ring-4 focus:ring-[#e7f0ff]"
                    defaultValue={visit.consultationFee}
                    min="0"
                    name="consultationFee"
                    onChange={(event) => setDraftFee(Math.max(0, Number(event.target.value) || 0))}
                    placeholder="Consultation fee MMK"
                    type="number"
                  />
                </label>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#61758a]">Prescription</p>
                  <h4 className="mt-1 text-lg font-semibold tracking-tight text-[#071b33]">
                    Medicine order
                  </h4>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {prescriptionItems.map((item, index) => {
                  const selectedMedicine = medicines.find(
                    (medicine) => medicine.id === item.medicineId,
                  );

                  return (
                    <div
                      key={`${visit.id}-medicine-${index}`}
                      className="rounded-xl border border-[#d8e4ec] bg-[#fbfdff] p-4"
                    >
                      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_90px_auto] lg:items-end">
                        <label className="grid min-w-0 gap-2">
                          <span className="text-xs font-semibold text-[#61758a]">Medicine</span>
                          <select
                            className="min-h-11 w-full min-w-0 rounded-xl border border-[#d8e4ec] bg-white px-3 py-2 text-sm text-[#071b33] outline-none transition focus:border-[#2f80ed] focus:ring-4 focus:ring-[#e7f0ff]"
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
                        </label>
                        <label className="grid min-w-0 gap-2">
                          <span className="text-xs font-semibold text-[#61758a]">Dosage / instructions</span>
                          <input
                            className="min-h-11 w-full min-w-0 rounded-xl border border-[#d8e4ec] bg-white px-3 py-2 text-sm text-[#071b33] outline-none transition placeholder:text-[#8ca0b4] focus:border-[#2f80ed] focus:ring-4 focus:ring-[#e7f0ff]"
                            onChange={(event) =>
                              setPrescriptionItems((current) =>
                                current.map((entry, entryIndex) =>
                                  entryIndex === index
                                    ? { ...entry, dosage: event.target.value }
                                    : entry,
                                ),
                              )
                            }
                            placeholder="Dosage"
                            value={item.dosage}
                          />
                        </label>
                        <label className="grid min-w-0 gap-2">
                          <span className="text-xs font-semibold text-[#61758a]">Quantity</span>
                          <input
                            className="min-h-11 w-full min-w-0 rounded-xl border border-[#d8e4ec] bg-white px-3 py-2 text-right text-sm tabular-nums text-[#071b33] outline-none transition focus:border-[#2f80ed] focus:ring-4 focus:ring-[#e7f0ff]"
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
                        </label>
                        <button
                          aria-label={`Remove medicine ${index + 1}`}
                          className="min-h-11 rounded-xl px-3 py-2 text-sm font-medium text-[#61758a] transition hover:bg-rose-50 hover:text-rose-700"
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
                      </div>
                      {selectedMedicine ? (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#f7fafc] px-3 py-2 text-sm text-[#61758a]">
                          <span>
                            Stock {selectedMedicine.stock} {selectedMedicine.unit} • {selectedMedicine.salePrice.toLocaleString()} MMK each
                          </span>
                          <span className="whitespace-nowrap font-semibold tabular-nums text-[#071b33]">
                            {(selectedMedicine.salePrice * item.quantity).toLocaleString()} MMK
                          </span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <button
                className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-[#d8e4ec] bg-white px-4 text-sm font-semibold text-[#0b2a5b] transition hover:border-[#2f80ed] hover:bg-[#e7f0ff]"
                onClick={() =>
                  setPrescriptionItems((current) => [
                    ...current,
                    { medicineId: "", dosage: "", quantity: 1 },
                  ])
                }
                type="button"
              >
                + Add medicine
              </button>

              <div className="mt-5 border-t border-[#e7eef3] pt-4">
                <p className="text-sm font-semibold text-[#071b33]">Medicine summary</p>
                <div className="mt-3 grid gap-2">
                  {selectedPrescription.map((item, index) => (
                    <div
                      key={`${visit.id}-summary-${item.medicine.id}-${index}`}
                      className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#61758a]"
                    >
                      <span>
                        {item.medicine.name} • {item.quantity} {item.medicine.unit}
                        {item.dosage ? ` • ${item.dosage}` : ""}
                      </span>
                      <span className="font-semibold text-[#071b33]">{item.lineTotal.toLocaleString()} MMK</span>
                    </div>
                  ))}
                  {!selectedPrescription.length ? (
                    <p className="text-sm text-[#61758a]">
                      No medicine selected yet. Reception will only see items added here.
                    </p>
                  ) : null}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#d8e4ec] pt-4 text-sm font-semibold text-[#071b33]">
                  <span>Medicine total</span>
                  <span>{medicineTotal.toLocaleString()} MMK</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#cce8d8] bg-[#f2fbf6] p-5">
              <h4 className="mb-4 text-base font-semibold text-[#071b33]">Review and finish</h4>
              <div className="grid gap-3 text-sm tabular-nums">
                <div className="flex items-center justify-between gap-3 text-[#61758a]">
                  <span>Consultation fee</span>
                  <span className="font-semibold text-[#071b33]">{draftFee.toLocaleString()} MMK</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[#61758a]">
                  <span>Medicine total</span>
                  <span className="font-semibold text-[#071b33]">{medicineTotal.toLocaleString()} MMK</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[#d8e4ec] pt-3 text-[#071b33]">
                  <span className="font-semibold">Total charge</span>
                  <span className="text-xl font-semibold">{visitTotal.toLocaleString()} MMK</span>
                </div>
              </div>
              <button
                className="mt-5 min-h-11 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
                disabled={loading}
                type="submit"
              >
                {loading ? "Saving..." : "Done and send to billing"}
              </button>
              <p className="mt-3 text-sm text-emerald-800">
                Saving here updates the patient and moves the visit to billing automatically.
              </p>
            </div>
            {localError ? (
              <p role="alert" className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {localError}
              </p>
            ) : null}
          </div>

          <aside className="grid content-start gap-5">
            <div className="rounded-2xl border border-[#d8e4ec] bg-[#fbfdff] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#61758a]">Patient history</p>
              <h4 className="mt-1 text-lg font-semibold tracking-tight text-[#071b33]">
                Previous visits
              </h4>
              <div className="mt-4 divide-y divide-[#e7eef3]">
                {history
                  .filter((entry) => entry.id !== visit.id)
                  .slice(0, 5)
                  .map((entry) => (
                    <div key={entry.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#071b33]">
                          {formatDateTime(entry.createdAt)}
                        </p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getVisitStatusClass(entry.status)}`}>
                          {entry.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#61758a]">
                        {entry.diagnosis || "No diagnosis yet"}
                      </p>
                      <p className="mt-2 text-xs tabular-nums leading-5 text-[#61758a]">
                        Fee {entry.consultationFee.toLocaleString()} MMK • Medicine{" "}
                        {entry.medicineCharge.toLocaleString()} MMK
                      </p>
                    </div>
                  ))}
                {history.filter((entry) => entry.id !== visit.id).length === 0 ? (
                  <div className="rounded-2xl border border-[#d8e4ec] bg-white px-4 py-6 text-center">
                    <p className="font-semibold text-[#071b33]">No previous history</p>
                    <p className="mt-1 text-sm text-[#61758a]">
                      No previous history for this patient yet.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </form>
  );
}
