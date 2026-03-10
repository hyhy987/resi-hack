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
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const swap = await tx.swap.findUnique({
        where: { id },
        include: { listing: true },
      });

      if (!swap) throw new Error("Swap not found");

      if (
        swap.status !== "ACCEPTED" &&
        swap.status !== "CONFIRMED_BY_GIVER" &&
        swap.status !== "CONFIRMED_BY_RECEIVER"
      ) {
        throw new Error("Swap must be accepted before confirming");
      }

      const isGiver =
        (swap.listing.type === "OFFER" && swap.counterpartyId === user.id) ||
        (swap.listing.type === "REQUEST" && swap.proposerId === user.id);
      const isReceiver =
        (swap.listing.type === "OFFER" && swap.proposerId === user.id) ||
        (swap.listing.type === "REQUEST" && swap.counterpartyId === user.id);

      if (!isGiver && !isReceiver) {
        throw new Error("You are not part of this swap");
      }

      const updateData: Prisma.SwapUpdateInput = {};

      if (isGiver) {
        if (swap.giverConfirmed) throw new Error("Already confirmed as giver");
        updateData.giverConfirmed = true;
      } else {
        if (swap.receiverConfirmed)
          throw new Error("Already confirmed as receiver");
        updateData.receiverConfirmed = true;
      }

      const currentSwap = await tx.swap.findUnique({
        where: { id },
        include: { listing: true },
      });

      if (!currentSwap) {
        throw new Error("Swap not found or was deleted.");
      }

      const bothConfirmed =
        (isGiver && currentSwap.receiverConfirmed) ||
        (isReceiver && currentSwap.giverConfirmed);

      if (bothConfirmed) {
        const giverId =
          swap.listing.type === "OFFER" ? swap.counterpartyId : swap.proposerId;
        const receiverId =
          swap.listing.type === "OFFER" ? swap.proposerId : swap.counterpartyId;

        const giver = await tx.user.findUnique({ where: { id: giverId } });
        const receiver = await tx.user.findUnique({
          where: { id: receiverId },
        });

        if (!giver || !receiver) throw new Error("User not found");
        if (giver.trackedCredits < swap.amount) {
          throw new Error("Giver doesn't have enough credits");
        }
        if (receiver.trackedCredits + swap.amount > MAX_CREDITS) {
          throw new Error("Receiver would exceed max credits");
        }

        await tx.user.update({
          where: { id: giverId },
          data: { trackedCredits: giver.trackedCredits - swap.amount },
        });
        await tx.user.update({
          where: { id: receiverId },
          data: { trackedCredits: receiver.trackedCredits + swap.amount },
        });

        updateData.status = "COMPLETED";
      } else {
        updateData.status = isGiver
          ? "CONFIRMED_BY_GIVER"
          : "CONFIRMED_BY_RECEIVER";
      }

      return tx.swap.update({
        where: { id },
        data: updateData,
      });
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
