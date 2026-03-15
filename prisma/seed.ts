import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { DiningHall } from "@/lib/constants";

const prisma = new PrismaClient();

// Demo password for all seeded users
const DEMO_PASSWORD = "password123";
const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

async function main() {
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

  console.log(
    "Seeded 4 users, 3 listings, 1 swap with message (demo password: " +
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
