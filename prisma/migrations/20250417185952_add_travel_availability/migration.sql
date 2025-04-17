-- CreateTable
CREATE TABLE "UserDestinations" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "isArkusTrip" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDestinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentDestination" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "isArkusTrip" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RecentDestination_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserDestinations" ADD CONSTRAINT "UserDestinations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentDestination" ADD CONSTRAINT "RecentDestination_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
