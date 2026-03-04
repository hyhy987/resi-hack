import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createSwapSchema } from "@/lib/validations";
import { MAX_CREDITS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSwapSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
  const result = await db.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({
      where: { id: parsed.data.listingId },
    });

    if (!listing || listing.status !== "ACTIVE") {
      throw new Error("Listing not available");
    }

    if (listing.expiresAt < new Date()) {
      await tx.listing.update({
        where: { id: listing.id },
        data: { status: "EXPIRED" },
      });
      throw new Error("Listing has expired");
    }

    // Self-swap prevention
    if (listing.userId === user.id) {
      throw new Error("Cannot swap with yourself");
    }

    // Determine giver and receiver
    const giverId =
      listing.type === "OFFER" ? listing.userId : user.id;
    const receiverId =
      listing.type === "OFFER" ? user.id : listing.userId;

    // Check credit bounds
    const giver = await tx.user.findUnique({ where: { id: giverId } });
    const receiver = await tx.user.findUnique({ where: { id: receiverId } });

    if (!giver || !receiver) throw new Error("User not found");
    if (giver.trackedCredits < parsed.data.amount) {
      throw new Error("Giver doesn't have enough credits");
    }
    if (receiver.trackedCredits + parsed.data.amount > MAX_CREDITS) {
      throw new Error("Receiver would exceed max credits");
    }

    // Mark listing as matched
    await tx.listing.update({
      where: { id: listing.id },
      data: { status: "MATCHED" },
    });

    const swap = await tx.swap.create({
      data: {
        listingId: listing.id,
        proposerId: user.id,
        counterpartyId: listing.userId,
        amount: parsed.data.amount,
      },
      include: {
        listing: true,
        proposer: { select: { id: true, name: true } },
        counterparty: { select: { id: true, name: true } },
      },
    });

    return swap;
  });

  return NextResponse.json(result, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
