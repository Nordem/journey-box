import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch events from Prisma
    const events = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        city: true,
        state: true,
        country: true,
        description: true,
        startDate: true,
        endDate: true,
        highlights: true,
        isHighlight: true,
        maxParticipants: true,
        originalPrice: true,
        finalPrice: true,
        tripManager: true,
        hotelName: true,
        hotelDescription: true,
        hotelAmenities: true,
        hotelIncludes: true,
        hotelExcludes: true
      }
    });

    if (!events || events.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // Format the events to match the expected interface
    const formattedEvents = events.map(event => ({
      id: event.id,
      name: event.name,
      location: event.location,
      city: event.city,
      state: event.state,
      country: event.country,
      description: event.description,
      startDate: event.startDate?.toISOString() || null,
      endDate: event.endDate?.toISOString() || null,
      highlights: event.highlights || [],
      maxParticipants: event.maxParticipants,
      originalPrice: event.originalPrice,
      finalPrice: event.finalPrice,
      isHighlight: event.isHighlight,
      tripManager: event.tripManager,
      hotelName: event.hotelName,
      hotelDescription: event.hotelDescription,
      hotelAmenities: event.hotelAmenities || [],
      hotelIncludes: event.hotelIncludes || [],
      hotelExcludes: event.hotelExcludes || []
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch events' },
      { status: 500 }
    );
  }
} 