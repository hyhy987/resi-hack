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

  console.log(
    "Seeded 4 users: Alice, Bob, Charlie, David (demo password: " +
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
