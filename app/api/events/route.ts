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
        price: true,
        startDate: true,
        state: true,
        date: true,
        location: true,
        music: true
      }
    });

    if (!events || events.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // Format the events to match the expected interface
    const formattedEvents = events.map(event => ({
      id: event.id,
      name: event.name,
      location: event.location || `${event.city}, ${event.state || event.country}`,
      date: event.date?.toISOString() || event.startDate.toISOString(),
      music: event.music || [],
      activities: event.activities || [],
      category_name: event.category,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      price: event.price,
      maxParticipants: event.maxParticipants,
      isHighlight: event.isHighlight,
      highlights: event.highlights || [],
      city: event.city,
      state: event.state,
      country: event.country
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