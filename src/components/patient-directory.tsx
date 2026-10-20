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
  const taggedCount = patients.filter((patient) => patient.tags.length > 0).length;
  const recentCount = patients.filter((patient) => {
    const lastVisit = new Date(patient.lastVisitAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return lastVisit >= thirtyDaysAgo;
  }).length;

  return (
    <section data-ui="patient-directory" className="overflow-hidden rounded-[24px] border border-[#d8e4ec] bg-white shadow-sm">
      <div className="border-b border-[#d8e4ec] px-6 py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#2f80ed]">Patient records</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-[#071b33]">Registered patients</h3>
            <p className="mt-2 text-sm text-[#61758a]">{filteredPatients.length} of {patients.length} records</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
            {[
              ["Total patients", patients.length],
              ["Tagged patients", taggedCount],
              ["Visited in last 30 days", recentCount],
            ].map(([label, value]) => (
              <div className="rounded-2xl border border-[#d8e4ec] bg-[#f7fafc] px-4 py-3" key={label}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#61758a]">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-[#082a60]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div data-ui="patient-search" className="mt-5 rounded-[20px] border border-[#d8e4ec] bg-[#f7fafc] p-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#61758a]" htmlFor="admin-patient-search">
            Search patients
          </label>
          <div className="relative">
            <svg aria-hidden="true" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8ca0b4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m16.5 16.5 4 4" />
            </svg>
            <input
              className="w-full rounded-2xl border border-[#d8e4ec] bg-white px-4 py-3 pl-12 text-sm text-[#071b33] outline-none transition placeholder:text-[#8ca0b4] focus:border-[#2f80ed] focus:ring-4 focus:ring-[#e7f0ff]"
              id="admin-patient-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, patient ID, phone, or tag"
              type="search"
              value={query}
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-[#f7fafc] text-xs uppercase tracking-[0.1em] text-[#61758a]">
            <tr>
              <th className="px-6 py-4 font-semibold">Patient</th>
              <th className="px-4 py-4 font-semibold">Age</th>
              <th className="px-4 py-4 font-semibold">Phone</th>
              <th className="px-4 py-4 font-semibold">Tags</th>
              <th className="px-6 py-4 font-semibold">Last visit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d8e4ec]">
            {filteredPatients.map((patient) => (
              <tr className="transition hover:bg-[#f7fafc]" key={patient.id}>
                <td className="px-6 py-4">
                  <p className="font-semibold text-[#071b33]">{patient.name}</p>
                  <p className="mt-1 text-xs font-medium text-[#2f80ed]">{patient.patientCode}</p>
                </td>
                <td className="px-4 py-4 text-sm text-[#61758a]">{patient.age}</td>
                <td className="px-4 py-4 text-sm font-medium text-[#071b33]">{patient.phone}</td>
                <td className="px-4 py-4 text-sm text-[#61758a]">
                  <div className="flex max-w-sm flex-wrap gap-2">
                    {patient.tags.length ? (
                      patient.tags.map((tag) => (
                        <span className="rounded-full bg-[#e7f0ff] px-2.5 py-1 text-xs font-semibold text-[#0b2a5b]" key={`${patient.id}-${tag}`}>
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#61758a]">{new Date(patient.lastVisitAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filteredPatients.length ? (
        <div className="border-t border-[#d8e4ec] px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f0ff] text-[#0b2a5b]">
            <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m16.5 16.5 4 4" />
            </svg>
          </div>
          <p className="mt-4 font-semibold text-[#071b33]">No matching patient records</p>
          <p className="mt-1 text-sm text-[#61758a]">No patient records match “{query}”.</p>
        </div>
      ) : null}
    </section>
  );
}
