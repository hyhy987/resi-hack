import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const swap = await db.swap.findUnique({ where: { id } });
  if (!swap)
    return NextResponse.json({ error: "Swap not found" }, { status: 404 });

  if (swap.status === "COMPLETED" || swap.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Swap already finalized" },
      { status: 400 },
    );
  }

  // Auth Check
  if (swap.proposerId !== user.id && swap.counterpartyId !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await db.$transaction(async (tx) => {
    await tx.swap.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    const listing = await tx.listing.findUnique({
      where: { id: swap.listingId },
    });

    if (listing) {
      const isExpired = new Date(listing.expiresAt) < new Date();
      await tx.listing.update({
        where: { id: swap.listingId },
        data: { status: isExpired ? "EXPIRED" : "ACTIVE" },
      });
    }
  });

  return NextResponse.json({ success: true });
}
