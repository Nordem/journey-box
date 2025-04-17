-- CreateTable
CREATE TABLE "TravelAvailability" (
    "id" TEXT NOT NULL,
    "currentYear" BOOLEAN NOT NULL DEFAULT true,
    "nextYear" BOOLEAN NOT NULL DEFAULT true,
    "followingYear" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravelAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravelAvailability_userId_key" ON "TravelAvailability"("userId");

-- AddForeignKey
ALTER TABLE "TravelAvailability" ADD CONSTRAINT "TravelAvailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; 