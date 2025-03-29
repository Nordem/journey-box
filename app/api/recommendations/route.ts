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
    console.log("Fetching events from Supabase...");
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
    
    if (!events || events.length === 0) {
      console.log("No events found in database");
      return [];
    }
    
    console.log(`Found ${events.length} events in database`);
    
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
    
    console.log("Received recommendation request for user:", userProfile?.userProfile?.name);
    
    if (!userProfile) {
      console.error("No user profile provided");
      return NextResponse.json(
        { error: "User profile data is required" },
        { status: 400 }
      );
    }
    
    // Get events from database
    const events = await getEvents();
    
    if (!events.length) {
      console.log("No events available for recommendations");
      return NextResponse.json({ events: [] });
    }
    
    const recommendedEvents = [];
    
    // Match events to user profile
    for (const event of events) {
      console.log(`Analyzing event: ${event.name}`);
      
      // Basic matching based on user preferences
      const userCategories = userProfile.eventPreferences?.categories || [];
      const userVibeKeywords = userProfile.eventPreferences?.vibeKeywords || [];
      
      // Check if event category matches user preferences
      const categoryMatch = userCategories.includes(event.category_name);
      
      // Check if event activities match user vibe keywords
      const activityMatch = event.activities.some((activity: string) => 
        userVibeKeywords.some((keyword: string) => 
          activity.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      
      // Check if user is available on event date
      const isAvailable = !userProfile.calendarAvailability?.[event.date];
      
      // Check if event location is within user's max distance
      const maxDistance = userProfile.eventPreferences?.maxDistanceKm || 100;
      // Note: This is a simplified distance check. In production, you'd want to use actual distance calculation
      const locationMatch = true; // Placeholder for actual distance calculation
      
      // If all basic criteria match, add to recommendations
      if (categoryMatch && activityMatch && isAvailable && locationMatch) {
        console.log(`Event ${event.name} matched user preferences`);
        recommendedEvents.push(event);
        continue; // Skip OpenAI API call if basic matching succeeds
      }
      
      // If basic matching fails, try OpenAI for more nuanced matching
      if (OPENAI_API_KEY) {
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
              console.log(`OpenAI matched event ${event.name}`);
              recommendedEvents.push(event);
            }
          }
        } catch (error) {
          console.error(`Error matching event ${event.name} with OpenAI:`, error);
        }
      }
    }
    
    console.log(`Found ${recommendedEvents.length} recommended events`);
    return NextResponse.json({ events: recommendedEvents });
  } catch (error) {
    console.error("Error in recommendations API:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
} 