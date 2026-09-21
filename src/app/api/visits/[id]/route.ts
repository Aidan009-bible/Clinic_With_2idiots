import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import {
  issueBillAndReduceStock,
  startVisitConsultation,
  updateVisitClinical,
} from "@/lib/clinic-server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    action?: string;
    diagnosis?: string;
    notes?: string;
    prescriptionText?: string;
    prescriptionItems?: Array<{
      medicineId?: string;
      dosage?: string;
      quantity?: number;
    }>;
    consultationFee?: number;
  };

  try {
    if (body.action === "start-consultation") {
      if (session.role !== "doctor") {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }

      const visit = await startVisitConsultation(id);
      revalidatePath("/doctor/queue");
      revalidatePath("/reception/queue");
      return NextResponse.json({ visit });
    }

    if (body.action === "issue-bill") {
      if (!["admin", "reception"].includes(session.role)) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }

      const visit = await issueBillAndReduceStock(id);
      revalidatePath("/reception/billing");
      revalidatePath("/reception/stock");
      revalidatePath("/reception/visits");
      revalidatePath("/reception/queue");
      revalidatePath("/doctor/queue");
      revalidatePath("/doctor/history");
      revalidatePath("/doctor/stock");
      revalidatePath("/admin/overview");
      revalidatePath("/admin/stock");
      return NextResponse.json({ visit });
    }

    if (!["admin", "doctor"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const visit = await updateVisitClinical(id, {
      diagnosis: String(body.diagnosis ?? ""),
      notes: String(body.notes ?? ""),
      consultationFee: Number(body.consultationFee ?? 0),
      prescriptionText: String(body.prescriptionText ?? ""),
      prescriptionItems: body.prescriptionItems,
    });

    revalidatePath("/doctor/queue");
    revalidatePath("/doctor/history");
    revalidatePath("/doctor/stock");
    revalidatePath("/reception/visits");
    revalidatePath("/reception/queue");
    revalidatePath("/reception/billing");
    revalidatePath("/admin/overview");
    return NextResponse.json({ visit });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update visit." },
      { status: 400 },
    );
  }
}
