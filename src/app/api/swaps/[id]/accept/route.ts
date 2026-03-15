import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

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

  // Notify the proposer that their swap was accepted
  await createNotification({
    userId: swap.proposerId,
    type: "SWAP_ACCEPTED",
    title: "Swap accepted",
    message: `${user.name} accepted your swap proposal`,
    linkUrl: `/swap/${id}`,
  });

  return NextResponse.json(updated);
}
