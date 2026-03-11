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

      const validStages = [
        "ACCEPTED",
        "CONFIRMED_BY_GIVER",
        "CONFIRMED_BY_RECEIVER",
      ];
      if (!validStages.includes(swap.status)) {
        throw new Error("Swap must be accepted before confirming");
      }

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

        // DYNAMIC FIELD SELECTION
        const creditField =
          swap.listing.creditType === "BREAKFAST"
            ? "breakfastCredits"
            : "dinnerCredits";

        if (giver[creditField] < swap.amount)
          throw new Error(
            `Insufficient ${swap.listing.creditType.toLowerCase()} credits`,
          );

        if (receiver[creditField] + swap.amount > MAX_CREDITS)
          throw new Error(
            `Receiver would exceed max ${swap.listing.creditType.toLowerCase()} credits`,
          );

        // Atomic Credit Swap using dynamic keys
        await tx.user.update({
          where: { id: giverId },
          data: { [creditField]: { decrement: swap.amount } },
        });
        await tx.user.update({
          where: { id: receiverId },
          data: { [creditField]: { increment: swap.amount } },
        });

        updateData.status = "COMPLETED";

        await tx.swapMessage.create({
          data: {
            swapId: id,
            userId: user.id,
            message: `Swap completed! ${swap.amount} ${swap.listing.creditType.toLowerCase()} credits transferred successfully.`,
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
