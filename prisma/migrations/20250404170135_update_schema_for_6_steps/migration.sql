/*
  Warnings:

  - You are about to drop the column `budget` on the `EventPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `idealTimeSlots` on the `EventPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `maxDistanceKm` on the `EventPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `preferredEventSize` on the `EventPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `preferredGroupType` on the `EventPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `vibeKeywords` on the `EventPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `goals` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventPreferences" DROP COLUMN "budget",
DROP COLUMN "idealTimeSlots",
DROP COLUMN "maxDistanceKm",
DROP COLUMN "preferredEventSize",
DROP COLUMN "preferredGroupType",
DROP COLUMN "vibeKeywords",
ADD COLUMN     "blockedDates" TIMESTAMP(3)[],
ADD COLUMN     "groupSizePreference" TEXT[],
ADD COLUMN     "preferredDestinations" TEXT[],
ADD COLUMN     "preferredExperiences" TEXT[],
ADD COLUMN     "travelSeasons" TEXT[];

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "goals",
ADD COLUMN     "additionalPreferences" TEXT,
ADD COLUMN     "interests" TEXT[],
ADD COLUMN     "nearestAirport" TEXT;

-- CreateTable
CREATE TABLE "TeamBuildingPreferences" (
    "id" TEXT NOT NULL,
    "preferredActivities" TEXT[],
    "location" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "suggestions" TEXT,
    "eventPreferencesId" TEXT NOT NULL,

    CONSTRAINT "TeamBuildingPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamBuildingPreferences_eventPreferencesId_key" ON "TeamBuildingPreferences"("eventPreferencesId");

-- AddForeignKey
ALTER TABLE "TeamBuildingPreferences" ADD CONSTRAINT "TeamBuildingPreferences_eventPreferencesId_fkey" FOREIGN KEY ("eventPreferencesId") REFERENCES "EventPreferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
