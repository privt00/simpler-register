/*
  Warnings:

  - Added the required column `password` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "school" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Users" ("id", "school", "secret", "subdomain", "username") SELECT "id", "school", "secret", "subdomain", "username" FROM "Users";
DROP TABLE "Users";
ALTER TABLE "new_Users" RENAME TO "Users";
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
