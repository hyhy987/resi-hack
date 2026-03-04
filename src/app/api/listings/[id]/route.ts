import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const listing = await db.listing.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, contactHandle: true, trackedCredits: true },
      },
      swaps: {
        select: { id: true, status: true, proposerId: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json(listing);
}
