"use client";

import { useDeferredValue, useState } from "react";

import type { Patient } from "@/lib/types";

export function PatientDirectory({ patients }: { patients: Patient[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredPatients = patients.filter((patient) =>
    `${patient.patientCode} ${patient.name} ${patient.phone} ${patient.tags.join(" ")}`
      .toLowerCase()
      .includes(normalizedQuery),
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Patient records</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Registered patients</h3>
          <p className="mt-2 text-sm text-slate-500">{filteredPatients.length} of {patients.length} records</p>
        </div>
        <div className="w-full max-w-md">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" htmlFor="admin-patient-search">
            Search patients
          </label>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            id="admin-patient-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, patient ID, phone, or tag"
            type="search"
            value={query}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.1em] text-slate-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Patient</th>
              <th className="px-4 py-4 font-semibold">Age</th>
              <th className="px-4 py-4 font-semibold">Phone</th>
              <th className="px-4 py-4 font-semibold">Tags</th>
              <th className="px-6 py-4 font-semibold">Last visit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredPatients.map((patient) => (
              <tr className="hover:bg-sky-50/60" key={patient.id}>
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-950">{patient.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{patient.patientCode}</p>
                </td>
                <td className="px-4 py-4 text-sm text-slate-700">{patient.age}</td>
                <td className="px-4 py-4 text-sm text-slate-700">{patient.phone}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{patient.tags.join(", ") || "-"}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{new Date(patient.lastVisitAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filteredPatients.length ? (
        <p className="border-t border-slate-200 px-6 py-10 text-center text-sm text-slate-500">No patient records match “{query}”.</p>
      ) : null}
    </section>
  );
}
