-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('ADVENTURE', 'CULTURAL', 'NATURE', 'URBAN', 'BEACH', 'MOUNTAIN', 'GASTRONOMY', 'WELLNESS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "currentTravelLocation" TEXT,
    "languages" TEXT[],
    "personalityTraits" TEXT[],
    "hobbiesAndInterests" TEXT[],
    "additionalInfo" TEXT,
    "nearestAirport" TEXT,
    "goals" TEXT[],
    "phone" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPreferences" (
    "id" TEXT NOT NULL,
    "preferredExperiences" TEXT[],
    "preferredDestinations" TEXT[],
    "seasonalPreferences" TEXT[],
    "groupSizePreference" TEXT[],
    "blockedDates" TIMESTAMP(3)[],
    "categories" TEXT[],
    "vibeKeywords" TEXT[],
    "budget" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EventPreferences_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Restrictions" (
    "id" TEXT NOT NULL,
    "avoidCrowdedDaytimeConferences" BOOLEAN NOT NULL DEFAULT false,
    "avoidOverlyFormalNetworking" BOOLEAN NOT NULL DEFAULT false,
    "avoidFamilyKidsEvents" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Restrictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL,
    "recentEventsAttended" TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventFeedback" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,

    CONSTRAINT "EventFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdealOutcome" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "IdealOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Mexico',
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "highlights" TEXT[],
    "isHighlight" BOOLEAN NOT NULL DEFAULT false,
    "maxParticipants" INTEGER,
    "originalPrice" DOUBLE PRECISION,
    "finalPrice" DOUBLE PRECISION,
    "tripManager" TEXT,
    "hotelName" TEXT,
    "hotelDescription" TEXT,
    "hotelAmenities" TEXT[],
    "hotelIncludes" TEXT[],
    "hotelExcludes" TEXT[],
    "imageUrl" TEXT,
    "galleryImages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventPreferences_userId_key" ON "EventPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamBuildingPreferences_eventPreferencesId_key" ON "TeamBuildingPreferences"("eventPreferencesId");

-- CreateIndex
CREATE UNIQUE INDEX "Restrictions_userId_key" ON "Restrictions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "History_userId_key" ON "History"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TravelAvailability_userId_key" ON "TravelAvailability"("userId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPreferences" ADD CONSTRAINT "EventPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamBuildingPreferences" ADD CONSTRAINT "TeamBuildingPreferences_eventPreferencesId_fkey" FOREIGN KEY ("eventPreferencesId") REFERENCES "EventPreferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restrictions" ADD CONSTRAINT "Restrictions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFeedback" ADD CONSTRAINT "EventFeedback_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "History"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdealOutcome" ADD CONSTRAINT "IdealOutcome_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventItineraryActions" ADD CONSTRAINT "EventItineraryActions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDestinations" ADD CONSTRAINT "UserDestinations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentDestination" ADD CONSTRAINT "RecentDestination_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelAvailability" ADD CONSTRAINT "TravelAvailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
