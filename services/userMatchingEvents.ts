// This file is no longer used. 
// All functionality has been moved to API routes:
// - /api/recommendations/route.ts
// - /api/events/route.ts
//
// Types have been moved to /types/index.ts

// npx tsc matchCollaborators.ts
// node matchCollaborators.js

import axios from "axios";

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
    const eventsResponse = await fetch('/api/events', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!eventsResponse.ok) {
      throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
    }
    
    const eventsData = await eventsResponse.json();
    const events = eventsData.events;
    
    if (!events || events.length === 0) {
      console.log("No events found in database");
      return [];
    }

    console.log(`Found ${events.length} events to analyze`);
    const recommendedEvents: RecommendedEvent[] = [];

    // Format events list with more details
    const eventsList = events.map((event: Event) => `
Event: ${event.name}
Location: ${event.location}
Date: ${event.date}
Category: ${event.category_id || 'Uncategorized'}
Music: ${event.music.join(", ")}
Activities: ${event.activities.join(", ")}
---`).join("\n");

    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: "You are an expert event matcher AI. Your task is to analyze multiple events and determine which ones match a user's profile and preferences. Consider all aspects of the user's profile and the event details to make comprehensive match assessments. Respond with JSON only." 
          },
          { 
            role: "user", 
            content: `Analyze these events and determine which ones are good matches for the user based on their profile and preferences.

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
- Calendar Availability: ${Object.entries(userProfile.calendarAvailability).map(([date, status]) => `${date}: ${status}`).join(", ")}

For each event, provide a match score (0-100) and specific reasons why it matches or doesn't match.
Format your response as JSON: { "matches": [{ "eventName": string, "isMatch": boolean, "score": number, "reasons": string[] }] }`
          }
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

    const openaiData = openaiResponse.data as OpenAIResponse;
    if (openaiData.choices && openaiData.choices.length > 0) {
      const content = openaiData.choices[0].message.content.trim();
      try {
        // Clean the response to ensure it's valid JSON
        const cleanContent = content.replace(/^[^{]*({.*})[^}]*$/, '$1');
        const matchResults = JSON.parse(cleanContent);
        if (matchResults.matches) {
          matchResults.matches.forEach((match: any) => {
            if (match.isMatch && match.score >= 60) {
              const event = events.find((e: Event) => e.name === match.eventName);
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
        console.error("Raw response:", content);
      }
    }

    return recommendedEvents.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error("Error in getRecommendedEvents:", error);
    return [];
  }
}
