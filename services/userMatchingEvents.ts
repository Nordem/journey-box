// This file is no longer used. 
// All functionality has been moved to API routes:
// - /api/recommendations/route.ts
// - /api/events/route.ts
//
// Types have been moved to /types/index.ts

// npx tsc matchCollaborators.ts
// node matchCollaborators.js

import axios from "axios";
import { supabase } from "@/lib/supabase";

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

export async function getRecommendedEvents(userProfile: UserProfile): Promise<RecommendedEvent[]> {
  try {
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
      return [];
    }
    
    if (!events || events.length === 0) {
      console.log("No events found in database");
      return [];
    }

    const recommendedEvents: RecommendedEvent[] = [];
    
    for (const event of events) {
      const categoryName = Array.isArray(event.event_categories) && event.event_categories.length > 0 
        ? event.event_categories[0].name 
        : 'Uncategorized';

      const prompt = `Analyze this event and determine if it's a good match for the user. 
      If it's a match, provide a match score (0-100) and specific reasons why it matches.
      Format your response as JSON: { "isMatch": boolean, "score": number, "reasons": string[] }

Event:
- Name: ${event.name}
- Location: ${event.location}
- Date: ${event.date}
- Category: ${categoryName}
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
- Restrictions: ${Object.entries(userProfile.restrictions).map(([key, val]) => `${key}: ${val}`).join(", ")}`;

      try {
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4",
            messages: [
              { role: "system", content: "You are an expert event matcher AI. Respond with JSON only." },
              { role: "user", content: prompt },
            ],
            max_tokens: 500,
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
            const matchResult = JSON.parse(content);
            if (matchResult.isMatch) {
              recommendedEvents.push({
                ...event,
                matchScore: matchResult.score,
                matchReasons: matchResult.reasons
              });
            }
          } catch (parseError) {
            console.error(`Error parsing OpenAI response for event ${event.name}:`, parseError);
          }
        }
      } catch (error) {
        console.error(`Error matching event ${event.name}:`, error);
      }
    }

    // Sort by match score in descending order
    return recommendedEvents.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error("Error getting recommended events:", error);
    return [];
  }
}
