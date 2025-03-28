import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

interface Category {
  id: string;
  name: string;
}

export async function GET() {
  try {
    // Try to fetch events from database
    try {
      // First try to get events from Prisma
      try {
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
        
        // Return empty array if no events found in Prisma
        console.log("No events found in Prisma database");
        return NextResponse.json({ events: [], source: "empty_prisma" });
      } catch (prismaError) {
        console.error("Prisma query failed:", prismaError);
        // Continue to try Supabase
      }
      
      // Try Supabase if Prisma failed
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
        throw error; // Will be caught by outer catch
      }
      
      if (!events || events.length === 0) {
        console.log("No events found in Supabase");
        return NextResponse.json({ events: [], source: "empty_supabase" });
      }
      
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