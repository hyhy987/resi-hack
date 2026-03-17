import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");

  if (!listingId) {
    return NextResponse.json({ error: "listingId required" }, { status: 400 });
  }

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    include: { user: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Find complementary listings: OFFER matches REQUEST and vice versa
  const complementaryType = listing.type === "OFFER" ? "REQUEST" : "OFFER";

  const matches = await db.listing.findMany({
    where: {
      type: complementaryType,
      creditType: listing.creditType,
      status: "ACTIVE",
      userId: { not: listing.userId },
      user: { diningHall: listing.user.diningHall },
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: { id: true, name: true, diningHall: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json(matches);
}
