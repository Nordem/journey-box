/*
  Warnings:

  - You are about to drop the column `categories` on the `EventPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `travelSeasons` on the `EventPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `additionalPreferences` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `interests` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventPreferences" DROP COLUMN "categories",
DROP COLUMN "travelSeasons",
ADD COLUMN     "seasonalPreferences" TEXT[];

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "additionalPreferences",
DROP COLUMN "interests",
ADD COLUMN     "additionalInfo" TEXT,
ADD COLUMN     "hobbiesAndInterests" TEXT[];
