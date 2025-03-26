-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "music" TEXT[];
