import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const swap = await db.swap.findUnique({
    where: { id },
    include: { listing: true },
  });

  if (!swap) {
    return NextResponse.json({ error: "Swap not found" }, { status: 404 });
  }

  if (swap.status !== "PROPOSED") {
    return NextResponse.json(
      { error: "Swap is not in PROPOSED state" },
      { status: 400 }
    );
  }

  if (swap.counterpartyId !== user.id) {
    return NextResponse.json(
      { error: "Only the listing creator can accept" },
      { status: 403 }
    );
  }

  const updated = await db.swap.update({
    where: { id },
    data: { status: "ACCEPTED" },
  });

  return NextResponse.json(updated);
}
