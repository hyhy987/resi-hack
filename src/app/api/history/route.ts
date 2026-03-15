import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Get all completed swaps where this user was involved
  const swaps = await db.swap.findMany({
    where: {
      status: "COMPLETED",
      OR: [{ proposerId: user.id }, { counterpartyId: user.id }],
    },
    include: {
      listing: true,
      proposer: { select: { id: true, name: true } },
      counterparty: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const history = swaps.map((swap) => {
    const isProposer = swap.proposerId === user.id;
    const counterparty = isProposer ? swap.counterparty : swap.proposer;

    // Determine if user gave or received credits
    // OFFER listing: counterparty (listing owner) is the giver, proposer is receiver
    // REQUEST listing: proposer is the giver, counterparty (listing owner) is receiver
    const isGiver =
      (swap.listing.type === "OFFER" && !isProposer) ||
      (swap.listing.type === "REQUEST" && isProposer);

    return {
      id: swap.id,
      swapId: swap.id,
      type: isGiver ? "GAVE" : "RECEIVED",
      creditType: swap.listing.creditType,
      amount: swap.amount,
      counterpartyName: counterparty.name,
      completedAt: swap.createdAt.toISOString(),
    };
  });

  return NextResponse.json(history);
}
