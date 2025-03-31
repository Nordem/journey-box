import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import axios from "axios";

// Define OpenAI API response type
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface Event {
  id: string;
  name: string;
  location: string;
  date: string;
  music: string[];
  activities: string[];
  category_id?: string;
  category_name?: string;
}

export interface UserProfile {
  userProfile: {
    name: string;
    location: string;
    currentTravelLocation: string;
    languages: string[];
    personalityTraits: string[];
    goals: string[];
  };
  eventPreferences: {
    categories: string[];
    vibeKeywords: string[];
    idealTimeSlots: string[];
    budget: string;
    preferredGroupType: string[];
    preferredEventSize: string[];
    maxDistanceKm: number;
  };
  restrictions: {
    avoidCrowdedDaytimeConferences: boolean;
    avoidOverlyFormalNetworking: boolean;
  };
  calendarAvailability: Record<string, string>;
}

export interface RecommendedEvent extends Event {
  matchScore: number;
  matchReasons: string[];
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userProfile } = body;
    
    console.log("Received recommendation request for user:", userProfile?.userProfile?.name);
    console.log("User profile data:", JSON.stringify(userProfile, null, 2));
    
    if (!userProfile) {
      console.error("No user profile provided");
      return NextResponse.json(
        { error: "User profile data is required" },
        { status: 400 }
      );
    }
    
    if (!userProfile.userProfile || !userProfile.eventPreferences) {
      console.error("Invalid user profile data structure");
      return NextResponse.json(
        { error: "Invalid user profile data structure" },
        { status: 400 }
      );
    }

    console.log("Fetching events for user:", userProfile.userProfile.name);
    
    // Fetch all events from database
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        name,
        location,
        date,
        music,
        activities,
        category_id,
        event_categories!inner(name)
      `);
    
    if (error) {
      console.error("Error fetching events:", error);
      return NextResponse.json({ events: [] });
    }
    
    if (!events || events.length === 0) {
      console.log("No events found in database");
      return NextResponse.json({ events: [] });
    }

    console.log(`Found ${events.length} total events to analyze`);
    const recommendedEvents: RecommendedEvent[] = [];

    // Create a list of all events for the prompt
    const eventsList = events.map(event => {
      const categoryName = Array.isArray(event.event_categories) && event.event_categories.length > 0 
        ? event.event_categories[0].name 
        : 'Uncategorized';
      
      return {
        name: event.name,
        location: event.location,
        date: event.date,
        category: categoryName,
        music: event.music.join(", "),
        activities: event.activities.join(", ")
      };
    }).join("\n");

    const prompt = `You are an expert event matcher AI. Analyze these events and determine which ones are good matches for the user based on their profile and preferences.
    Consider the following matching criteria for each event:
    1. Event category matches user's preferred categories
    2. Event activities align with user's goals and personality
    3. Event vibe matches user's vibe keywords
    4. Event location is within user's max distance
    5. Event respects user's restrictions
    6. Event timing works with user's calendar availability

    For each event, provide a match score (0-100) and specific reasons why it matches or doesn't match.
    Format your response as JSON: { "matches": [{ "eventName": string, "isMatch": boolean, "score": number, "reasons": string[] }] }

    Available Events:
    ${eventsList}

    User Profile:
    - Name: ${userProfile.userProfile.name}
    - Location: ${userProfile.userProfile.location}
    - Current Travel Location: ${userProfile.userProfile.currentTravelLocation}
    - Languages: ${userProfile.userProfile.languages.join(", ")}
    - Personality Traits: ${userProfile.userProfile.personalityTraits.join(", ")}
    - Goals: ${userProfile.userProfile.goals.join(", ")}
    - Preferred Categories: ${userProfile.eventPreferences.categories.join(", ")}
    - Vibe Keywords: ${userProfile.eventPreferences.vibeKeywords.join(", ")}
    - Budget: ${userProfile.eventPreferences.budget}
    - Max Distance: ${userProfile.eventPreferences.maxDistanceKm} km
    - Restrictions: ${Object.entries(userProfile.restrictions).map(([key, val]) => `${key}: ${val}`).join(", ")}
    - Calendar Availability: ${Object.entries(userProfile.calendarAvailability).map(([date, status]) => `${date}: ${status}`).join(", ")}`;

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            { 
              role: "system", 
              content: "You are an expert event matcher AI. Your task is to analyze multiple events and determine which ones match a user's profile and preferences. Consider all aspects of the user's profile and the event details to make comprehensive match assessments. Respond with JSON only." 
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 1000,
          temperature: 0.7,
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
        const content = data.choices[0].message.content.trim();
        try {
          const matchResults = JSON.parse(content);
          if (matchResults.matches) {
            // Process each match result
            matchResults.matches.forEach((match: any) => {
              if (match.isMatch && match.score >= 60) {
                const event = events.find(e => e.name === match.eventName);
                if (event) {
                  recommendedEvents.push({
                    ...event,
                    matchScore: match.score,
                    matchReasons: match.reasons
                  });
                }
              }
            });
          }
        } catch (parseError) {
          console.error("Error parsing OpenAI response:", parseError);
        }
      }
    } catch (error) {
      console.error("Error matching events:", error);
    }

    console.log(`Found ${recommendedEvents.length} matching events`);
    return NextResponse.json({ events: recommendedEvents.sort((a, b) => b.matchScore - a.matchScore) });
  } catch (error) {
    console.error("Error in recommendations API:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
} 