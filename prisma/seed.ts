import { PrismaClient } from "@prisma/client";

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
      email: "alice@nus.edu.sg",
      trackedCredits: 45,
      contactHandle: "@alice_tele",
    },
  });

  await prisma.user.create({
    data: {
      id: "bob",
      name: "Bob",
      email: "bob@nus.edu.sg",
      trackedCredits: 20,
      contactHandle: "@bob_tele",
    },
  });

  await prisma.user.create({
    data: {
      id: "charlie",
      name: "Charlie",
      email: "charlie@nus.edu.sg",
      trackedCredits: 72,
      contactHandle: "@charlie_tele",
    },
  });

  console.log("Seeded 3 users: Alice (45), Bob (20), Charlie (72)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
