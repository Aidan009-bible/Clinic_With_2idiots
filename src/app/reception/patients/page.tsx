import { DashboardShell } from "@/components/dashboard-shell";
import { ReceptionPatientForm } from "@/components/reception-actions";
import { requireSession } from "@/lib/auth";
import { getClinicSnapshot } from "@/lib/clinic-server";

const navItems = [
  { href: "/reception/overview", label: "Overview" },
  { href: "/reception/patients", label: "Patients" },
  { href: "/reception/queue", label: "Queue" },
  { href: "/reception/billing", label: "Billing" },
  { href: "/reception/stock", label: "Medicine Stock" },
];

export const dynamic = "force-dynamic";

export default async function ReceptionPatientsPage() {
  const session = await requireSession(["reception"]);
  const snapshot = await getClinicSnapshot();

  return (
    <DashboardShell
      activeHref="/reception/patients"
      navItems={navItems}
      session={session}
      subtitle="Choose an old patient or register a new patient, then add the visit directly to the queue."
      title="Reception dashboard"
    >
      <ReceptionPatientForm patients={snapshot.patients} />
    </DashboardShell>
  );
}
