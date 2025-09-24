/*
  Warnings:

  - Made the column `data` on table `timetableUpdate` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_timetableUpdate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "data" TEXT NOT NULL
);
INSERT INTO "new_timetableUpdate" ("data", "date", "id") SELECT "data", "date", "id" FROM "timetableUpdate";
DROP TABLE "timetableUpdate";
ALTER TABLE "new_timetableUpdate" RENAME TO "timetableUpdate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
