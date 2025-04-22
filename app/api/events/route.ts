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
      },
      orderBy: {
        createdAt: "desc",
      },
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
      { error: 'Error fetching events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const event = await prisma.event.create({
      data: {
        name: data.name,
        location: data.location,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        maxParticipants: parseInt(data.maxParticipants),
        originalPrice: parseFloat(data.originalPrice),
        finalPrice: parseFloat(data.finalPrice),
        tripManager: data.tripManager,
        hotelName: data.hotelName,
        hotelDescription: data.hotelDescription,
        hotelAmenities: data.hotelAmenities,
        hotelIncludes: data.hotelIncludes,
        hotelExcludes: data.hotelExcludes,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Error creating event" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();

    const event = await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        location: data.location,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        maxParticipants: parseInt(data.maxParticipants),
        originalPrice: parseFloat(data.originalPrice),
        finalPrice: parseFloat(data.finalPrice),
        tripManager: data.tripManager,
        hotelName: data.hotelName,
        hotelDescription: data.hotelDescription,
        hotelAmenities: data.hotelAmenities,
        hotelIncludes: data.hotelIncludes,
        hotelExcludes: data.hotelExcludes,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Error updating event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    await prisma.event.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Error deleting event" },
      { status: 500 }
    );
  }
} 