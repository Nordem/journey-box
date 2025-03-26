/*
  Warnings:

  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `music` on the `Event` table. All the data in the column will be lost.
  - Added the required column `category` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('ADVENTURE', 'CULTURAL', 'NATURE', 'URBAN', 'BEACH', 'MOUNTAIN', 'GASTRONOMY', 'WELLNESS');

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "date",
DROP COLUMN "location",
DROP COLUMN "music",
ADD COLUMN     "category" "EventCategory" NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Mexico',
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "highlights" TEXT[],
ADD COLUMN     "isHighlight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxParticipants" INTEGER,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "state" TEXT;
