import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

interface Category {
  id: string;
  name: string;
}

export async function GET() {
  try {
    // Try to fetch events from Prisma first
    const dbEvents = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        date: true,
        location: true,
        music: true,
        activities: true,
        category: true
      }
    });

    if (dbEvents.length > 0) {
      const events = dbEvents.map(event => ({
        id: event.id,
        name: event.name,
        date: event.date,
        location: event.location,
        music: event.music,
        activities: event.activities,
        category_name: event.category
      }));

      return NextResponse.json({ events });
    }

    // If no events in Prisma, try Supabase
    const { data: events, error } = await supabase
      .from('events')
      .select('*');

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    if (!events || events.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // Fetch categories for the events
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('*');

    if (categoryError) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Map events with their categories
    const eventsWithCategories = events.map(event => ({
      ...event,
      category_name: categories?.find(cat => cat.id === event.category_id)?.name
    }));

    return NextResponse.json({ events: eventsWithCategories });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 