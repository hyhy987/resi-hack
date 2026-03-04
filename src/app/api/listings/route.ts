import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createListingSchema } from "@/lib/validations";
import { MAX_DAILY_LISTINGS, EXPIRY_HOURS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const userId = searchParams.get("userId");

  const now = new Date();

  // Lazy-expire: update expired listings
  await db.listing.updateMany({
    where: { status: "ACTIVE", expiresAt: { lt: now } },
    data: { status: "EXPIRED" },
  });

  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (type) where.type = type;
  if (userId) {
    // For "My Listings", show all statuses
    delete where.status;
    where.userId = userId;
  }

  const listings = await db.listing.findMany({
    where,
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(listings);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Rate limit: max listings per day
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayCount = await db.listing.count({
    where: { userId: user.id, createdAt: { gte: startOfDay } },
  });
  if (todayCount >= MAX_DAILY_LISTINGS) {
    return NextResponse.json(
      { error: `Max ${MAX_DAILY_LISTINGS} listings per day` },
      { status: 429 }
    );
  }

  const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);

  const listing = await db.listing.create({
    data: {
      userId: user.id,
      type: parsed.data.type,
      amount: parsed.data.amount,
      notes: parsed.data.notes || "",
      expiresAt,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json(listing, { status: 201 });
}
