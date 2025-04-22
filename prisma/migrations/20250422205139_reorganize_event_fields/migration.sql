/*
  Warnings:

  - You are about to drop the column `activities` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "activities",
DROP COLUMN "date",
ALTER COLUMN "city" DROP NOT NULL;
