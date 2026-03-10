import { PrismaClient } from "@prisma/client";
import { DiningHall } from "@/lib/constants";

const prisma = new PrismaClient();

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
      NUSID: "e1430273",
      trackedCredits: 45,
      contactHandle: "@alice_tele",
    },
  });

  await prisma.user.create({
    data: {
      id: "bob",
      name: "Bob",
      diningHall: "RVRC" as DiningHall,
      NUSID: "e1837291",
      trackedCredits: 20,
      contactHandle: "@bob_tele",
    },
  });

  await prisma.user.create({
    data: {
      id: "charlie",
      name: "Charlie",
      diningHall: "RVRC" as DiningHall,
      NUSID: "e1038391",
      trackedCredits: 72,
      contactHandle: "@charlie_tele",
    },
  });

  await prisma.user.create({
    data: {
      id: "david",
      name: "David",
      diningHall: "Cendana" as DiningHall,
      NUSID: "e1182743",
      trackedCredits: 50,
      contactHandle: "@david_tele",
    },
  });

  console.log("Seeded 4 users: Alice (45), Bob (20), Charlie (72), David (50)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
