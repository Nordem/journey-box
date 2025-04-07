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
    hobbiesAndInterests: string[];
    additionalInfo: string;
    nearestAirport: string;
  };
  eventPreferences: {
    categories: string[];
    vibeKeywords: string[];
    idealTimeSlots: string[];
    budget: string;
    preferredGroupType: string[];
    preferredEventSize: string[];
    maxDistanceKm: number;
    preferredExperiences: string[];
    preferredDestinations: string[];
    seasonalPreferences: string[];
    groupSizePreference: string[];
    blockedDates: string[];
    teamBuildingPrefs?: {
      preferredActivities: string[];
      location: string;
      duration: string;
      suggestions: string[];
    };
  };
  restrictions?: {
    avoidCrowdedDaytimeConferences: boolean;
    avoidOverlyFormalNetworking: boolean;
    avoidFamilyKidsEvents: boolean;
  };
  calendarAvailability?: Record<string, string>;
}

export interface RecommendedEvent extends Event {
  matchScore: number;
  matchReasons: string[];
}

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function makeOpenAIRequest(prompt: string, retryCount = 0): Promise<OpenAIResponse> {
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
          { 
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 4000
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      
      // Handle quota exceeded error
      if (error.response?.status === 429 && errorMessage.includes("quota")) {
        throw new Error("OpenAI API quota exceeded. Please check your billing details or contact support.");
      }
      
      // Handle rate limiting
      if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Rate limited. Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeOpenAIRequest(prompt, retryCount + 1);
      }
      
      throw new Error(`OpenAI API error: ${error.response?.status} - ${errorMessage}`);
    }
    throw error;
  }
}

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

    const prompt = `Analyze these events and determine which ones are good matches for the user based on their profile and preferences.

Available Events:
${eventsList}

User Profile:
- Name: ${userProfile.userProfile.name || "Not specified"}
- Location: ${userProfile.userProfile.location || "Not specified"}
- Current Travel Location: ${userProfile.userProfile.currentTravelLocation || "Not specified"}
- Languages: ${userProfile.userProfile.languages?.join(", ") || "Not specified"}
- Personality Traits: ${userProfile.userProfile.personalityTraits?.join(", ") || "Not specified"}
- Hobbies and Interests: ${userProfile.userProfile.hobbiesAndInterests?.join(", ") || "Not specified"}
- Goals: ${userProfile.userProfile.goals?.join(", ") || "Not specified"}
- Additional Info: ${userProfile.userProfile.additionalInfo || "None"}
- Nearest Airport: ${userProfile.userProfile.nearestAirport || "Not specified"}

Event Preferences:
- Preferred Experiences: ${userProfile.eventPreferences.preferredExperiences?.join(", ") || "Not specified"}
- Preferred Destinations: ${userProfile.eventPreferences.preferredDestinations?.join(", ") || "Not specified"}
- Seasonal Preferences: ${userProfile.eventPreferences.seasonalPreferences?.join(", ") || "Not specified"}
- Group Size Preference: ${userProfile.eventPreferences.groupSizePreference?.join(", ") || "Not specified"}
- Blocked Dates: ${userProfile.eventPreferences.blockedDates?.join(", ") || "None"}
- Categories: ${userProfile.eventPreferences.categories?.join(", ") || "Not specified"}
- Vibe Keywords: ${userProfile.eventPreferences.vibeKeywords?.join(", ") || "Not specified"}
- Budget: ${userProfile.eventPreferences.budget || "Not specified"}

Team Building Preferences:
- Preferred Activities: ${userProfile.eventPreferences.teamBuildingPrefs?.preferredActivities?.join(", ") || "None"}
- Location Preference: ${userProfile.eventPreferences.teamBuildingPrefs?.location || "Not specified"}
- Duration Preference: ${userProfile.eventPreferences.teamBuildingPrefs?.duration || "Not specified"}
- Additional Suggestions: ${userProfile.eventPreferences.teamBuildingPrefs?.suggestions?.join(", ") || "None"}

Other Information:
- Restrictions: ${userProfile.restrictions ? Object.entries(userProfile.restrictions).map(([key, val]) => `${key}: ${val}`).join(", ") : "None"}
- Calendar Availability: ${userProfile.calendarAvailability ? Object.entries(userProfile.calendarAvailability).map(([date, status]) => `${date}: ${status}`).join(", ") : "None"}

For each event, provide a match score (0-100) and specific reasons why it matches or doesn't match.
Format your response as JSON: { "matches": [{ "eventName": string, "isMatch": boolean, "score": number, "reasons": string[] }] }`;

    try {
      const openaiData = await makeOpenAIRequest(prompt);

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
    } catch (error) {
      // If OpenAI API fails, return a basic recommendation based on category matching
      console.warn("OpenAI API unavailable, falling back to basic recommendations");
      events.forEach((event: Event) => {
        const categoryMatch = userProfile.eventPreferences.categories?.includes(event.category_id || '');
        const activityMatch = event.activities.some(activity => 
          userProfile.eventPreferences.preferredExperiences?.includes(activity)
        );
        
        if (categoryMatch || activityMatch) {
          recommendedEvents.push({
            ...event,
            matchScore: categoryMatch && activityMatch ? 80 : 60,
            matchReasons: [
              categoryMatch ? "Category matches user preferences" : "",
              activityMatch ? "Activities match user preferences" : ""
            ].filter(Boolean)
          });
        }
      });
    }

    return recommendedEvents.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error("Error in getRecommendedEvents:", error);
    return [];
  }
}
