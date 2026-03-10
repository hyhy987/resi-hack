import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();

  const listing = await db.listing.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          nusId: true,
          contactHandle: true,
          // Explicitly selecting both credit fields
          breakfastCredits: true,
          dinnerCredits: true,
        },
      },
      swaps: {
        where: user
          ? { OR: [{ proposerId: user.id }, { counterpartyId: user.id }] }
          : undefined,
        select: {
          id: true,
          status: true,
          proposerId: true,
          counterpartyId: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json(listing);
}
