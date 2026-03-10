import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const swap = await db.swap.findUnique({
    where: { id },
    include: {
      listing: {
        select: { id: true, type: true, amount: true, notes: true },
      },
      proposer: { select: { id: true, name: true } },
      counterparty: { select: { id: true, name: true } },
      messages: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!swap) {
    return NextResponse.json({ error: "Swap not found" }, { status: 404 });
  }

  return NextResponse.json(swap);
}
