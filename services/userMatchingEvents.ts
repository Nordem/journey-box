// This file is no longer used. 
// All functionality has been moved to API routes:
// - /api/recommendations/route.ts
// - /api/events/route.ts
//
// Types have been moved to /types/index.ts

// npx tsc matchCollaborators.ts
// node matchCollaborators.js

import * as fs from "fs/promises";
import * as path from "path";
import axios from "axios";
import { createClient } from "@/lib/supabase/server";

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

export interface Collaborator {
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
  history: {
    recentEventsAttended: string[];
    eventFeedback: Record<string, string>;
  };
  idealOutcomes: string[];
  calendarAvailability: Record<string, string>;
  deliverables: Array<{
    title: string;
    date: string;
    note: string;
  }>;
}

const dirPath = path.resolve(__dirname);
const eventsPath = path.join(dirPath, "events.json");
const collaboratorsPath = path.join(dirPath, "collaborators.json");
const suggestionsPath = path.join(dirPath, "suggestions.json");

// Check if files exist
async function checkFiles() {
  try {
    await fs.access(eventsPath);
    await fs.access(collaboratorsPath);
  } catch {
    console.error("Error: JSON files not found. Ensure 'events.json' and 'collaborators.json' exist.");
    process.exit(1);
  }
}

// Read JSON files
async function readFiles() {
  try {
    const eventsData = await fs.readFile(eventsPath, "utf-8");
    const collaboratorsData = await fs.readFile(collaboratorsPath, "utf-8");
    return {
      events: JSON.parse(eventsData) as Event[],
      collaborators: JSON.parse(collaboratorsData) as Collaborator[],
    };
  } catch (error) {
    console.error("Error reading JSON files:", error);
    process.exit(1);
  }
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Function to get events from database
export async function readEvents(): Promise<Event[]> {
  try {
    // Server-side Supabase client
    const supabase = createClient();
    
    // Fetch events and join with categories
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
        event_categories(name)
      `);
    
    if (error) {
      console.error("Error fetching events:", error);
      return []; // Return empty array if database query fails
    }
    
    if (!events || events.length === 0) {
      console.log("No events found in database");
      return []; // Return empty array if no events
    }
    
    // Transform the data to match our Event interface
    return events.map(event => ({
      id: event.id,
      name: event.name,
      location: event.location,
      date: event.date,
      music: Array.isArray(event.music) ? event.music : [],
      activities: Array.isArray(event.activities) ? event.activities : [],
      category_id: event.category_id,
      category_name: event.event_categories && typeof event.event_categories === 'object' ? 
        (event.event_categories as any).name : undefined
    }));
    
  } catch (error) {
    console.error("Error reading events from database:", error);
    return []; // Return empty array on error
  }
}

export async function getOpenAISuggestions(event: Event, collaborators: Collaborator[]): Promise<string[]> {
  const prompt = `Choose the best-fit collaborators for the following event based on compatibility with location, availability on ${event.date}, salary, personality traits, goals, event preferences, restrictions, and interests:

Event:
- Name: ${event.name}
- Location: ${event.location}
- Date: ${event.date}
- Music: ${event.music.join(", ")}
- Activities: ${event.activities.join(", ")}

Collaborators:
${collaborators.map(col => `Name: ${col.userProfile.name}, Location: ${col.userProfile.location}, CurrentTravelLocation: ${col.userProfile.currentTravelLocation}, SalaryRange: ${col.eventPreferences.budget}, Available: ${!col.calendarAvailability[event.date]}, Personality: ${col.userProfile.personalityTraits.join(", ")}, Goals: ${col.userProfile.goals.join(", ")}, Categories: ${col.eventPreferences.categories.join(", ")}, Restrictions: ${Object.entries(col.restrictions).map(([key, val]) => `${key}: ${val}`).join(", ")}`).join("\n")}

List only the names of the best fit collaborators in an array.`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are an expert event matcher AI." },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
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
        // Try to parse as JSON
        return JSON.parse(content);
      } catch (parseError) {
        // If parsing fails, extract names manually using regex
        console.log("Received non-JSON response, extracting names manually");
        const nameMatches = content.match(/["']([^"']+)["']/g) || [];
        return nameMatches.map(match => match.replace(/["']/g, ''));
      }
    } else {
      console.error("Unexpected response structure:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching OpenAI suggestions:", error);
    return [];
  }
}

/**
 * Get recommended events for a single user profile
 * @param userProfile The current user's profile
 * @returns Array of recommended events
 */
export async function getRecommendedEventsForUser(userProfile: Collaborator): Promise<Event[]> {
  try {
    // Read all events from database
    const events = await readEvents();
    if (!events.length) {
      return [];
    }

    const recommendedEvents: Event[] = [];
    
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

    return recommendedEvents;
  } catch (error) {
    console.error("Error getting recommended events:", error);
    return [];
  }
}

// Run script manually
if (require.main === module) {
  (async () => {
    await checkFiles();
    const { events, collaborators } = await readFiles();
    console.log("Matching events with collaborators...");

    const suggestions = [];
    for (const event of events) {
      const matchedCollaborators = await getOpenAISuggestions(event, collaborators);
      suggestions.push({ event: event.name, collaborators: matchedCollaborators });
      console.log(`Event: ${event.name}`);
      console.log(`Suggested Collaborators: ${matchedCollaborators.join(", ")}`);
      console.log("---------------------------------");
    }

    // Write suggestions to suggestions.json
    try {
      await fs.writeFile(suggestionsPath, JSON.stringify(suggestions, null, 2), "utf-8");
      console.log("Suggestions saved to suggestions.json");
    } catch (error) {
      console.error("Error writing suggestions.json:", error);
    }
  })();
}
