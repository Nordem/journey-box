import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch events from Prisma
    const events = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        activities: true,
        category: true,
        city: true,
        country: true,
        description: true,
        endDate: true,
        highlights: true,
        isHighlight: true,
        maxParticipants: true,
        originalPrice: true,
        finalPrice: true,
        startDate: true,
        state: true
      }
    });

    if (!events || events.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // Format the events to match the expected interface
    const formattedEvents = events.map(event => ({
      id: event.id,
      name: event.name,
      category: event.category,
      city: event.city,
      state: event.state,
      country: event.country,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      activities: event.activities || [],
      highlights: event.highlights || [],
      maxParticipants: event.maxParticipants,
      originalPrice: event.originalPrice,
      finalPrice: event.finalPrice,
      isHighlight: event.isHighlight
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