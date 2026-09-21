import { DashboardShell } from "@/components/dashboard-shell";
import { ReceptionBilling } from "@/components/reception-actions";
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

export default async function ReceptionBillingPage() {
  const session = await requireSession(["reception"]);
  const snapshot = await getClinicSnapshot();
  const readyVisits = snapshot.visits.filter((visit) => visit.status === "Ready for Billing");

  return (
    <DashboardShell
      activeHref="/reception/billing"
      navItems={navItems}
      session={session}
      subtitle="Create the bill slip after doctor fees and medicine charges are ready, then stock reduces automatically."
      title="Reception dashboard"
    >
      <ReceptionBilling visits={readyVisits} />
    </DashboardShell>
  );
}
