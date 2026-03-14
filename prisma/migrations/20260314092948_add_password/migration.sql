/*
  Warnings:

  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `diningHall` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nusId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nusId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "diningHall" TEXT NOT NULL,
    "breakfastCredits" INTEGER NOT NULL DEFAULT 0,
    "dinnerCredits" INTEGER NOT NULL DEFAULT 0,
    "contactHandle" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("breakfastCredits", "contactHandle", "createdAt", "diningHall", "dinnerCredits", "id", "name", "nusId") SELECT "breakfastCredits", "contactHandle", "createdAt", "diningHall", "dinnerCredits", "id", "name", "nusId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_nusId_key" ON "User"("nusId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
