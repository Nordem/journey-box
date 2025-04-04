-- AlterTable
ALTER TABLE "EventPreferences" ADD COLUMN     "budget" TEXT,
ADD COLUMN     "categories" TEXT[],
ADD COLUMN     "vibeKeywords" TEXT[];
