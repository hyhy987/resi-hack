import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createListingSchema } from "@/lib/validations";
import { MAX_DAILY_LISTINGS, EXPIRY_HOURS } from "@/lib/constants";
import { Prisma } from "@prisma/client";
import { z } from "zod";

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

  const now = new Date();

  // 2. Lazy-expire listings
  await db.listing.updateMany({
    where: { status: "ACTIVE", expiresAt: { lt: now } },
    data: { status: "EXPIRED" },
  });

  let where: Prisma.ListingWhereInput = {};

  if (userIdParam) {
    where = {
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
    };
  } else {
    where = {
      status: "ACTIVE",
      user: { diningHall: user.diningHall },
    };
    if (type) where.type = type;
    if (creditType) where.creditType = creditType; // Filter by meal type
  }

  const listings = await db.listing.findMany({
    where,
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
    orderBy: { createdAt: "desc" },
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
      { error: `Max ${MAX_DAILY_LISTINGS} listings per day` },
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

  return NextResponse.json(listing, { status: 201 });
}
