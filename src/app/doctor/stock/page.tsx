import { DashboardShell } from "@/components/dashboard-shell";
import { MedicineStockTable } from "@/components/medicine-stock-table";
import { requireSession } from "@/lib/auth";
import { getClinicSnapshot } from "@/lib/clinic-server";

const navItems = [
  { href: "/doctor/overview", label: "Overview" },
  { href: "/doctor/queue", label: "Waiting" },
  { href: "/doctor/history", label: "Patient History" },
  { href: "/doctor/stock", label: "Medicine Stock" },
];

export const dynamic = "force-dynamic";

export default async function DoctorStockPage() {
  const session = await requireSession(["doctor"]);
  const snapshot = await getClinicSnapshot();

  return (
    <DashboardShell
      activeHref="/doctor/stock"
      navItems={navItems}
      session={session}
      subtitle="Quick stock reference while prescribing medicine to patients."
      title="Doctor dashboard"
    >
      <MedicineStockTable
        description="Doctor can view live stock while prescribing, but editing stays restricted to admin."
        medicines={snapshot.medicines}
        title="Medicine stock table"
      />
    </DashboardShell>
  );
}
