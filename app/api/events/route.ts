import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

interface Category {
  id: string;
  name: string;
}

export async function GET() {
  try {
    console.log("Starting events fetch...");
    
    // Try to fetch events from database
    try {
      // First try to get events from Prisma
      try {
        console.log("Attempting to fetch events from Prisma...");
        const dbEvents = await prisma.event.findMany({
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
            startDate: true,
            activities: true,
            category: true
          }
        });
        
        if (dbEvents && dbEvents.length > 0) {
          console.log(`Found ${dbEvents.length} events in Prisma`);
          // Transform Prisma events to match the expected format
          const formattedEvents = dbEvents.map(event => ({
            id: event.id,
            name: event.name,
            location: `${event.city}, ${event.country}`,
            date: event.startDate.toISOString().split('T')[0],
            music: [], // Music not in new schema
            activities: event.activities,
            category_name: event.category
          }));
          
          return NextResponse.json({ 
            events: formattedEvents,
            source: "prisma"
          });
        }
        
        console.log("No events found in Prisma, trying Supabase...");
      } catch (prismaError) {
        console.error("Prisma query failed:", prismaError);
      }
      
      // Try Supabase if Prisma failed
      console.log("Attempting to fetch events from Supabase...");
      const { data: events, error } = await supabase
        .from('events')
        .select(`
          id,
          name,
          location,
          date,
          music,
          activities,
          category_id
        `);
      
      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }
      
      if (!events || events.length === 0) {
        console.log("No events found in Supabase");
        return NextResponse.json({ events: [], source: "empty_supabase" });
      }
      
      console.log(`Found ${events.length} events in Supabase`);
      
      // Fetch categories separately if needed
      const categoriesMap: Record<string, string> = {};
      try {
        const { data: categoriesData } = await supabase
          .from('event_categories')
          .select('id, name');
          
        if (categoriesData) {
          categoriesData.forEach((cat: any) => {
            if (cat.id) categoriesMap[cat.id] = cat.name;
          });
        }
      } catch (categoryError) {
        console.error("Error fetching categories:", categoryError);
        // Continue without categories, not fatal
      }
      
      // Transform the data to match our Event interface
      const formattedEvents = events.map((event: any) => ({
        id: event.id,
        name: event.name,
        location: event.location,
        date: event.date,
        music: Array.isArray(event.music) ? event.music : [],
        activities: Array.isArray(event.activities) ? event.activities : [],
        category_id: event.category_id,
        category_name: event.category_id && categoriesMap[event.category_id] 
          ? categoriesMap[event.category_id] 
          : 'Uncategorized'
      }));
      
      return NextResponse.json({ 
        events: formattedEvents,
        source: "supabase"
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Return empty array instead of mock data
      return NextResponse.json({ 
        events: [],
        source: "error" 
      });
    }
  } catch (error) {
    console.error("Error in events API:", error);
    // Return empty array for any error
    return NextResponse.json({ 
      events: [],
      source: "error"
    });
  }
} 