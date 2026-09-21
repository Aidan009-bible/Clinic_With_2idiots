import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { adjustMedicineStock, deleteMedicine, updateMedicine } from "@/lib/clinic-server";

function revalidateMedicineViews() {
  revalidatePath("/admin/stock");
  revalidatePath("/admin/overview");
  revalidatePath("/doctor/stock");
  revalidatePath("/doctor/queue");
  revalidatePath("/reception/stock");
  revalidatePath("/reception/billing");
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    delta?: number;
    name?: string;
    stock?: number;
    unit?: string;
    expiry?: string;
    salePrice?: number;
    photoDataUrl?: string | null;
  };
  const { id } = await context.params;

  try {
    const medicine =
      body.delta !== undefined
        ? await adjustMedicineStock(id, Number(body.delta ?? 0))
        : await updateMedicine(id, {
            name: String(body.name ?? ""),
            stock: Number(body.stock ?? 0),
            unit: String(body.unit ?? ""),
            expiry: String(body.expiry ?? ""),
            salePrice: Number(body.salePrice ?? 0),
            photoDataUrl: body.photoDataUrl == null ? null : String(body.photoDataUrl),
          });

    revalidateMedicineViews();
    return NextResponse.json({ medicine });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update stock." },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const medicine = await deleteMedicine(id);
    revalidateMedicineViews();
    return NextResponse.json({ medicine });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete medicine." },
      { status: 400 },
    );
  }
}
