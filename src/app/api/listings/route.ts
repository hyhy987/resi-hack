import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createListingSchema } from "@/lib/validations";
import { MAX_DAILY_LISTINGS, EXPIRY_HOURS } from "@/lib/constants";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createNotification } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);

  // 1. Validation for query params
  const type = searchParams.get("type") as "OFFER" | "REQUEST" | null;
  const creditType = searchParams.get("creditType") as
    | "BREAKFAST"
    | "DINNER"
    | null;
  const userIdParam = searchParams.get("userId");
  const sort = searchParams.get("sort") as "newest" | "expiring" | null;

  const now = new Date();

  // 2. Lazy-expire listings
  await db.listing.updateMany({
    where: { status: "ACTIVE", expiresAt: { lt: now } },
    data: { status: "EXPIRED" },
  });

  let where: Prisma.ListingWhereInput = {};

  if (userIdParam) {
    where = {
      AND: [
        {
          OR: [
            { userId: userIdParam },
            {
              swaps: {
                some: {
                  OR: [
                    { proposerId: userIdParam },
                    { counterpartyId: userIdParam },
                  ],
                },
              },
            },
          ],
        },
        ...(creditType ? [{ creditType }] : []),
      ],
    };
  } else {
    where = {
      status: "ACTIVE",
      user: { diningHall: user.diningHall },
    };
    if (type) where.type = type;
    if (creditType) where.creditType = creditType;
  }

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    sort === "expiring" ? { expiresAt: "asc" } : { createdAt: "desc" };

  const listings = await db.listing.findMany({
    where,
    orderBy,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          diningHall: true,
          breakfastCredits: true,
          dinnerCredits: true,
        },
      },
      swaps: {
        where: { OR: [{ proposerId: user.id }, { counterpartyId: user.id }] },
        select: {
          id: true,
          status: true,
          proposerId: true,
          counterpartyId: true,
          proposer: { select: { name: true } },
          counterparty: { select: { name: true } },
        },
      },
    },
  });

  return NextResponse.json(listings);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const parsed = createListingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayCount = await db.listing.count({
    where: { userId: user.id, createdAt: { gte: startOfDay } },
  });

  if (todayCount >= MAX_DAILY_LISTINGS) {
    return NextResponse.json(
      {
        error: `You've reached the limit of ${MAX_DAILY_LISTINGS} listings per day. Try again tomorrow.`,
      },
      { status: 429 },
    );
  }

  const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);

  const listing = await db.listing.create({
    data: {
      userId: user.id,
      type: parsed.data.type,
      creditType: parsed.data.creditType,
      amount: parsed.data.amount,
      notes: parsed.data.notes || "",
      expiresAt,
    },
    include: { user: { select: { id: true, name: true, diningHall: true } } },
  });

  // Check for auto-matches and notify the listing creator
  const complementaryType = listing.type === "OFFER" ? "REQUEST" : "OFFER";
  const matchCount = await db.listing.count({
    where: {
      type: complementaryType,
      creditType: listing.creditType,
      status: "ACTIVE",
      userId: { not: user.id },
      user: { diningHall: user.diningHall },
      expiresAt: { gt: new Date() },
    },
  });

  if (matchCount > 0) {
    await createNotification({
      userId: user.id,
      type: "AUTO_MATCH",
      title: `${matchCount} matching ${complementaryType.toLowerCase()}${matchCount > 1 ? "s" : ""} found`,
      message: `We found ${matchCount} ${complementaryType.toLowerCase()}${matchCount > 1 ? "s" : ""} matching your ${listing.creditType.toLowerCase()} credit ${listing.type.toLowerCase()}`,
      linkUrl: `/listing/${listing.id}`,
    });
  }

  return NextResponse.json(listing, { status: 201 });
}
