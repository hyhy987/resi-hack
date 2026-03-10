import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validations";
import { EXPIRY_HOURS } from "@/lib/constants";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { confirmReset, ...rest } = body;
  const parsed = updateProfileSchema.safeParse(rest);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const data = parsed.data;

  if (data.diningHall && data.diningHall !== user.diningHall) {
    const activeSwaps = await db.swap.findMany({
      where: {
        OR: [{ proposerId: user.id }, { counterpartyId: user.id }],
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      include: { listing: true },
    });

    if (activeSwaps.length > 0 && !confirmReset) {
      return NextResponse.json(
        { error: "ACTIVE_SWAPS_FOUND", count: activeSwaps.length },
        { status: 409 },
      );
    }

    return await db.$transaction(async (tx) => {
      if (confirmReset && activeSwaps.length > 0) {
        for (const swap of activeSwaps) {
          await tx.swap.update({
            where: { id: swap.id },
            data: { status: "CANCELLED" },
          });

          await tx.listing.update({
            where: { id: swap.listingId },
            data: { status: "CANCELLED" },
          });

          await tx.listing.create({
            data: {
              userId: swap.listing.userId,
              type: swap.listing.type,
              creditType: swap.listing.creditType,
              amount: swap.listing.amount,
              notes: swap.listing.notes,
              status: "ACTIVE",
              expiresAt: new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000),
            },
          });
        }
      }

      const updated = await tx.user.update({
        where: { id: user.id },
        data,
      });

      return NextResponse.json(updated);
    });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data,
  });

  return NextResponse.json(updated);
}
