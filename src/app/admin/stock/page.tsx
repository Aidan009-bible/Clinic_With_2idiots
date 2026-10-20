import { AdminActions } from "@/components/admin-actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireSession } from "@/lib/auth";
import { getClinicSnapshot } from "@/lib/clinic-server";

const navItems = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/patients", label: "Patients" },
  { href: "/admin/stock", label: "Medicine Stocks" },
];

export const dynamic = "force-dynamic";

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const session = await requireSession(["admin"]);
  const snapshot = await getClinicSnapshot();
  const { view } = await searchParams;

  return (
    <DashboardShell
      activeHref="/admin/stock"
      navItems={navItems}
      session={session}
      subtitle="Monitor medicine readiness, add stock records, and manage inventory details."
      title="Admin workspace"
    >
      <AdminActions initialLowStockOnly={view === "low"} medicines={snapshot.medicines} />
    </DashboardShell>
  );
}
