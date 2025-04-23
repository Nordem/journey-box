-- CreateTable
CREATE TABLE "EventItineraryActions" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "dayTitle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "responsible" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventItineraryActions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventItineraryActions" ADD CONSTRAINT "EventItineraryActions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE; 