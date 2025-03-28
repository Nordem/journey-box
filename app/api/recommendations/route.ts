import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import axios from "axios";
import { Event, Collaborator } from "@/types";

// Define OpenAI API response type
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Function to get events from database
async function getEvents() {
  try {
    const supabase = createClient();
    
    // Fetch events without attempting to join with categories
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
      console.error("Error fetching events:", error);
      return [];
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
    return events.map((event: any) => ({
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
    
  } catch (error) {
    console.error("Error reading events from database:", error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userProfile } = body;
    
    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile data is required" },
        { status: 400 }
      );
    }
    
    // Get events from database
    const events = await getEvents();
    
    if (!events.length) {
      return NextResponse.json({ events: [] });
    }
    
    const recommendedEvents = [];
    
    // Match events to user profile
    for (const event of events) {
      const prompt = `Determine if the following event is a good match for this user based on their profile, preferences, and restrictions:

Event:
- Name: ${event.name}
- Location: ${event.location}
- Date: ${event.date}
- Category: ${event.category_name || 'Uncategorized'}
- Music: ${event.music.join(", ")}
- Activities: ${event.activities.join(", ")}

User Profile:
- Name: ${userProfile.userProfile.name}
- Location: ${userProfile.userProfile.location}
- Current Travel Location: ${userProfile.userProfile.currentTravelLocation}
- Languages: ${userProfile.userProfile.languages.join(", ")}
- Personality Traits: ${userProfile.userProfile.personalityTraits.join(", ")}
- Goals: ${userProfile.userProfile.goals.join(", ")}
- Event Categories: ${userProfile.eventPreferences.categories.join(", ")}
- Vibe Keywords: ${userProfile.eventPreferences.vibeKeywords.join(", ")}
- Budget: ${userProfile.eventPreferences.budget}
- Max Distance (km): ${userProfile.eventPreferences.maxDistanceKm}
- Availability: ${!userProfile.calendarAvailability[event.date] ? "Available" : "Not Available"}
- Restrictions: ${Object.entries(userProfile.restrictions).map(([key, val]) => `${key}: ${val}`).join(", ")}

Only respond with "yes" if this is a good match, or "no" if it's not.`;

      try {
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4",
            messages: [
              { role: "system", content: "You are an expert event matcher AI. Respond only with 'yes' or 'no'." },
              { role: "user", content: prompt },
            ],
            max_tokens: 50,
          },
          {
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data as OpenAIResponse;
        if (data.choices && data.choices.length > 0) {
          const content = data.choices[0].message.content.trim().toLowerCase();
          if (content === "yes" || content.includes("yes")) {
            recommendedEvents.push(event);
          }
        }
      } catch (error) {
        console.error(`Error matching event ${event.name}:`, error);
      }
    }
    
    return NextResponse.json({ events: recommendedEvents });
  } catch (error) {
    console.error("Error in recommendations API:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
} 