import { DashboardShell } from "@/components/dashboard-shell";
import { ReceptionStock } from "@/components/reception-actions";
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

export default async function ReceptionStockPage() {
  const session = await requireSession(["reception"]);
  const snapshot = await getClinicSnapshot();

  return (
    <DashboardShell
      activeHref="/reception/stock"
      navItems={navItems}
      session={session}
      subtitle="Reception can check medicine stock before printing and issuing the bill slip."
      title="Reception dashboard"
    >
      <ReceptionStock medicines={snapshot.medicines} />
    </DashboardShell>
  );
}
