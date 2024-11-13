-- CreateTable
CREATE TABLE "Users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "school" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL
);
