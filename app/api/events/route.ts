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
        hotelExcludes: true,
        imageUrl: true,
        galleryImages: true,
        itineraryActions: {
          select: {
            id: true,
            dayTitle: true,
            title: true,
            startTime: true,
            responsible: true
          }
        }
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
      hotelExcludes: event.hotelExcludes || [],
      imageUrl: event.imageUrl,
      galleryImages: event.galleryImages || [],
      itineraryActions: event.itineraryActions || []
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

    // Validate required fields
    if (!data.name || !data.location || !data.description || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        name: data.name,
        location: data.location,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        maxParticipants: parseInt(data.maxParticipants) || 0,
        originalPrice: parseFloat(data.originalPrice) || 0,
        finalPrice: parseFloat(data.finalPrice) || 0,
        tripManager: data.tripManager || "",
        hotelName: data.hotelName || "",
        hotelDescription: data.hotelDescription || "",
        hotelAmenities: data.hotelAmenities || [],
        hotelIncludes: data.hotelIncludes || [],
        hotelExcludes: data.hotelExcludes || [],
        imageUrl: data.imageUrl || "",
        galleryImages: data.galleryImages || [],
        itineraryActions: {
          create: (data.itineraryActions || []).map((action: any) => ({
            dayTitle: action.dayTitle || "",
            title: action.title || "",
            startTime: action.startTime || "",
            responsible: action.responsible || ""
          }))
        }
      },
      include: {
        itineraryActions: true
      }
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

    // Validate required fields
    if (!data.id || !data.name || !data.location || !data.description || !data.startDate || !data.endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // First, delete existing itinerary actions
    await prisma.eventItineraryActions.deleteMany({
      where: {
        eventId: data.id
      }
    });

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
        maxParticipants: parseInt(data.maxParticipants) || 0,
        originalPrice: parseFloat(data.originalPrice) || 0,
        finalPrice: parseFloat(data.finalPrice) || 0,
        tripManager: data.tripManager || "",
        hotelName: data.hotelName || "",
        hotelDescription: data.hotelDescription || "",
        hotelAmenities: data.hotelAmenities || [],
        hotelIncludes: data.hotelIncludes || [],
        hotelExcludes: data.hotelExcludes || [],
        imageUrl: data.imageUrl || "",
        galleryImages: data.galleryImages || [],
        itineraryActions: {
          create: (data.itineraryActions || []).map((action: any) => ({
            dayTitle: action.dayTitle || "",
            title: action.title || "",
            startTime: action.startTime || "",
            responsible: action.responsible || ""
          }))
        }
      },
      include: {
        itineraryActions: true
      }
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