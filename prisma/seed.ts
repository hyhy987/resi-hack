import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { DiningHall } from "@/lib/constants";

const prisma = new PrismaClient();

// Demo password for all seeded users
const DEMO_PASSWORD = "password123";
const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

async function main() {
  await prisma.notification.deleteMany();
  await prisma.swapMessage.deleteMany();
  await prisma.swap.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      id: "alice",
      name: "Alice",
      diningHall: "RVRC" as DiningHall,
      nusId: "E1430273",
      passwordHash,
      breakfastCredits: 45,
      dinnerCredits: 45,
      contactHandle: "@alice_tele",
    },
  });

  await prisma.user.create({
    data: {
      id: "bob",
      name: "Bob",
      diningHall: "RVRC" as DiningHall,
      nusId: "E1837291",
      passwordHash,
      breakfastCredits: 20,
      dinnerCredits: 20,
      contactHandle: "@bob_tele",
    },
  });

  await prisma.user.create({
    data: {
      id: "charlie",
      name: "Charlie",
      diningHall: "RVRC" as DiningHall,
      nusId: "E1038391",
      passwordHash,
      breakfastCredits: 72,
      dinnerCredits: 72,
      contactHandle: "@charlie_tele",
    },
  });

  await prisma.user.create({
    data: {
      id: "david",
      name: "David",
      diningHall: "Cendana" as DiningHall,
      nusId: "E1182743",
      passwordHash,
      breakfastCredits: 50,
      dinnerCredits: 50,
      contactHandle: "@david_tele",
    },
  });

  // Seed demo listings
  const now = new Date();
  const expiry = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const listing1 = await prisma.listing.create({
    data: {
      userId: "alice",
      type: "OFFER",
      creditType: "BREAKFAST",
      amount: 3,
      notes: "Have extra breakfast credits this week, happy to swap!",
      status: "ACTIVE",
      expiresAt: expiry,
    },
  });

  await prisma.listing.create({
    data: {
      userId: "bob",
      type: "REQUEST",
      creditType: "DINNER",
      amount: 2,
      notes: "Running low on dinner credits, can trade breakfast credits",
      status: "ACTIVE",
      expiresAt: expiry,
    },
  });

  await prisma.listing.create({
    data: {
      userId: "charlie",
      type: "OFFER",
      creditType: "DINNER",
      amount: 3,
      notes: "Won't be eating dinner on campus this week",
      status: "ACTIVE",
      expiresAt: expiry,
    },
  });

  // Seed a demo swap with messages (Alice's listing, proposed by Bob)
  const swap = await prisma.swap.create({
    data: {
      listingId: listing1.id,
      proposerId: "bob",
      counterpartyId: "alice",
      amount: 2,
      status: "PROPOSED",
    },
  });

  await prisma.swapMessage.create({
    data: {
      swapId: swap.id,
      userId: "bob",
      message: "Hey Alice! I'd like to swap 2 breakfast credits. Does that work for you?",
    },
  });

  // --- Completed swaps for history & analytics ---
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
  const pastExpiry = (n: number) => new Date(daysAgo(n).getTime() + 48 * 60 * 60 * 1000);

  // Completed swap 1: Alice offered 2 breakfast to Bob (3 days ago)
  const pastListing1 = await prisma.listing.create({
    data: {
      userId: "alice",
      type: "OFFER",
      creditType: "BREAKFAST",
      amount: 2,
      notes: "Extra breakfast credits",
      status: "MATCHED",
      expiresAt: pastExpiry(3),
      createdAt: daysAgo(3),
    },
  });
  const completedSwap1 = await prisma.swap.create({
    data: {
      listingId: pastListing1.id,
      proposerId: "bob",
      counterpartyId: "alice",
      amount: 2,
      status: "COMPLETED",
      giverConfirmed: true,
      receiverConfirmed: true,
      createdAt: daysAgo(3),
    },
  });
  await prisma.swapMessage.create({
    data: {
      swapId: completedSwap1.id,
      userId: "bob",
      message: "Swap completed! 2 breakfast credits transferred successfully.",
      createdAt: daysAgo(3),
    },
  });

  // Completed swap 2: Bob offered 1 dinner to Charlie (2 days ago)
  const pastListing2 = await prisma.listing.create({
    data: {
      userId: "bob",
      type: "OFFER",
      creditType: "DINNER",
      amount: 1,
      notes: "Don't need dinner tonight",
      status: "MATCHED",
      expiresAt: pastExpiry(2),
      createdAt: daysAgo(2),
    },
  });
  const completedSwap2 = await prisma.swap.create({
    data: {
      listingId: pastListing2.id,
      proposerId: "charlie",
      counterpartyId: "bob",
      amount: 1,
      status: "COMPLETED",
      giverConfirmed: true,
      receiverConfirmed: true,
      createdAt: daysAgo(2),
    },
  });
  await prisma.swapMessage.create({
    data: {
      swapId: completedSwap2.id,
      userId: "charlie",
      message: "Swap completed! 1 dinner credit transferred successfully.",
      createdAt: daysAgo(2),
    },
  });

  // Completed swap 3: Charlie requested 3 breakfast from Alice (1 day ago)
  const pastListing3 = await prisma.listing.create({
    data: {
      userId: "charlie",
      type: "REQUEST",
      creditType: "BREAKFAST",
      amount: 3,
      notes: "Need breakfast credits for the week",
      status: "MATCHED",
      expiresAt: pastExpiry(1),
      createdAt: daysAgo(1),
    },
  });
  const completedSwap3 = await prisma.swap.create({
    data: {
      listingId: pastListing3.id,
      proposerId: "alice",
      counterpartyId: "charlie",
      amount: 3,
      status: "COMPLETED",
      giverConfirmed: true,
      receiverConfirmed: true,
      createdAt: daysAgo(1),
    },
  });
  await prisma.swapMessage.create({
    data: {
      swapId: completedSwap3.id,
      userId: "alice",
      message: "Swap completed! 3 breakfast credits transferred successfully.",
      createdAt: daysAgo(1),
    },
  });

  // Completed swap 4: Alice offered 2 dinner to Bob (5 days ago)
  const pastListing4 = await prisma.listing.create({
    data: {
      userId: "alice",
      type: "OFFER",
      creditType: "DINNER",
      amount: 2,
      notes: "Going home this weekend",
      status: "MATCHED",
      expiresAt: pastExpiry(5),
      createdAt: daysAgo(5),
    },
  });
  const completedSwap4 = await prisma.swap.create({
    data: {
      listingId: pastListing4.id,
      proposerId: "bob",
      counterpartyId: "alice",
      amount: 2,
      status: "COMPLETED",
      giverConfirmed: true,
      receiverConfirmed: true,
      createdAt: daysAgo(5),
    },
  });
  await prisma.swapMessage.create({
    data: {
      swapId: completedSwap4.id,
      userId: "alice",
      message: "Swap completed! 2 dinner credits transferred successfully.",
      createdAt: daysAgo(5),
    },
  });

  // Completed swap 5: Charlie offered 1 breakfast to Bob (today)
  const pastListing5 = await prisma.listing.create({
    data: {
      userId: "charlie",
      type: "OFFER",
      creditType: "BREAKFAST",
      amount: 1,
      notes: "Skipping breakfast today",
      status: "MATCHED",
      expiresAt: expiry,
      createdAt: daysAgo(0),
    },
  });
  const completedSwap5 = await prisma.swap.create({
    data: {
      listingId: pastListing5.id,
      proposerId: "bob",
      counterpartyId: "charlie",
      amount: 1,
      status: "COMPLETED",
      giverConfirmed: true,
      receiverConfirmed: true,
      createdAt: daysAgo(0),
    },
  });
  await prisma.swapMessage.create({
    data: {
      swapId: completedSwap5.id,
      userId: "bob",
      message: "Swap completed! 1 breakfast credit transferred successfully.",
      createdAt: daysAgo(0),
    },
  });

  // Seed some notifications for Alice
  await (prisma as any).notification.create({
    data: {
      userId: "alice",
      type: "SWAP_PROPOSED",
      title: "New swap proposal",
      message: "Bob proposed a swap for your breakfast credit listing",
      linkUrl: `/swap/${swap.id}`,
      read: false,
      createdAt: daysAgo(0),
    },
  });
  await (prisma as any).notification.create({
    data: {
      userId: "alice",
      type: "SWAP_COMPLETED",
      title: "Swap completed",
      message: "Your swap with Bob has been completed! 2 dinner credits transferred.",
      linkUrl: `/swap/${completedSwap4.id}`,
      read: true,
      createdAt: daysAgo(5),
    },
  });
  await (prisma as any).notification.create({
    data: {
      userId: "alice",
      type: "AUTO_MATCH",
      title: "1 matching request found",
      message: "We found 1 request matching your breakfast credit offer",
      linkUrl: `/listing/${listing1.id}`,
      read: false,
      createdAt: daysAgo(0),
    },
  });
  await (prisma as any).notification.create({
    data: {
      userId: "alice",
      type: "NEW_MESSAGE",
      title: "New message",
      message: "Bob: Hey Alice! I'd like to swap 2 breakfast credits. Does that work?",
      linkUrl: `/swap/${swap.id}`,
      read: false,
      createdAt: daysAgo(0),
    },
  });

  // Notifications for Bob
  await (prisma as any).notification.create({
    data: {
      userId: "bob",
      type: "SWAP_COMPLETED",
      title: "Swap completed",
      message: "Your swap with Alice has been completed! 2 breakfast credits received.",
      linkUrl: `/swap/${completedSwap1.id}`,
      read: true,
      createdAt: daysAgo(3),
    },
  });
  await (prisma as any).notification.create({
    data: {
      userId: "bob",
      type: "SWAP_ACCEPTED",
      title: "Swap accepted",
      message: "Charlie accepted your swap proposal",
      linkUrl: `/swap/${completedSwap5.id}`,
      read: false,
      createdAt: daysAgo(0),
    },
  });

  console.log(
    "Seeded 4 users, 8 listings, 6 swaps (5 completed), notifications (demo password: " +
      DEMO_PASSWORD +
      ")"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
