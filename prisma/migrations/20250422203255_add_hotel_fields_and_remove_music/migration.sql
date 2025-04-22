/*
  Warnings:

  - You are about to drop the column `music` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "music",
ADD COLUMN     "hotelAmenities" TEXT,
ADD COLUMN     "hotelDescription" TEXT,
ADD COLUMN     "hotelExcludes" TEXT[],
ADD COLUMN     "hotelIncludes" TEXT[],
ADD COLUMN     "hotelName" TEXT,
ADD COLUMN     "tripManager" TEXT;
