import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const now = new Date();

  // Lazy-expire
  await db.listing.updateMany({
    where: { status: "ACTIVE", expiresAt: { lt: now } },
    data: { status: "EXPIRED" },
  });

  // Active listings in user's dining hall
  const activeListings = await db.listing.findMany({
    where: {
      status: "ACTIVE",
      user: { diningHall: user.diningHall },
    },
    include: { user: { select: { diningHall: true } } },
  });

  const activeOffers = activeListings.filter((l) => l.type === "OFFER");
  const activeRequests = activeListings.filter((l) => l.type === "REQUEST");

  // Completed swaps in user's dining hall
  const completedSwaps = await db.swap.findMany({
    where: {
      status: "COMPLETED",
      listing: { user: { diningHall: user.diningHall } },
    },
    include: {
      listing: true,
      proposer: { select: { name: true } },
      counterparty: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate total credits traded
  const totalCreditsTraded = completedSwaps.reduce((sum, s) => sum + s.amount, 0);

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentSwaps = completedSwaps.filter(
    (s) => s.createdAt >= sevenDaysAgo
  );

  const activityByDate: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    activityByDate[key] = 0;
  }
  for (const swap of recentSwaps) {
    const key = swap.createdAt.toISOString().split("T")[0];
    if (activityByDate[key] !== undefined) {
      activityByDate[key]++;
    }
  }

  const recentActivity = Object.entries(activityByDate).map(([date, swaps]) => ({
    date,
    swaps,
  }));

  // Top traders (by completed swap count)
  const traderCounts: Record<string, { name: string; count: number }> = {};
  for (const swap of completedSwaps) {
    const pName = swap.proposer.name;
    const cName = swap.counterparty.name;
    if (!traderCounts[pName]) traderCounts[pName] = { name: pName, count: 0 };
    if (!traderCounts[cName]) traderCounts[cName] = { name: cName, count: 0 };
    traderCounts[pName].count++;
    traderCounts[cName].count++;
  }
  const topTraders = Object.values(traderCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const stats = {
    diningHall: user.diningHall,
    activeOffers: activeOffers.length,
    activeRequests: activeRequests.length,
    totalActiveCredits: activeListings.reduce((sum, l) => sum + l.amount, 0),
    completedSwaps: completedSwaps.length,
    totalCreditsTraded,
    breakfastOffers: activeOffers.filter((l) => l.creditType === "BREAKFAST").length,
    dinnerOffers: activeOffers.filter((l) => l.creditType === "DINNER").length,
    breakfastRequests: activeRequests.filter((l) => l.creditType === "BREAKFAST").length,
    dinnerRequests: activeRequests.filter((l) => l.creditType === "DINNER").length,
    recentActivity,
    topTraders,
  };

  return NextResponse.json(stats);
}
