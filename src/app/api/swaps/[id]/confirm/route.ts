import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { MAX_CREDITS } from "@/lib/constants";
import { Prisma } from "@prisma/client";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const result = await db.$transaction(async (tx) => {
      const swap = await tx.swap.findUnique({
        where: { id },
        include: { listing: true },
      });

      if (!swap) throw new Error("Swap not found");

      // Validating stages for confirmation
      const validStages = [
        "ACCEPTED",
        "CONFIRMED_BY_GIVER",
        "CONFIRMED_BY_RECEIVER",
      ];
      if (!validStages.includes(swap.status)) {
        throw new Error("Swap must be accepted before confirming");
      }

      // Logic: Giver is the one losing credits
      // If OFFER: Owner (counterparty) is giver. If REQUEST: Proposer is giver.
      const isGiver =
        (swap.listing.type === "OFFER" && swap.counterpartyId === user.id) ||
        (swap.listing.type === "REQUEST" && swap.proposerId === user.id);

      const isReceiver =
        !isGiver &&
        (swap.proposerId === user.id || swap.counterpartyId === user.id);

      if (!isGiver && !isReceiver) throw new Error("Not authorized");

      const updateData: Prisma.SwapUpdateInput = {};

      if (isGiver) {
        if (swap.giverConfirmed) throw new Error("Already confirmed");
        updateData.giverConfirmed = true;
      } else {
        if (swap.receiverConfirmed) throw new Error("Already confirmed");
        updateData.receiverConfirmed = true;
      }

      // Check if this confirmation completes the swap
      const willBeBothConfirmed =
        (isGiver && swap.receiverConfirmed) ||
        (isReceiver && swap.giverConfirmed);

      if (willBeBothConfirmed) {
        const giverId =
          swap.listing.type === "OFFER" ? swap.counterpartyId : swap.proposerId;
        const receiverId =
          swap.listing.type === "OFFER" ? swap.proposerId : swap.counterpartyId;

        const giver = await tx.user.findUnique({ where: { id: giverId } });
        const receiver = await tx.user.findUnique({
          where: { id: receiverId },
        });

        if (!giver || !receiver) throw new Error("Users not found");
        if (giver.trackedCredits < swap.amount)
          throw new Error("Insufficient credits in Giver account");

        // Atomic Credit Swap
        await tx.user.update({
          where: { id: giverId },
          data: { trackedCredits: { decrement: swap.amount } },
        });
        await tx.user.update({
          where: { id: receiverId },
          data: { trackedCredits: { increment: swap.amount } },
        });

        updateData.status = "COMPLETED";

        // System message for the log
        await tx.swapMessage.create({
          data: {
            swapId: id,
            userId: user.id, // Or a system user ID if you have one
            message: `Swap completed! ${swap.amount} credits transferred successfully.`,
          },
        });
      } else {
        updateData.status = isGiver
          ? "CONFIRMED_BY_GIVER"
          : "CONFIRMED_BY_RECEIVER";
      }

      return tx.swap.update({ where: { id }, data: updateData });
    });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
