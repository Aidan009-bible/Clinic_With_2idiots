import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import { createMedicine, importMedicinesFromCsv } from "@/lib/clinic-server";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    mode?: string;
    name?: string;
    stock?: number;
    unit?: string;
    expiry?: string;
    salePrice?: number;
    photoDataUrl?: string;
    csvText?: string;
  };

  try {
    if (body.mode === "csv") {
      const medicines = await importMedicinesFromCsv(String(body.csvText ?? ""));
      revalidatePath("/admin/stock");
      revalidatePath("/admin/overview");
      revalidatePath("/doctor/stock");
      revalidatePath("/doctor/queue");
      revalidatePath("/reception/stock");
      return NextResponse.json({ medicines });
    }

    const medicine = await createMedicine({
      name: String(body.name ?? ""),
      stock: Number(body.stock ?? 0),
      unit: String(body.unit ?? ""),
      expiry: String(body.expiry ?? ""),
      salePrice: Number(body.salePrice ?? 0),
      photoDataUrl: body.photoDataUrl == null ? null : String(body.photoDataUrl),
    });

    revalidatePath("/admin/stock");
    revalidatePath("/admin/overview");
    revalidatePath("/doctor/stock");
    revalidatePath("/doctor/queue");
    revalidatePath("/reception/stock");
    return NextResponse.json({ medicine });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save medicine." },
      { status: 400 },
    );
  }
}
