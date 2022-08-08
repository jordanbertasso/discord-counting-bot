-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CountChannel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "discordID" TEXT NOT NULL,
    "hardMode" BOOLEAN NOT NULL DEFAULT false,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "lastCountTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastNumberSenderDiscordID" TEXT NOT NULL DEFAULT '',
    "serverId" INTEGER NOT NULL,
    CONSTRAINT "CountChannel_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CountChannel" ("createdAt", "currentCount", "discordID", "id", "lastCountTime", "lastNumberSenderDiscordID", "recordCount", "serverId", "updatedAt") SELECT "createdAt", "currentCount", "discordID", "id", "lastCountTime", "lastNumberSenderDiscordID", "recordCount", "serverId", "updatedAt" FROM "CountChannel";
DROP TABLE "CountChannel";
ALTER TABLE "new_CountChannel" RENAME TO "CountChannel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
